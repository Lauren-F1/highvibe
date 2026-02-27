import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildWaitlistEmail } from '@/lib/waitlist-email-templates';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const waitlistSchema = z.object({
  firstName: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Invalid email address'),
  roleInterest: z.string(),
  source: z.string().optional().nullable().transform(val => val || 'unknown'),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  utm_term: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
});

type RoleInterest =
  | "Seeker (I want to find/book retreats)"
  | "Guide (I want to lead retreats)"
  | "Host (I have a space)"
  | "Vendor (I offer services)"
  | undefined
  | null;

type RoleBucket = "seeker" | "guide" | "host" | "vendor";

function mapRoleToBucket(roleInterest: RoleInterest): RoleBucket {
    switch (roleInterest) {
        case "Seeker (I want to find/book retreats)": return 'seeker';
        case "Guide (I want to lead retreats)": return 'guide';
        case "Host (I have a space)": return 'host';
        case "Vendor (I offer services)": return 'vendor';
        default: return 'seeker';
    }
}

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  
  let disableEmail = process.env.WAITLIST_DISABLE_EMAIL_SEND === 'true';
  const disableFirestore = process.env.WAITLIST_DISABLE_FIRESTORE_WRITE === 'true';

  // Check if configuration is missing - make it NON-BLOCKING
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey.includes('REPLACE') || resendKey.length < 5) {
      console.warn(`[${requestId}] WAITLIST_CONFIG_WARNING: RESEND_API_KEY missing or invalid. Skipping email stage.`);
      disableEmail = true;
  }

  try {
    const rawBody = await request.text();
    if (!rawBody) {
        return NextResponse.json({ ok: false, requestId, stage: "input", message: 'Empty request body' }, { status: 400 });
    }
    const body = JSON.parse(rawBody);
    
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, requestId, stage: "input", message: validation.error.errors[0]?.message }, { status: 400 });
    }

    const { firstName, email, roleInterest, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = validation.data;
    const emailLower = email.toLowerCase();
    const roleBucket = mapRoleToBucket(roleInterest as RoleInterest);

    let assignedCode: string | null = null;
    let isDuplicate = false;

    // --- FIRESTORE STAGE ---
    if (!disableFirestore) {
        try {
            const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
            const { db: firestoreDb, FieldValue } = await getFirebaseAdmin();
            const { claimFounderCode } = await import('@/lib/access-codes');
            const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
            
            const docSnap = await waitlistRef.get();
            isDuplicate = docSnap.exists;

            const dataToUpdate: any = {
              updatedAt: FieldValue.serverTimestamp(),
              roleBucket,
              ...(docSnap.exists && { submitCount: FieldValue.increment(1) }),
              ...(firstName && { firstName }),
              ...(roleInterest && { roleInterest }),
              source: source,
              ...(utm_source && { utm_source }),
              ...(utm_medium && { utm_medium }),
              ...(utm_campaign && { utm_campaign }),
              ...(utm_term && { utm_term }),
              ...(utm_content && { utm_content }),
            };

            if (!docSnap.exists) {
                dataToUpdate.createdAt = FieldValue.serverTimestamp();
                dataToUpdate.email = emailLower;
                dataToUpdate.status = 'new';
                dataToUpdate.submitCount = 1;
            }

            const isEligibleForCode = ['guide', 'host', 'vendor'].includes(roleBucket);
            const hasCodeAlready = docSnap.exists && docSnap.data()?.founderCode;

            if (isEligibleForCode && !hasCodeAlready) {
              assignedCode = await claimFounderCode(emailLower, roleBucket as 'guide'|'host'|'vendor', firestoreDb, FieldValue);
              if (assignedCode) {
                dataToUpdate.founderCode = assignedCode;
                dataToUpdate.founderCodeAssignedAt = FieldValue.serverTimestamp();
              }
            } else if (hasCodeAlready) {
              assignedCode = docSnap.data()?.founderCode;
            }

            await waitlistRef.set(dataToUpdate, { merge: true });
        } catch (dbError: any) {
            console.error(`[${requestId}] WAITLIST_FIRESTORE_ERROR: ${dbError.message}`);
            // If it's the specific metadata error, give a friendly message
            const friendlyMsg = dbError.message.includes('2 UNKNOWN') 
                ? "Database temporarily unavailable (Project resolution error)." 
                : "Database connection failed. " + dbError.message;
            return NextResponse.json({ ok: false, requestId, stage: "firestore", message: friendlyMsg }, { status: 500 });
        }
    }

    // --- EMAIL STAGE (Optional/Non-blocking) ---
    if (!disableEmail) {
        try {
            const emailContent = buildWaitlistEmail({
                firstName: firstName || undefined,
                roleInterest: roleInterest || undefined,
                roleBucket,
                founderCode: assignedCode,
            });
            const { sendEmail } = await import('@/lib/email');
            await sendEmail({ ...emailContent, to: emailLower });
        } catch (emailError: any) {
            console.error(`[${requestId}] WAITLIST_EMAIL_ERROR: ${emailError.message}`);
            // We proceed even if email fails, as long as Firestore succeeded
        }
    }

    return NextResponse.json({ 
        ok: true, 
        requestId,
        founderCode: assignedCode, 
        duplicate: isDuplicate,
        message: disableEmail ? "We've saved your spot! (Confirmation email will follow once service is configured)." : undefined
    });

  } catch (error: any) {
    console.error(`[${requestId}] WAITLIST_GLOBAL_ERROR: ${error.message}`);
    return NextResponse.json({ ok: false, requestId, stage: "global", message: error.message }, { status: 500 });
  }
}
