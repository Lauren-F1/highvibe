import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';
import { matchManifestation, type MatchInput } from '@/ai/flows/match-manifestation';
import { sendEmail } from '@/lib/email';
import { buildProviderOpportunityEmail, buildManifestationMatchEmail } from '@/lib/notification-emails';
import { scoutLocalVendors } from '@/ai/flows/scout-local-vendors';
import { scoutLocalHosts } from '@/ai/flows/scout-local-hosts';
import { submitContactForm } from '@/ai/flows/submit-contact-form';

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

    // ─── Feature 1: Match against existing retreats FIRST ───

    const retreatMatches: Array<{
      retreatId: string;
      title: string;
      score: number;
      destination: string;
      price: number;
    }> = [];

    try {
      const retreatsSnap = await db.collection('retreats').get();
      const manifestationCountry = (manifestation.destination?.country || '').toLowerCase();
      const manifestationTypes: string[] = (manifestation.retreat_types || []).map((t: string) => t.toLowerCase());
      const manifestationGroupSize = manifestation.group_size || 1;

      for (const retreatDoc of retreatsSnap.docs) {
        const retreat = retreatDoc.data();
        const retreatStatus = (retreat.status || '').toLowerCase();

        // Skip cancelled or completed retreats
        if (retreatStatus === 'cancelled' || retreatStatus === 'completed') continue;

        let score = 0;

        // +30 if retreat types overlap
        const rTypes: string[] = (retreat.retreat_types || retreat.retreatTypes || []).map((t: string) => t.toLowerCase());
        const typesOverlap = manifestationTypes.some((mt: string) => rTypes.includes(mt));
        if (typesOverlap) score += 30;

        // +30 if destination country matches
        const retreatCountry = (retreat.destination?.country || retreat.location?.country || retreat.country || '').toLowerCase();
        if (manifestationCountry && retreatCountry && retreatCountry === manifestationCountry) score += 30;

        // +20 if group size fits (retreat capacity >= manifestation group_size)
        const retreatCapacity = retreat.capacity || retreat.maxCapacity || retreat.max_participants || 0;
        if (retreatCapacity >= manifestationGroupSize) score += 20;

        // +20 if not fully booked
        const currentBookings = retreat.current_bookings || retreat.bookings_count || 0;
        const isFullyBooked = retreatCapacity > 0 && currentBookings >= retreatCapacity;
        if (!isFullyBooked) score += 20;

        if (score >= 40) {
          const retreatDestination = [
            retreat.destination?.country || retreat.location?.country || retreat.country || '',
            retreat.destination?.region || retreat.location?.region || '',
          ].filter(Boolean).join(', ');

          retreatMatches.push({
            retreatId: retreatDoc.id,
            title: retreat.title || retreat.name || 'Untitled Retreat',
            score,
            destination: retreatDestination,
            price: retreat.price || retreat.price_per_person || 0,
          });
        }
      }

      // Sort by score desc, keep top 5
      retreatMatches.sort((a, b) => b.score - a.score);
      retreatMatches.splice(5);

      // Store retreat matches on the manifestation document
      if (retreatMatches.length > 0) {
        await manifestationRef.update({
          retreat_matches: retreatMatches,
          updated_at: FieldValue.serverTimestamp(),
        });
      }
    } catch (retreatMatchErr) {
      console.error('[MATCH] Retreat matching step failed (continuing with provider matching):', retreatMatchErr);
    }

    // ─── Provider AI matching ───

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
      return NextResponse.json({ success: true, matches: 0, retreatMatches: retreatMatches.length, message: 'No providers available for matching' });
    }

    // Run AI matching
    const result = await matchManifestation({
      manifestation: {
        destination_country: manifestation.destination?.country || '',
        destination_region: manifestation.destination?.region || undefined,
        retreat_types: manifestation.retreat_types || [],
        must_haves: manifestation.must_haves || [],
        nice_to_haves: manifestation.nice_to_haves || [],
        amenities: manifestation.amenities || manifestation.must_haves || [],
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
          body: `Someone is dreaming of a ${retreatTypes || 'wellness'} retreat in ${destination || 'an exciting destination'} and we think you'd be a great fit. Take a look at the details and see if you'd like to make a connection.`,
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

    // ─── Feature 2: Notify the SEEKER about their matches ───

    const totalProviderMatches = topMatches.length;

    try {
      const seekerDoc = await db.collection('users').doc(uid).get();
      const seekerData = seekerDoc.exists ? seekerDoc.data()! : null;
      const seekerName = seekerData?.displayName || 'there';
      const seekerEmail = seekerData?.email;

      // In-app notification for the seeker
      await db.collection('notifications').add({
        userId: uid,
        type: 'manifestation_matches_ready',
        title: 'We found matches for your retreat!',
        body: `We've identified ${totalProviderMatches} provider${totalProviderMatches === 1 ? '' : 's'} who could help bring your ${destination || 'dream'} retreat to life. Check out their profiles to see if they're the right fit.`,
        linkUrl: `/seeker/manifestations/${manifestationId}`,
        read: false,
        emailSent: false,
        createdAt: FieldValue.serverTimestamp(),
        metadata: { manifestationId, providerMatchCount: totalProviderMatches, retreatMatchCount: retreatMatches.length },
      });

      // Email the seeker
      if (seekerEmail && seekerData?.email_notifications_enabled !== false) {
        try {
          const matchDescription = `We've identified ${totalProviderMatches} provider${totalProviderMatches === 1 ? '' : 's'} who could help bring your ${destination || 'dream'} retreat to life.${retreatMatches.length > 0 ? ` We also found ${retreatMatches.length} existing retreat${retreatMatches.length === 1 ? '' : 's'} that might be a great fit.` : ''} Check out their profiles to see if they're the right fit.`;
          const emailContent = buildManifestationMatchEmail({
            recipientName: seekerName,
            matchDescription,
          });
          await sendEmail({
            to: seekerEmail,
            subject: 'We found matches for your retreat!',
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (emailErr) {
          console.error(`[MATCH] Email to seeker ${uid} failed:`, emailErr);
        }
      }
    } catch (seekerNotifErr) {
      console.error(`[MATCH] Seeker notification failed:`, seekerNotifErr);
    }

    console.log(`[MATCH] Manifestation ${manifestationId}: ${topMatches.length} provider matches, ${retreatMatches.length} retreat matches (${matchCounts.guides}G/${matchCounts.hosts}H/${matchCounts.vendors}V)`);

    // =============================================
    // AUTO-SCOUT: When not enough internal matches,
    // reach out to external providers in the area
    // =============================================
    if (topMatches.length < 3) {
      try {
        console.log(`[AUTO-SCOUT] Triggered for manifestation ${manifestationId} — only ${topMatches.length} internal matches`);

        const scoutLocation = [manifestation.destination?.region, manifestation.destination?.country].filter(Boolean).join(', ');
        let vendorsContacted = 0;
        let hostsContacted = 0;

        // Determine which roles are missing
        const hasHostMatches = matchCounts.hosts > 0;
        const hasVendorMatches = matchCounts.vendors > 0;

        // --- Scout for hosts if none matched ---
        if (!hasHostMatches && scoutLocation) {
          try {
            console.log(`[AUTO-SCOUT] Scouting hosts in ${scoutLocation}`);
            const lodgingType = manifestation.lodging_preference || 'Retreat Center';
            const hostResults = await scoutLocalHosts({
              location: scoutLocation,
              accommodationType: lodgingType,
              retreatDescription: manifestation.notes_text || undefined,
              groupSize: manifestation.group_size || undefined,
            });

            for (const host of hostResults.hosts) {
              try {
                if (host.email) {
                  // Check if already contacted
                  const existingSnap = await db.collection('scout_outreach')
                    .where('vendorEmail', '==', host.email.toLowerCase())
                    .where('status', 'in', ['sent', 'followed_up', 'signed_up'])
                    .limit(1)
                    .get();
                  if (!existingSnap.empty) continue;

                  // Build and send host outreach email
                  const signupUrl = `https://highviberetreats.com/join/host?ref=scout&source=${encodeURIComponent(host.email)}`;
                  const unsubscribeUrl = `https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(host.email)}`;
                  const groupSizeNote = manifestation.group_size
                    ? `This particular retreat would bring approximately <strong>${manifestation.group_size} guests</strong> for a multi-night stay.`
                    : 'Retreat leaders typically book blocks of rooms for multi-night group stays.';

                  const subject = `Partnership opportunity: Wellness retreats at ${host.name}`;
                  const emailHtml = buildHostOutreachHtml(host.name, scoutLocation, lodgingType, groupSizeNote, signupUrl, unsubscribeUrl);
                  const emailText = buildHostOutreachText(host.name, scoutLocation, lodgingType, manifestation.group_size, signupUrl, unsubscribeUrl);

                  await sendEmail({ to: host.email, subject, html: emailHtml, text: emailText });

                  await db.collection('scout_outreach').add({
                    vendorEmail: host.email.toLowerCase(),
                    vendorName: host.name,
                    vendorCategory: lodgingType,
                    location: scoutLocation,
                    guideUserId: null,
                    retreatId: null,
                    manifestationId,
                    outreachType: 'host',
                    source: 'auto_manifestation',
                    groupSize: manifestation.group_size || null,
                    status: 'sent',
                    sentAt: new Date(),
                    openedAt: null,
                    signedUpAt: null,
                  });

                  hostsContacted++;
                  console.log(`[AUTO-SCOUT] Sent host outreach to ${host.name} (${host.email})`);
                } else if (host.website) {
                  // No email found — try contact form submission
                  console.log(`[AUTO-SCOUT] No email for ${host.name}, trying contact form at ${host.website}`);
                  const formResult = await submitContactForm({
                    websiteUrl: host.website,
                    businessName: host.name,
                    businessCategory: lodgingType,
                    location: scoutLocation,
                    outreachType: 'host',
                  });

                  if (formResult.submitted) {
                    await db.collection('scout_outreach').add({
                      vendorEmail: '',
                      vendorName: host.name,
                      vendorCategory: lodgingType,
                      location: scoutLocation,
                      manifestationId,
                      outreachType: 'host',
                      source: 'auto_manifestation',
                      contactMethod: 'form',
                      contactPageUrl: formResult.contactPageUrl,
                      website: host.website,
                      status: 'sent',
                      sentAt: new Date(),
                    });
                    hostsContacted++;
                    console.log(`[AUTO-SCOUT] Submitted contact form for host ${host.name}`);
                  } else {
                    // Log as manual_needed so admin can follow up
                    await db.collection('scout_outreach').add({
                      vendorEmail: '',
                      vendorName: host.name,
                      vendorCategory: lodgingType,
                      location: scoutLocation,
                      manifestationId,
                      outreachType: 'host',
                      source: 'auto_manifestation',
                      contactMethod: 'none',
                      website: host.website,
                      phone: host.phone,
                      rating: host.rating,
                      relevanceScore: host.relevanceScore,
                      relevanceReason: host.relevanceReason,
                      status: 'manual_needed',
                      sentAt: new Date(),
                      failReason: formResult.reason,
                    });
                    console.log(`[AUTO-SCOUT] Manual follow-up needed for host ${host.name} — ${formResult.reason}`);
                  }
                }
              } catch (hostEmailErr) {
                console.error(`[AUTO-SCOUT] Failed to contact host ${host.name}:`, hostEmailErr);
              }
            }
          } catch (hostScoutErr) {
            console.error(`[AUTO-SCOUT] Host scout failed:`, hostScoutErr);
          }
        }

        // --- Scout for vendors if none matched ---
        if (!hasVendorMatches && scoutLocation) {
          try {
            // Map manifestation must_haves/amenities to vendor categories
            const mustHaves = [...(manifestation.must_haves || []), ...(manifestation.nice_to_haves || [])];
            const vendorCategories = mapToVendorCategories(mustHaves);

            for (const category of vendorCategories) {
              try {
                console.log(`[AUTO-SCOUT] Scouting vendors: ${category} in ${scoutLocation}`);
                const vendorResults = await scoutLocalVendors({
                  location: scoutLocation,
                  category,
                  retreatDescription: manifestation.notes_text || undefined,
                });

                for (const vendor of vendorResults.vendors) {
                  try {
                    if (vendor.email) {
                      // Check if already contacted
                      const existingSnap = await db.collection('scout_outreach')
                        .where('vendorEmail', '==', vendor.email.toLowerCase())
                        .where('status', 'in', ['sent', 'followed_up', 'signed_up'])
                        .limit(1)
                        .get();
                      if (!existingSnap.empty) continue;

                      const signupUrl = `https://highviberetreats.com/join/vendor?ref=scout&source=${encodeURIComponent(vendor.email)}`;
                      const unsubscribeUrl = `https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(vendor.email)}`;

                      const subject = `A retreat leader is looking for ${category} services in ${scoutLocation}`;
                      const emailHtml = buildVendorOutreachHtml(vendor.name, scoutLocation, category, signupUrl, unsubscribeUrl);
                      const emailText = buildVendorOutreachText(vendor.name, scoutLocation, category, signupUrl, unsubscribeUrl);

                      await sendEmail({ to: vendor.email, subject, html: emailHtml, text: emailText });

                      await db.collection('scout_outreach').add({
                        vendorEmail: vendor.email.toLowerCase(),
                        vendorName: vendor.name,
                        vendorCategory: category,
                        location: scoutLocation,
                        guideUserId: null,
                        retreatId: null,
                        manifestationId,
                        outreachType: 'vendor',
                        source: 'auto_manifestation',
                        status: 'sent',
                        sentAt: new Date(),
                        openedAt: null,
                        signedUpAt: null,
                      });

                      vendorsContacted++;
                      console.log(`[AUTO-SCOUT] Sent vendor outreach to ${vendor.name} (${vendor.email})`);
                    } else if (vendor.website) {
                      // No email — try contact form
                      console.log(`[AUTO-SCOUT] No email for ${vendor.name}, trying contact form at ${vendor.website}`);
                      const formResult = await submitContactForm({
                        websiteUrl: vendor.website,
                        businessName: vendor.name,
                        businessCategory: category,
                        location: scoutLocation,
                        outreachType: 'vendor',
                      });

                      if (formResult.submitted) {
                        await db.collection('scout_outreach').add({
                          vendorEmail: '',
                          vendorName: vendor.name,
                          vendorCategory: category,
                          location: scoutLocation,
                          manifestationId,
                          outreachType: 'vendor',
                          source: 'auto_manifestation',
                          contactMethod: 'form',
                          contactPageUrl: formResult.contactPageUrl,
                          website: vendor.website,
                          status: 'sent',
                          sentAt: new Date(),
                        });
                        vendorsContacted++;
                        console.log(`[AUTO-SCOUT] Submitted contact form for vendor ${vendor.name}`);
                      } else {
                        await db.collection('scout_outreach').add({
                          vendorEmail: '',
                          vendorName: vendor.name,
                          vendorCategory: category,
                          location: scoutLocation,
                          manifestationId,
                          outreachType: 'vendor',
                          source: 'auto_manifestation',
                          contactMethod: 'none',
                          website: vendor.website,
                          phone: vendor.phone,
                          rating: vendor.rating,
                          relevanceScore: vendor.relevanceScore,
                          relevanceReason: vendor.relevanceReason,
                          status: 'manual_needed',
                          sentAt: new Date(),
                          failReason: formResult.reason,
                        });
                        console.log(`[AUTO-SCOUT] Manual follow-up needed for vendor ${vendor.name} — ${formResult.reason}`);
                      }
                    }
                  } catch (vendorEmailErr) {
                    console.error(`[AUTO-SCOUT] Failed to contact vendor ${vendor.name}:`, vendorEmailErr);
                  }
                }
              } catch (catScoutErr) {
                console.error(`[AUTO-SCOUT] Vendor scout for "${category}" failed:`, catScoutErr);
              }
            }
          } catch (vendorScoutErr) {
            console.error(`[AUTO-SCOUT] Vendor scout failed:`, vendorScoutErr);
          }
        }

        // Update manifestation with auto-scout results
        const totalContacted = vendorsContacted + hostsContacted;
        if (totalContacted > 0) {
          await manifestationRef.update({
            auto_scout_triggered: true,
            auto_scout_results: {
              vendors_contacted: vendorsContacted,
              hosts_contacted: hostsContacted,
            },
            updated_at: FieldValue.serverTimestamp(),
          });

          // Send seeker notification
          try {
            const seekerDoc = await db.collection('users').doc(uid).get();
            const seekerEmail = seekerDoc.data()?.email;
            const seekerName = seekerDoc.data()?.displayName || 'there';

            await db.collection('notifications').add({
              userId: uid,
              type: 'auto_scout_triggered',
              title: 'Expanding your search',
              body: `We're expanding our search for your ${destination || 'dream'} retreat. We've reached out to ${totalContacted} local provider${totalContacted === 1 ? '' : 's'} who might be able to help.`,
              linkUrl: `/seeker/manifestations/${manifestationId}`,
              read: false,
              emailSent: false,
              createdAt: FieldValue.serverTimestamp(),
              metadata: { manifestationId, vendorsContacted, hostsContacted },
            });

            // Also email the seeker if they have email
            if (seekerEmail) {
              try {
                await sendEmail({
                  to: seekerEmail,
                  subject: 'We\'re expanding your retreat search',
                  html: `<p>Hi ${seekerName},</p><p>We're expanding our search for your ${destination || 'dream'} retreat. We've reached out to ${totalContacted} local provider${totalContacted === 1 ? '' : 's'} who might be able to help bring your vision to life.</p><p>We'll keep you updated as we hear back.</p><p>Warm regards,<br>The HighVibe Retreats Team</p>`,
                  text: `Hi ${seekerName},\n\nWe're expanding our search for your ${destination || 'dream'} retreat. We've reached out to ${totalContacted} local provider${totalContacted === 1 ? '' : 's'} who might be able to help bring your vision to life.\n\nWe'll keep you updated as we hear back.\n\nWarm regards,\nThe HighVibe Retreats Team`,
                });
              } catch (seekerEmailErr) {
                console.error(`[AUTO-SCOUT] Failed to email seeker:`, seekerEmailErr);
              }
            }
          } catch (seekerNotifErr) {
            console.error(`[AUTO-SCOUT] Failed to notify seeker:`, seekerNotifErr);
          }
        }

        // Check for manual-needed records and notify admin
        try {
          const manualSnap = await db.collection('scout_outreach')
            .where('manifestationId', '==', manifestationId)
            .where('status', '==', 'manual_needed')
            .get();

          if (!manualSnap.empty) {
            const manualNames = manualSnap.docs.map(d => d.data().vendorName).join(', ');
            const adminEmail = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',')[0]?.trim();

            if (adminEmail) {
              await sendEmail({
                to: adminEmail,
                subject: `[Scout] ${manualSnap.size} provider${manualSnap.size === 1 ? '' : 's'} need manual outreach`,
                html: `<p>The auto-scout for manifestation <strong>${manifestationId}</strong> found ${manualSnap.size} provider${manualSnap.size === 1 ? '' : 's'} that couldn't be contacted automatically:</p><p><strong>${manualNames}</strong></p><p>These businesses had no public email and no accessible contact form. You can review them and reach out manually.</p><p><a href="https://highviberetreats.com/admin/scout?status=manual_needed">View in Admin Dashboard</a></p>`,
                text: `Auto-scout found ${manualSnap.size} providers needing manual outreach: ${manualNames}. View at https://highviberetreats.com/admin/scout?status=manual_needed`,
              });
              console.log(`[AUTO-SCOUT] Sent admin notification for ${manualSnap.size} manual-needed contacts`);
            }
          }
        } catch (adminNotifErr) {
          console.error(`[AUTO-SCOUT] Failed to notify admin of manual-needed:`, adminNotifErr);
        }

        console.log(`[AUTO-SCOUT] Complete for ${manifestationId}: ${hostsContacted} hosts, ${vendorsContacted} vendors contacted`);
      } catch (autoScoutErr) {
        // Auto-scout is best-effort — never fail the main response
        console.error(`[AUTO-SCOUT] Fatal error for manifestation ${manifestationId}:`, autoScoutErr);
      }
    }

    return NextResponse.json({
      success: true,
      matches: topMatches.length,
      retreatMatches: retreatMatches.length,
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

// =============================================
// Helper functions for auto-scout outreach
// =============================================

/**
 * Maps manifestation must_haves / nice_to_haves to vendor search categories.
 * Returns deduplicated list of vendor categories to scout.
 */
function mapToVendorCategories(items: string[]): string[] {
  const categoryMap: Record<string, string> = {
    'chef': 'Catering', 'catering': 'Catering', 'meals': 'Catering', 'food': 'Catering',
    'cuisine': 'Catering', 'dining': 'Catering', 'cook': 'Catering', 'plant-based': 'Catering',
    'vegan': 'Catering', 'organic': 'Catering', 'farm-to-table': 'Catering',
    'photo': 'Photography', 'videograph': 'Photography', 'video': 'Photography',
    'film': 'Photography', 'content creation': 'Photography',
    'sound': 'Sound Healing', 'music': 'Sound Healing', 'sound bath': 'Sound Healing',
    'gong': 'Sound Healing', 'singing bowl': 'Sound Healing',
    'massage': 'Massage Therapy', 'spa': 'Spa Services', 'reiki': 'Energy Healing',
    'acupuncture': 'Acupuncture', 'breathwork': 'Breathwork Facilitator',
    'yoga': 'Yoga Instructor', 'pilates': 'Pilates Instructor',
    'fitness': 'Fitness Instructor', 'dance': 'Dance Instructor',
    'hiking': 'Adventure Guide', 'surfing': 'Surf Instructor',
    'adventure': 'Adventure Guide', 'excursion': 'Tour Guide', 'tour': 'Tour Guide',
    'transport': 'Transportation', 'shuttle': 'Transportation',
    'airport': 'Transportation', 'transfer': 'Transportation',
    'floral': 'Floral Design', 'flowers': 'Floral Design',
    'decor': 'Event Decor', 'decoration': 'Event Decor',
  };

  const matched = new Set<string>();
  for (const item of items) {
    const lower = item.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lower.includes(keyword)) {
        matched.add(category);
      }
    }
  }
  return Array.from(matched);
}

function buildVendorOutreachHtml(vendorName: string, location: string, category: string, signupUrl: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 40px;text-align:center;background:#1a1a1a;">
          <h1 style="margin:0;color:#f5f0eb;font-size:24px;letter-spacing:0.15em;">HIGHVIBE RETREATS</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${vendorName},</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">We're reaching out from <strong>HighVibe Retreats</strong>. A retreat leader on our platform is planning a retreat in <strong>${location}</strong> and is looking for <strong>${category}</strong> services. Based on your business profile, we think you could be a great fit.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">We wanted to take a moment to introduce ourselves and explain why we're reaching out.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Who we are</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders — yoga teachers, wellness coaches, meditation guides — with the local service providers and venues they need to bring their retreats to life. Think of us as the bridge between the retreat leader who has the vision and the local professionals who have the expertise.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">How it works</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">When a retreat leader is planning an experience in a specific area, they tell us what they need — catering, photography, sound healing, transportation, and so on. We then search for highly-rated local providers and make introductions through the platform. From there, you and the retreat leader can connect directly, discuss details, and decide if it's a good fit.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Why we're reaching out to you</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Right now, a retreat leader is planning a retreat in <strong>${location}</strong> and needs <strong>${category}</strong> services. We came across your business and thought you'd be a great match. We'd love to introduce you to them through the platform so you can learn more about the opportunity and decide if it's something you'd like to take on.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">There's zero risk</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Joining the platform is completely free — no monthly fees, no commitments, no pressure. You can create a profile, see what the opportunity looks like, and decide for yourself. If it's not the right fit, that's perfectly fine. And if it is, we handle the contracts and payment protection so you can focus on what you do best. Down the road, if you find the platform valuable, there's an option to become a member for additional features — but there's absolutely no obligation to do so.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">If you're curious, we'd love for you to take a look at the site and see if it's something that interests you.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Check Out HighVibe Retreats</a>
            </td></tr>
          </table>
          <p style="color:#666;font-size:14px;">No pressure at all — if this isn't the right time, we completely understand.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;margin-top:24px;">Warm regards,<br><strong>The HighVibe Retreats Team</strong></p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
          <p style="margin:8px 0 0;">This is a one-time partnership inquiry. You are receiving this because your business is publicly listed for ${category} services in ${location}.</p>
          <p style="margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe from future emails</a></p>
          <p style="margin:8px 0 0;">HighVibe Retreats &middot; Los Angeles, CA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildVendorOutreachText(vendorName: string, location: string, category: string, signupUrl: string, unsubscribeUrl: string): string {
  return `Hi ${vendorName},

We're reaching out from HighVibe Retreats. A retreat leader on our platform is planning a retreat in ${location} and is looking for ${category} services. Based on your business profile, we think you could be a great fit.

WHO WE ARE
HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders with the local service providers and venues they need to bring their retreats to life.

HOW IT WORKS
When a retreat leader is planning an experience, they tell us what they need. We search for highly-rated local providers and make introductions through the platform. From there, you and the retreat leader can connect directly.

WHY WE'RE REACHING OUT TO YOU
A retreat leader is planning a retreat in ${location} and needs ${category} services. We came across your business and thought you'd be a great match.

THERE'S ZERO RISK
Joining the platform is completely free — no monthly fees, no commitments, no pressure.

If you're curious, take a look: ${signupUrl}

Warm regards,
The HighVibe Retreats Team

---
This is a one-time partnership inquiry from HighVibe Retreats.
To unsubscribe: ${unsubscribeUrl}
HighVibe Retreats · Los Angeles, CA`;
}

function buildHostOutreachHtml(hostName: string, location: string, accommodationType: string, groupSizeNote: string, signupUrl: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 40px;text-align:center;background:#1a1a1a;">
          <h1 style="margin:0;color:#f5f0eb;font-size:24px;letter-spacing:0.15em;">HIGHVIBE RETREATS</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${hostName},</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">We're reaching out from <strong>HighVibe Retreats</strong>. A retreat leader on our platform is planning a wellness retreat in <strong>${location}</strong> and is looking for a <strong>${accommodationType.toLowerCase()}</strong> to host their group. We came across <strong>${hostName}</strong> and think it could be a beautiful fit.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">We wanted to take a moment to introduce ourselves and share a bit about what we do.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Who we are</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders with exceptional properties where they can host their experiences. The retreat leader brings the programming, the participants, and the vision. The property provides the space, the atmosphere, and the hospitality.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">How it works for properties</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">When a retreat leader is planning an experience, they tell us about the kind of property they're looking for. We search for properties that fit and make an introduction through the platform. You stay in complete control of your pricing, your calendar, and your property.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Why we're reaching out to you</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">A retreat leader on our platform is actively looking for a ${accommodationType.toLowerCase()} in <strong>${location}</strong> to host their upcoming retreat. ${groupSizeNote} We'd love to introduce you to them through the platform.</p>
          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">There's zero risk</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Listing your property on HighVibe is completely free — no monthly fees, no exclusivity agreements, no commitments. You set your own nightly rates and only make your property available when it works for you.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">Many properties find that retreat bookings become a welcome source of recurring revenue — retreat leaders who have a great experience often come back 2-4 times per year.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Check Out HighVibe Retreats</a>
            </td></tr>
          </table>
          <p style="color:#666;font-size:14px;">No pressure at all — if this isn't the right time, we completely understand. We wish you continued success with ${hostName}.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;margin-top:24px;">Warm regards,<br><strong>The HighVibe Retreats Team</strong></p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
          <p style="margin:8px 0 0;">This is a one-time partnership inquiry. You are receiving this because ${hostName} is publicly listed as a ${accommodationType.toLowerCase()} in ${location}.</p>
          <p style="margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe from future emails</a></p>
          <p style="margin:8px 0 0;">HighVibe Retreats &middot; Los Angeles, CA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildHostOutreachText(hostName: string, location: string, accommodationType: string, groupSize: number | undefined, signupUrl: string, unsubscribeUrl: string): string {
  const groupSizeNote = groupSize
    ? `This particular retreat would bring approximately ${groupSize} guests for a multi-night stay.`
    : 'Retreat leaders typically book blocks of rooms for multi-night group stays.';

  return `Hi ${hostName},

We're reaching out from HighVibe Retreats. A retreat leader on our platform is planning a wellness retreat in ${location} and is looking for a ${accommodationType.toLowerCase()} to host their group. We came across ${hostName} and think it could be a beautiful fit.

WHO WE ARE
HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders with exceptional properties where they can host their experiences.

HOW IT WORKS FOR PROPERTIES
When a retreat leader is planning an experience, they tell us about the kind of property they're looking for. We make introductions through the platform. You stay in complete control of your pricing, your calendar, and your property.

WHY WE'RE REACHING OUT TO YOU
A retreat leader is actively looking for a ${accommodationType.toLowerCase()} in ${location} to host their upcoming retreat. ${groupSizeNote}

THERE'S ZERO RISK
Listing your property on HighVibe is completely free — no monthly fees, no exclusivity agreements, no commitments.

Check it out: ${signupUrl}

Warm regards,
The HighVibe Retreats Team

---
This is a one-time partnership inquiry from HighVibe Retreats.
To unsubscribe: ${unsubscribeUrl}
HighVibe Retreats · Los Angeles, CA`;
}
