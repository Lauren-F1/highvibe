import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import { scoutLocalHosts } from '@/ai/flows/scout-local-hosts';
import { scoutLocalVendors } from '@/ai/flows/scout-local-vendors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Re-scouting can take a while

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

/**
 * POST /api/scout/re-scout
 *
 * Re-runs scouting for manifestations that are still in proposals_open status
 * with fewer than 3 provider matches. Protected by CRON_SECRET.
 * Should be called by a weekly cron job.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db, FieldValue } = await getFirebaseAdmin();

  try {
    // Find manifestations that are still open with few matches
    const manifestationsSnap = await db.collection('manifestations')
      .where('status', '==', 'proposals_open')
      .limit(20)
      .get();

    if (manifestationsSnap.empty) {
      return NextResponse.json({ message: 'No manifestations need re-scouting', processed: 0 });
    }

    let processed = 0;
    let totalContacted = 0;

    for (const manifestDoc of manifestationsSnap.docs) {
      const manifestation = manifestDoc.data();
      const manifestationId = manifestDoc.id;

      // Check match count
      const matchesSnap = await db.collection('matches')
        .where('manifestation_id', '==', manifestationId)
        .get();

      // Skip if already has enough matches
      if (matchesSnap.size >= 3) continue;

      // Skip if already re-scouted recently (within 7 days)
      const lastScout = manifestation.last_rescout_at?.toDate?.();
      if (lastScout && Date.now() - lastScout.getTime() < 7 * 24 * 60 * 60 * 1000) continue;

      const scoutLocation = [manifestation.destination?.region, manifestation.destination?.country].filter(Boolean).join(', ');
      if (!scoutLocation) continue;

      let vendorsContacted = 0;
      let hostsContacted = 0;

      const counts = manifestation.matched_summary_counts || { guides: 0, hosts: 0, vendors: 0 };

      // Scout hosts if still needed
      if (counts.hosts === 0) {
        try {
          const lodgingType = manifestation.lodging_preference || 'Retreat Center';
          const hostResults = await scoutLocalHosts({
            location: scoutLocation,
            accommodationType: lodgingType,
            retreatDescription: manifestation.notes_text || undefined,
            groupSize: manifestation.group_size || undefined,
          });

          for (const host of hostResults.hosts) {
            if (!host.email) continue;
            const existingSnap = await db.collection('scout_outreach')
              .where('vendorEmail', '==', host.email.toLowerCase())
              .limit(1)
              .get();
            if (!existingSnap.empty) continue;

            const signupUrl = `${BASE_URL}/join/host?ref=scout&source=${encodeURIComponent(host.email)}`;
            const unsubscribeUrl = `${BASE_URL}/api/scout/unsubscribe?email=${encodeURIComponent(host.email)}`;

            try {
              await sendEmail({
                to: host.email,
                subject: `Partnership opportunity: Wellness retreats at ${host.name}`,
                html: `<p>Hi ${host.name},</p><p>A retreat leader on HighVibe Retreats is looking for a venue in ${scoutLocation}. We think your property could be a great fit.</p><p><a href="${signupUrl}">Learn more</a></p><p style="font-size:12px;color:#999;"><a href="${unsubscribeUrl}">Unsubscribe</a></p>`,
                text: `Hi ${host.name}, a retreat leader is looking for a venue in ${scoutLocation}. Learn more: ${signupUrl}`,
              });

              await db.collection('scout_outreach').add({
                vendorEmail: host.email.toLowerCase(),
                vendorName: host.name,
                vendorCategory: lodgingType,
                location: scoutLocation,
                manifestationId,
                outreachType: 'host',
                source: 'weekly_rescout',
                status: 'sent',
                sentAt: new Date(),
              });
              hostsContacted++;
            } catch (err) {
              console.error(`[RE-SCOUT] Failed to email host ${host.name}:`, err);
            }
          }
        } catch (err) {
          console.error(`[RE-SCOUT] Host scout failed for ${manifestationId}:`, err);
        }
      }

      // Scout vendors if still needed
      if (counts.vendors === 0) {
        try {
          const mustHaves = [...(manifestation.must_haves || []), ...(manifestation.amenities || [])];
          // Simple category extraction
          const categories: string[] = [];
          const lower = mustHaves.join(' ').toLowerCase();
          if (lower.includes('yoga')) categories.push('Yoga Instructor');
          if (lower.includes('massage') || lower.includes('spa')) categories.push('Spa Services');
          if (lower.includes('food') || lower.includes('chef') || lower.includes('catering')) categories.push('Catering');
          if (lower.includes('photo') || lower.includes('video')) categories.push('Photography');
          if (categories.length === 0) categories.push('Wellness Services');

          for (const category of categories.slice(0, 2)) {
            try {
              const vendorResults = await scoutLocalVendors({
                location: scoutLocation,
                category,
                retreatDescription: manifestation.notes_text || undefined,
              });

              for (const vendor of vendorResults.vendors) {
                if (!vendor.email) continue;
                const existingSnap = await db.collection('scout_outreach')
                  .where('vendorEmail', '==', vendor.email.toLowerCase())
                  .limit(1)
                  .get();
                if (!existingSnap.empty) continue;

                const signupUrl = `${BASE_URL}/join/vendor?ref=scout&source=${encodeURIComponent(vendor.email)}`;
                const unsubscribeUrl = `${BASE_URL}/api/scout/unsubscribe?email=${encodeURIComponent(vendor.email)}`;

                try {
                  await sendEmail({
                    to: vendor.email,
                    subject: `A retreat leader needs ${category} services in ${scoutLocation}`,
                    html: `<p>Hi ${vendor.name},</p><p>A retreat leader on HighVibe Retreats is looking for ${category} services in ${scoutLocation}. Based on your business, we think you'd be a great fit.</p><p><a href="${signupUrl}">Learn more</a></p><p style="font-size:12px;color:#999;"><a href="${unsubscribeUrl}">Unsubscribe</a></p>`,
                    text: `Hi ${vendor.name}, a retreat leader needs ${category} services in ${scoutLocation}. Learn more: ${signupUrl}`,
                  });

                  await db.collection('scout_outreach').add({
                    vendorEmail: vendor.email.toLowerCase(),
                    vendorName: vendor.name,
                    vendorCategory: category,
                    location: scoutLocation,
                    manifestationId,
                    outreachType: 'vendor',
                    source: 'weekly_rescout',
                    status: 'sent',
                    sentAt: new Date(),
                  });
                  vendorsContacted++;
                } catch (err) {
                  console.error(`[RE-SCOUT] Failed to email vendor ${vendor.name}:`, err);
                }
              }
            } catch (err) {
              console.error(`[RE-SCOUT] Vendor scout for "${category}" failed:`, err);
            }
          }
        } catch (err) {
          console.error(`[RE-SCOUT] Vendor scout failed for ${manifestationId}:`, err);
        }
      }

      // Update manifestation
      if (hostsContacted + vendorsContacted > 0) {
        await manifestDoc.ref.update({
          last_rescout_at: FieldValue.serverTimestamp(),
          auto_scout_triggered: true,
          auto_scout_results: {
            vendors_contacted: (manifestation.auto_scout_results?.vendors_contacted || 0) + vendorsContacted,
            hosts_contacted: (manifestation.auto_scout_results?.hosts_contacted || 0) + hostsContacted,
          },
          updated_at: FieldValue.serverTimestamp(),
        });
        totalContacted += hostsContacted + vendorsContacted;
      } else {
        await manifestDoc.ref.update({
          last_rescout_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        });
      }

      processed++;
    }

    console.log(`[RE-SCOUT] Processed ${processed} manifestations, contacted ${totalContacted} providers`);
    return NextResponse.json({ processed, totalContacted });
  } catch (error) {
    console.error('[RE-SCOUT] Error:', error);
    return NextResponse.json({ error: 'Re-scout failed' }, { status: 500 });
  }
}
