import { NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { claimFounderCode } from '@/lib/access-codes';
import { buildWaitlistEmail } from '@/lib/waitlist-email-templates';
import { sendEmail } from '@/lib/email';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string().optional(),
  source: z.string(),
});

type RoleInterest =
  | "Seeker (I want to find/book retreats)"
  | "Guide (I want to host retreats)"
  | "Host (I have a space)"
  | "Vendor (I offer services)"
  | "Partner / Collaborator"
  | undefined;

type RoleBucket = "seeker" | "guide" | "host" | "vendor" | "partner";

function mapRoleToBucket(roleInterest: RoleInterest): RoleBucket {
    switch (roleInterest) {
        case "Seeker (I want to find/book retreats)": return 'seeker';
        case "Guide (I want to host retreats)": return 'guide';
        case "Host (I have a space)": return 'host';
        case "Vendor (I offer services)": return 'vendor';
        case "Partner / Collaborator": return 'partner';
        default: return 'partner';
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = waitlistSchema.safeParse(body);

    if (!validation.success) {
      console.error('WAITLIST_VALIDATION_ERROR', validation.error.issues);
      return NextResponse.json({ ok: false, error: 'Invalid input.' }, { status: 400 });
    }

    const { firstName, email, roleInterest, source } = validation.data;
    const emailLower = email.toLowerCase();
    const roleBucket = mapRoleToBucket(roleInterest as RoleInterest);

    const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
    const docSnap = await waitlistRef.get();

    const dataToUpdate: any = {
      updatedAt: FieldValue.serverTimestamp(),
      roleBucket,
      ...(docSnap.exists && { submitCount: FieldValue.increment(1) }),
      ...(firstName && { firstName }),
      ...(roleInterest && { roleInterest }),
    };

    if (!docSnap.exists) {
        dataToUpdate.createdAt = FieldValue.serverTimestamp();
        dataToUpdate.email = emailLower;
        dataToUpdate.source = source;
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
        assignedCode = await claimFounderCode(emailLower, roleBucket as 'guide'|'host'|'vendor');
      }

      if (assignedCode) {
        dataToUpdate.founderCode = assignedCode;
        dataToUpdate.founderCodeAssignedAt = FieldValue.serverTimestamp();
        dataToUpdate.founderCodeRoleBucket = roleBucket;
      }
    } else if (hasCodeAlready) {
      assignedCode = docSnap.data()?.founderCode;
    }

    await waitlistRef.set(dataToUpdate, { merge: true });

    const shouldSendEmail = !docSnap.exists || docSnap.data()?.emailStatus !== 'sent';
    if (shouldSendEmail) {
      const emailContent = buildWaitlistEmail({
          firstName,
          roleInterest,
          roleBucket,
          founderCode: assignedCode,
      });

      sendEmail({ ...emailContent, to: emailLower }).then(() => {
          waitlistRef.update({
              emailStatus: 'sent',
              emailSentAt: FieldValue.serverTimestamp(),
              lastEmailError: FieldValue.delete(),
          });
      }).catch((emailError: any) => {
          console.error('WAITLIST_EMAIL_ERROR', emailError);
          waitlistRef.update({
              emailStatus: 'failed',
              lastEmailError: emailError.message,
              emailSentAt: FieldValue.serverTimestamp(),
          });
      });
    }

    return NextResponse.json({ ok: true, founderCode: assignedCode });

  } catch (error: any) {
    console.error('WAITLIST_ERROR', error);
    return NextResponse.json({
        ok: false,
        error: 'An unexpected error occurred on the server.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
