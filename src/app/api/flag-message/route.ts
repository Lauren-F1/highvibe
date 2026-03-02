import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import { buildCircumventionWarningEmail, buildCircumventionAdminAlertEmail } from '@/lib/circumvention-email-templates';
import { monitorCommissionEnforcement } from '@/ai/flows/commission-enforcement';

/**
 * POST /api/flag-message
 * Called client-side when the message monitor detects a potential circumvention attempt.
 * Records the flag in Firestore and sends warning emails to the user and admin.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      senderId,
      messageText,
      riskScore,
      matchedCategories,
      reasons,
    } = body;

    if (!conversationId || !senderId || !messageText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // Get conversation details to identify both parties
    const convDoc = await db.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const convData = convDoc.data()!;
    const participants = convData.participants as string[];
    const otherUserId = participants.find((p: string) => p !== senderId) || 'unknown';

    // Get user profiles for email
    const [senderDoc, otherDoc] = await Promise.all([
      db.collection('users').doc(senderId).get(),
      db.collection('users').doc(otherUserId).get(),
    ]);

    const senderName = senderDoc.data()?.displayName || 'Unknown User';
    const senderEmail = senderDoc.data()?.email;
    const otherName = otherDoc.data()?.displayName || 'Unknown User';

    // Run AI analysis for deeper context (non-blocking — we still flag regardless)
    let aiAnalysis: { isCircumventionAttempt: boolean; reason: string } | null = null;
    try {
      // Gather recent messages from the conversation for context
      const recentMessages = await db
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const communicationLog = recentMessages.docs
        .reverse()
        .map((d) => {
          const data = d.data();
          const who = data.senderId === senderId ? senderName : otherName;
          return `${who}: ${data.text}`;
        })
        .join('\n');

      aiAnalysis = await monitorCommissionEnforcement({
        bookingDetails: `Conversation between ${senderName} and ${otherName} on HighVibe Retreats platform.`,
        communicationLog,
      });
    } catch (e) {
      console.error('AI commission enforcement analysis failed (non-fatal):', e);
    }

    // Record the flag in Firestore
    await db.collection('flagged_conversations').add({
      conversationId,
      flaggedUserId: senderId,
      flaggedUserName: senderName,
      otherUserId,
      otherUserName: otherName,
      messageSnippet: messageText.substring(0, 500),
      riskScore,
      matchedCategories,
      reasons,
      aiConfirmed: aiAnalysis?.isCircumventionAttempt ?? null,
      aiReason: aiAnalysis?.reason ?? null,
      status: 'open', // open | reviewed | dismissed | actioned
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update conversation with flag metadata
    await db.collection('conversations').doc(conversationId).update({
      isFlagged: true,
      flagCount: FieldValue.increment(1),
      lastFlaggedAt: FieldValue.serverTimestamp(),
    });

    // Send warning emails (non-blocking — don't fail the request if email fails)
    const emailPromises: Promise<unknown>[] = [];

    // Warning to the flagged user
    if (senderEmail) {
      const warningEmail = buildCircumventionWarningEmail({
        userName: senderName,
        conversationId,
        messageSnippet: messageText,
      });
      emailPromises.push(
        sendEmail({ to: senderEmail, ...warningEmail }).catch((e) =>
          console.error('Failed to send circumvention warning email:', e)
        )
      );
    }

    // Alert to admin
    const adminEmail = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',')[0]?.trim();
    if (adminEmail) {
      const adminAlert = buildCircumventionAdminAlertEmail({
        flaggedUserName: senderName,
        flaggedUserId: senderId,
        otherUserName: otherName,
        otherUserId,
        conversationId,
        messageSnippet: messageText,
        riskScore,
        reasons,
      });
      emailPromises.push(
        sendEmail({ to: adminEmail, ...adminAlert }).catch((e) =>
          console.error('Failed to send admin circumvention alert:', e)
        )
      );
    }

    await Promise.all(emailPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in flag-message API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
