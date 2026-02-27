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
  let emailForLog = "unknown";
  
  let fsAttempted = false;
  let fsSucceeded = false;
  let emailAttempted = false;
  let emailSucceeded = false;

  const disableEmail = process.env.WAITLIST_DISABLE_EMAIL_SEND === 'true';
  const disableFirestore = process.env.WAITLIST_DISABLE_FIRESTORE_WRITE === 'true';

  // RUNTIME ENV CHECK LOGGING
  const envCheck = {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE'),
    EMAIL_FROM: !!process.env.EMAIL_FROM,
  };
  console.log(`WAITLIST_RUNTIME_ENV [${requestId}] ${JSON.stringify(envCheck)}`);

  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');

    const rawBody = await request.text();
    if (!rawBody) {
        return NextResponse.json({ ok: false, requestId, stage: "input", message: 'Empty request body' }, { status: 400 });
    }
    const body = JSON.parse(rawBody);
    emailForLog = body.email || "unknown";
    
    const maskedEmail = emailForLog.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + b.replace(/./g, '*') + c);
    console.log(`[${requestId}] WAITLIST_START email=${maskedEmail}`);

    // CONFIG FAIL-FAST
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('REPLACE')) {
        console.error(`[${requestId}] WAITLIST_CONFIG_ERROR: RESEND_API_KEY missing at runtime.`);
        if (!disableEmail) {
            return NextResponse.json({ 
              ok: false, 
              requestId, 
              stage: "config", 
              message: "Email service not configured (RESEND_API_KEY missing). Ensure Secret Manager Secret Accessor is granted to firebase-app-hosting-compute@studio-634317332-6568b.iam.gserviceaccount.com" 
            }, { status: 500 });
        }
    }

    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid input.';
      return NextResponse.json({ ok: false, requestId, stage: "input", message: errorMessage }, { status: 400 });
    }

    const { firstName, email, roleInterest, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = validation.data;
    const emailLower = email.toLowerCase();
    const roleBucket = mapRoleToBucket(roleInterest as RoleInterest);

    let assignedCode: string | null = null;
    let isDuplicate = false;

    // --- FIRESTORE STAGE ---
    if (!disableFirestore) {
        fsAttempted = true;
        try {
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
              const isAdminTest = (process.env.ADMIN_EMAIL_ALLOWLIST || '').includes(emailLower);
              if (isAdminTest) {
                assignedCode = `TEST-${Date.now()}`;
              } else {
                assignedCode = await claimFounderCode(emailLower, roleBucket as 'guide'|'host'|'vendor', firestoreDb, FieldValue);
              }

              if (assignedCode) {
                dataToUpdate.founderCode = assignedCode;
                dataToUpdate.founderCodeAssignedAt = FieldValue.serverTimestamp();
              }
            } else if (hasCodeAlready) {
              assignedCode = docSnap.data()?.founderCode;
            }

            await waitlistRef.set(dataToUpdate, { merge: true });
            fsSucceeded = true;
            console.log(`[${requestId}] WAITLIST_FIRESTORE_OK`);
        } catch (dbError: any) {
            console.error(`[${requestId}] WAITLIST_ERROR (Firestore): ${dbError.message}`);
            return NextResponse.json({ ok: false, requestId, stage: "firestore", message: "Database connection failed. " + dbError.message }, { status: 500 });
        }
    }

    // --- EMAIL STAGE ---
    if (!disableEmail && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE')) {
        emailAttempted = true;
        const emailContent = buildWaitlistEmail({
            firstName: firstName || undefined,
            roleInterest: roleInterest || undefined,
            roleBucket,
            founderCode: assignedCode,
        });

        try {
            const { sendEmail } = await import('@/lib/email');
            await sendEmail({ ...emailContent, to: emailLower });
            emailSucceeded = true;
            console.log(`[${requestId}] WAITLIST_EMAIL_OK`);
        } catch (emailError: any) {
            console.error(`[${requestId}] WAITLIST_ERROR (Email): ${emailError.message}`);
            // Note: We don't fail the whole request if email fails but Firestore succeeded
        }
    }

    console.log(`WAITLIST_RESULT: ${requestId}, ${fsAttempted}, ${fsSucceeded}, ${emailAttempted}, ${emailSucceeded}, 200`);
    return NextResponse.json({ 
        ok: true, 
        requestId,
        founderCode: assignedCode, 
        duplicate: isDuplicate
    });

  } catch (error: any) {
    console.error(`[${requestId}] WAITLIST_ERROR (Global): ${error.message}`);
    return NextResponse.json({ ok: false, requestId, stage: "unknown", message: error.message }, { status: 500 });
  }
}