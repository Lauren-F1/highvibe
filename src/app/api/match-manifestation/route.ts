import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { matchManifestation, type MatchInput } from '@/ai/flows/match-manifestation';
import { sendEmail } from '@/lib/email';
import { buildProviderOpportunityEmail } from '@/lib/notification-emails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // AI matching can take time

/**
 * POST /api/match-manifestation
 *
 * Runs AI matching for a manifestation against all eligible providers.
 * Called fire-and-forget after manifestation submission.
 *
 * Body: { manifestationId: string }
 */
export async function POST(request: Request) {
  try {
    const uid = await verifyAuthToken(request);
    const { manifestationId } = await request.json();

    if (!manifestationId) {
      return NextResponse.json({ error: 'Missing manifestationId' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // Load manifestation
    const manifestationRef = db.collection('manifestations').doc(manifestationId);
    const manifestationSnap = await manifestationRef.get();

    if (!manifestationSnap.exists) {
      return NextResponse.json({ error: 'Manifestation not found' }, { status: 404 });
    }

    const manifestation = manifestationSnap.data()!;

    // Verify ownership
    if (manifestation.seeker_id !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status to matching
    await manifestationRef.update({ status: 'matching', updated_at: FieldValue.serverTimestamp() });

    // Load all providers by role
    const [guidesSnap, hostsSnap, vendorsSnap] = await Promise.all([
      db.collection('users').where('roles', 'array-contains', 'guide').get(),
      db.collection('users').where('roles', 'array-contains', 'host').get(),
      db.collection('users').where('roles', 'array-contains', 'vendor').get(),
    ]);

    // Serialize provider profiles for AI
    const providers: MatchInput['providers'] = [];

    for (const doc of guidesSnap.docs) {
      if (doc.id === uid) continue; // Don't match seeker with themselves
      const d = doc.data();
      providers.push({
        id: doc.id,
        role: 'guide',
        displayName: d.displayName || 'Unknown Guide',
        location: d.locationLabel || '',
        specialties: (d.guideRetreatTypes || []).join(', '),
        bio: d.headline || d.bio || '',
      });
    }

    for (const doc of hostsSnap.docs) {
      if (doc.id === uid) continue;
      const d = doc.data();
      providers.push({
        id: doc.id,
        role: 'host',
        displayName: d.displayName || 'Unknown Host',
        location: d.locationLabel || '',
        specialties: d.hostVibe || '',
        capacity: d.typicalCapacity || undefined,
        bio: d.headline || d.bio || '',
      });
    }

    for (const doc of vendorsSnap.docs) {
      if (doc.id === uid) continue;
      const d = doc.data();
      providers.push({
        id: doc.id,
        role: 'vendor',
        displayName: d.displayName || 'Unknown Vendor',
        location: d.locationLabel || '',
        specialties: (d.vendorCategories || []).join(', '),
        bio: d.headline || d.bio || '',
      });
    }

    if (providers.length === 0) {
      await manifestationRef.update({
        status: 'proposals_open',
        matched_summary_counts: { guides: 0, hosts: 0, vendors: 0 },
        updated_at: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, matches: 0, message: 'No providers available for matching' });
    }

    // Run AI matching
    const result = await matchManifestation({
      manifestation: {
        destination_country: manifestation.destination?.country || '',
        destination_region: manifestation.destination?.region || undefined,
        retreat_types: manifestation.retreat_types || [],
        must_haves: manifestation.must_haves || [],
        nice_to_haves: manifestation.nice_to_haves || [],
        group_size: manifestation.group_size || 1,
        lodging_preference: manifestation.lodging_preference || undefined,
        luxury_tier: manifestation.luxury_tier || undefined,
        budget_range: manifestation.budget_range || undefined,
        notes_text: manifestation.notes_text || undefined,
      },
      providers,
    });

    // Filter matches with score >= 40, keep top 10
    const topMatches = (result.matches || [])
      .filter(m => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Batch write matches to Firestore
    const batch = db.batch();
    const matchCounts = { guides: 0, hosts: 0, vendors: 0 };

    for (const match of topMatches) {
      const matchRef = db.collection('matches').doc();
      batch.set(matchRef, {
        manifestation_id: manifestationId,
        seeker_id: uid,
        provider_id: match.providerId,
        provider_role: match.providerRole,
        score: match.score,
        score_breakdown: {
          retreat_type_alignment: match.scoreBreakdown.retreatTypeAlignment,
          location_match: match.scoreBreakdown.locationMatch,
          capacity_fit: match.scoreBreakdown.capacityFit,
          vibe_compatibility: match.scoreBreakdown.vibeCompatibility,
        },
        match_reason: match.matchReason,
        status: 'pending',
        created_at: FieldValue.serverTimestamp(),
        notified_at: null,
      });

      if (match.providerRole === 'guide') matchCounts.guides++;
      else if (match.providerRole === 'host') matchCounts.hosts++;
      else if (match.providerRole === 'vendor') matchCounts.vendors++;
    }

    // Update manifestation status
    batch.update(manifestationRef, {
      status: 'proposals_open',
      matched_summary_counts: matchCounts,
      updated_at: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Send notifications to matched providers (non-blocking)
    const destination = [manifestation.destination?.country, manifestation.destination?.region].filter(Boolean).join(', ');
    const retreatTypes = (manifestation.retreat_types || []).join(', ');

    for (const match of topMatches) {
      try {
        const providerDoc = await db.collection('users').doc(match.providerId).get();
        if (!providerDoc.exists) continue;

        const providerData = providerDoc.data()!;
        const providerName = providerData.displayName || 'there';
        const providerEmail = providerData.email;

        // Create in-app notification
        await db.collection('notifications').add({
          userId: match.providerId,
          type: 'manifestation_match',
          title: 'New Retreat Opportunity!',
          body: `A seeker is looking for ${retreatTypes || 'a retreat'} in ${destination || 'an exciting destination'}. You scored ${match.score}% match!`,
          linkUrl: `/seeker/manifestations/${manifestationId}`,
          read: false,
          emailSent: false,
          createdAt: FieldValue.serverTimestamp(),
          metadata: { manifestationId, matchScore: match.score },
        });

        // Send email if provider has notifications enabled
        if (providerEmail && providerData.email_notifications_enabled !== false && providerData.notify_manifestation_matches !== false) {
          try {
            const emailContent = buildProviderOpportunityEmail({
              recipientName: providerName,
              destination: destination || 'an exciting destination',
              retreatTypes: retreatTypes || 'wellness retreat',
              groupSize: manifestation.group_size || 0,
              matchScore: match.score,
              manifestationId,
            });
            await sendEmail({
              to: providerEmail,
              subject: 'New Retreat Opportunity on HighVibe!',
              html: emailContent.html,
              text: emailContent.text,
            });
          } catch (emailErr) {
            console.error(`[MATCH] Email to provider ${match.providerId} failed:`, emailErr);
          }
        }
      } catch (notifErr) {
        console.error(`[MATCH] Notification to provider ${match.providerId} failed:`, notifErr);
      }
    }

    console.log(`[MATCH] Manifestation ${manifestationId}: ${topMatches.length} matches found (${matchCounts.guides}G/${matchCounts.hosts}H/${matchCounts.vendors}V)`);

    return NextResponse.json({
      success: true,
      matches: topMatches.length,
      counts: matchCounts,
    });
  } catch (error: any) {
    console.error('[MATCH] Error:', error);
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}
