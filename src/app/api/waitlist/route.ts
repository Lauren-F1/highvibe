import { NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { assignFounderCode } from '@/lib/access-codes';
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

    const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
    const docSnap = await waitlistRef.get();

    const roleBucket = mapRoleToBucket(roleInterest as RoleInterest);

    const shouldSendEmail = !docSnap.exists || docSnap.data()?.emailStatus !== 'sent';
    
    let existingCode = docSnap.exists ? docSnap.data()?.founderCode || null : null;
    let hasCodeBeenAssigned = !!existingCode;

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
    
    const isProvider = ['guide', 'host', 'vendor'].includes(roleBucket);
    if (isProvider && !hasCodeBeenAssigned && shouldSendEmail) {
        const newCode = await assignFounderCode(emailLower, roleBucket as 'guide'|'host'|'vendor');
        if (newCode) {
            existingCode = newCode;
            dataToUpdate.founderCode = newCode;
            dataToUpdate.founderCodeStatus = 'assigned';
            hasCodeBeenAssigned = true;
        }
    }
    
    await waitlistRef.set(dataToUpdate, { merge: true });

    if (shouldSendEmail) {
        const emailContent = buildWaitlistEmail({
            firstName,
            roleInterest,
            roleBucket,
            founderCode: existingCode,
            hasCode: hasCodeBeenAssigned,
        });

        try {
            await sendEmail(emailContent);
            await waitlistRef.update({
                emailStatus: 'sent',
                emailSentAt: FieldValue.serverTimestamp(),
            });
        } catch (emailError: any) {
            console.error('WAITLIST_EMAIL_ERROR', emailError);
            await waitlistRef.update({
                emailStatus: 'failed',
                lastEmailError: emailError.message,
                emailSentAt: FieldValue.serverTimestamp(),
            });
        }
    }

    return NextResponse.json({ ok: true });

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

    