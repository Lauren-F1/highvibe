
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
  | "Guide (I want to lead retreats)"
  | "Host (I have a space)"
  | "Vendor (I offer services)"
  | "Seeker (I want to find/book retreats)"
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
  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { claimFounderCode } = await import('@/lib/access-codes');
    const { sendEmail } = await import('@/lib/email');
    
    const body = await request.json();
    const validation = waitlistSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid input.';
      console.error('WAITLIST_VALIDATION_ERROR', { issues: validation.error.issues });
      return NextResponse.json({ ok: false, error: errorMessage, code: "validation_failed" }, { status: 400 });
    }

    const { firstName, email, roleInterest, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = validation.data;
    const emailLower = email.toLowerCase();
    const roleBucket = mapRoleToBucket(roleInterest as RoleInterest);

    const { db: firestoreDb, FieldValue } = await getFirebaseAdmin();
    const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
    const docSnap = await waitlistRef.get();

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

    let assignedCode: string | null = null;
    const isEligibleForCode = ['guide', 'host', 'vendor'].includes(roleBucket);
    const hasCodeAlready = docSnap.exists && docSnap.data()?.founderCode;

    if (isEligibleForCode && !hasCodeAlready) {
      const isAdminTest = process.env.NODE_ENV === 'development' || (process.env.LAUNCH_MODE === 'true' && (process.env.ADMIN_EMAIL_ALLOWLIST || '').includes(emailLower));
      
      if (isAdminTest) {
        assignedCode = `TEST-${Date.now()}`;
        dataToUpdate.founderCodeTest = true;
      } else {
        assignedCode = await claimFounderCode(emailLower, roleBucket as 'guide'|'host'|'vendor', firestoreDb, FieldValue);
      }

      if (assignedCode) {
        dataToUpdate.founderCode = assignedCode;
        dataToUpdate.founderCodeAssignedAt = FieldValue.serverTimestamp();
        dataToUpdate.founderCodeRoleBucket = roleBucket;
        dataToUpdate.founderCodeStatus = 'assigned';
      }
    } else if (hasCodeAlready) {
      assignedCode = docSnap.data()?.founderCode;
    }

    await waitlistRef.set(dataToUpdate, { merge: true });

    let emailSentSuccessfully = true;
    const shouldSendEmail = !docSnap.exists || docSnap.data()?.emailStatus !== 'sent';
    
    if (shouldSendEmail) {
      const emailContent = buildWaitlistEmail({
          firstName: firstName || undefined,
          roleInterest: roleInterest || undefined,
          roleBucket,
          founderCode: assignedCode,
      });

      try {
        await sendEmail({ ...emailContent, to: emailLower });
        await waitlistRef.update({
            emailStatus: 'sent',
            emailSentAt: FieldValue.serverTimestamp(),
            lastEmailError: FieldValue.delete(),
        });
      } catch (emailError: any) {
        console.error('WAITLIST_EMAIL_ERROR', { message: emailError.message, name: emailError.name, statusCode: emailError.statusCode });
        await waitlistRef.update({
            emailStatus: `failed`,
            lastEmailError: emailError.message,
            emailSentAt: FieldValue.serverTimestamp(),
        });
        emailSentSuccessfully = false;
      }
    }

    if (!emailSentSuccessfully) {
        return NextResponse.json({ 
            ok: true, 
            founderCode: assignedCode,
            message: "We saved your spot on the waitlist, but the email confirmation is temporarily unavailable."
        });
    }

    return NextResponse.json({ ok: true, founderCode: assignedCode });

  } catch (error: any) {
    const payload = await request.json().catch(() => ({}));
    console.error('WAITLIST_ERROR', {
        message: error.message,
        stack: error.stack,
        email: payload.email,
        roleBucket: payload.roleInterest ? mapRoleToBucket(payload.roleInterest) : 'unknown',
        source: payload.source,
    });
    
    let userFriendlyError = 'An unexpected error occurred. Please try again later.';
    let errorCode = 'internal_server_error';

    if (error.message && error.message.includes('Resend API key')) {
        userFriendlyError = 'Email service is not configured correctly on the server.';
        errorCode = 'missing_resend_key';
    }

    return NextResponse.json({
        ok: false,
        error: userFriendlyError,
        code: errorCode,
      },
      { status: 500 }
    );
  }
}
