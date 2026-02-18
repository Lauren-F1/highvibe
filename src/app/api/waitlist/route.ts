import { NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { sendWaitlistConfirmation } from '@/lib/email';

const waitlistSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  roleInterest: z.string().optional(),
  source: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = waitlistSchema.safeParse(body);

    if (!validation.success) {
      console.error('WAITLIST_VALIDATION_ERROR', validation.error.issues);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid input.',
          debug:
            process.env.NODE_ENV === 'development'
              ? validation.error.issues
              : undefined,
        },
        { status: 400 }
      );
    }

    const { firstName, email, roleInterest, source } = validation.data;
    const emailLower = email.toLowerCase();

    const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
    const doc = await waitlistRef.get();
    
    const shouldSendEmail = !doc.exists || (doc.exists && doc.data()?.lastEmailStatus !== 'sent');

    if (doc.exists) {
      await waitlistRef.update({
        updatedAt: FieldValue.serverTimestamp(),
        submitCount: FieldValue.increment(1),
        ...(firstName && { firstName }),
        ...(roleInterest && { roleInterest }),
      });
    } else {
      await waitlistRef.set({
        firstName,
        email: emailLower,
        roleInterest,
        source,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: 'new',
        submitCount: 1,
      });
    }
    
    if (shouldSendEmail) {
        try {
            await sendWaitlistConfirmation(emailLower, firstName);
            await waitlistRef.update({
                lastEmailStatus: 'sent',
                lastEmailAt: FieldValue.serverTimestamp(),
            });
        } catch (emailError: any) {
            console.error('WAITLIST_EMAIL_ERROR', emailError);
            // Don't block the user response for email failure, but log it.
            await waitlistRef.update({
                lastEmailStatus: 'failed',
                lastEmailAt: FieldValue.serverTimestamp(),
                lastEmailError: emailError.message, // Store the error message
            });
        }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('WAITLIST_ERROR', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'An unexpected error occurred on the server.',
        debug:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
