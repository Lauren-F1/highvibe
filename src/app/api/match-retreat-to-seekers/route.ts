import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { scoreRetreatMatch, type RetreatForScoring, type ManifestationForScoring } from '@/lib/retreat-relevance';
import { sendEmail } from '@/lib/email';
import { buildRetreatAvailableEmail } from '@/lib/notification-emails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/match-retreat-to-seekers
 *
 * Called fire-and-forget when a retreat transitions to "published".
 * Finds open manifestations that match the retreat and notifies seekers.
 *
 * Body: { retreatId: string }
 */
export async function POST(request: Request) {
  try {
    // Simple auth: CRON_SECRET or internal call
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { retreatId } = await request.json();
    if (!retreatId) {
      return NextResponse.json({ error: 'Missing retreatId' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // Load retreat
    const retreatDoc = await db.collection('retreats').doc(retreatId).get();
    if (!retreatDoc.exists) {
      return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
    }
    const retreat = retreatDoc.data()!;

    const retreatForScoring: RetreatForScoring = {
      type: retreat.type,
      locationDescription: retreat.locationDescription,
      destination: retreat.destination,
      costPerPerson: retreat.costPerPerson,
      capacity: retreat.capacity,
      luxuryTier: retreat.luxuryTier,
      lodgingPreference: retreat.lodgingPreference,
    };

    // Query open manifestations
    const openStatuses = ['submitted', 'matching', 'proposals_open'];
    const manifestationSnap = await db.collection('manifestations')
      .where('status', 'in', openStatuses)
      .get();

    const matches: { seekerId: string; score: number; manifestationId: string }[] = [];

    for (const mDoc of manifestationSnap.docs) {
      const m = mDoc.data();
      // Don't notify the seeker who created this retreat (via proposal accept)
      if (m.seekerId === retreat.seekerId) continue;

      const mForScoring: ManifestationForScoring = {
        retreat_types: m.retreat_types,
        destination: m.destination,
        budget_range: m.budget_range,
        group_size: m.group_size,
        luxury_tier: m.luxury_tier,
        lodging_preference: m.lodging_preference,
      };

      const score = scoreRetreatMatch(retreatForScoring, mForScoring);
      if (score >= 40) {
        matches.push({ seekerId: m.seekerId, score, manifestationId: mDoc.id });
      }
    }

    // Sort by score descending, take top 20
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 20);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';
    let notified = 0;

    for (const match of topMatches) {
      try {
        // Create in-app notification
        await db.collection('notifications').add({
          userId: match.seekerId,
          type: 'retreat_match',
          title: 'A retreat match has been found',
          body: `"${retreat.title}" in ${retreat.locationDescription || 'a beautiful destination'} — $${retreat.costPerPerson || 0}/person. ${match.score}% match with your preferences.`,
          linkUrl: `/retreats/${retreatId}`,
          read: false,
          emailSent: false,
          createdAt: FieldValue.serverTimestamp(),
          metadata: { retreatId, matchScore: match.score, manifestationId: match.manifestationId },
        });

        // Send email
        const userDoc = await db.collection('users').doc(match.seekerId).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          if (userData.email && userData.email_notifications_enabled !== false) {
            const { html, text } = buildRetreatAvailableEmail({
              recipientName: userData.displayName || 'there',
              retreatTitle: retreat.title || 'A new retreat',
              destination: retreat.locationDescription || '',
              price: retreat.costPerPerson || 0,
              spotsRemaining: retreat.spotsRemaining,
              retreatId,
            });
            await sendEmail({
              to: userData.email,
              subject: 'A retreat match has been found',
              html,
              text,
            });
          }
        }
        notified++;
      } catch (e) {
        console.error(`[REVERSE_MATCH] Failed to notify seeker ${match.seekerId}:`, e);
      }
    }

    console.log(`[REVERSE_MATCH] Retreat ${retreatId}: scored ${manifestationSnap.size} manifestations, notified ${notified} seekers`);

    return NextResponse.json({ matched: topMatches.length, notified });
  } catch (error) {
    console.error('[REVERSE_MATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
