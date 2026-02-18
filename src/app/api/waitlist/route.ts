import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email, roleInterest, source } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const waitlistRef = firestoreDb.collection('waitlist').doc(emailLower);
    
    const doc = await waitlistRef.get();

    if (doc.exists) {
        await waitlistRef.update({
            updatedAt: FieldValue.serverTimestamp(),
            submitCount: FieldValue.increment(1),
            source: source, // update source on re-submit
            ...(firstName && { firstName: firstName }),
            ...(roleInterest && { roleInterest: roleInterest }),
        });
    } else {
        await waitlistRef.set({
            email: emailLower,
            firstName: firstName || null,
            roleInterest: roleInterest || null,
            source: source || 'unknown',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            status: 'new',
            submitCount: 1,
            userAgent: request.headers.get('user-agent') || '',
        });
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}
