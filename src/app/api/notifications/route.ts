import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import {
  buildNewConnectionEmail,
  buildNewMessageEmail,
  buildBookingConfirmationEmail,
  buildManifestationMatchEmail,
} from '@/lib/notification-emails';

/**
 * POST /api/notifications
 * Creates a notification doc and optionally sends an email.
 * Called fire-and-forget from client-side actions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { userId, type, title, body: notifBody, linkUrl, sendEmailNotif = true, metadata } = body;

    if (!type || !title || !notifBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db, FieldValue } = await getFirebaseAdmin();

    // For new_message type, resolve recipient from conversation participants
    if (!userId && type === 'new_message' && metadata?.conversationId) {
      try {
        const convDoc = await db.collection('conversations').doc(metadata.conversationId).get();
        if (convDoc.exists) {
          const participants = convDoc.data()?.participants as string[] || [];
          const senderName = metadata?.senderName || '';
          // Find recipient (the participant who is NOT the sender)
          // Look up sender by name match in participantInfo, or just pick the other one
          const participantInfo = convDoc.data()?.participantInfo || {};
          const senderId = Object.keys(participantInfo).find(
            uid => participantInfo[uid]?.displayName === senderName
          );
          userId = participants.find(p => p !== senderId) || participants[0];
        }
      } catch (e) {
        console.error('[NOTIFICATIONS] Failed to resolve recipient from conversation:', e);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Message spam prevention: skip if same type + conversation within 5 minutes
    if (type === 'new_message' && metadata?.conversationId) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentSnap = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('type', '==', 'new_message')
        .where('metadata.conversationId', '==', metadata.conversationId)
        .where('createdAt', '>=', fiveMinAgo)
        .limit(1)
        .get();

      if (!recentSnap.empty) {
        return NextResponse.json({ success: true, skipped: true, reason: 'cooldown' });
      }
    }

    // Create notification document
    const notifRef = await db.collection('notifications').add({
      userId,
      type,
      title,
      body: notifBody,
      linkUrl: linkUrl || '',
      read: false,
      emailSent: false,
      createdAt: FieldValue.serverTimestamp(),
      metadata: metadata || {},
    });

    // Send email notification if requested
    if (sendEmailNotif) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          const email = userData.email;
          const name = userData.displayName || 'there';

          // Check user preferences
          const emailEnabled = userData.email_notifications_enabled !== false; // default true
          let shouldSend = emailEnabled;

          if (type === 'new_message' && userData.notify_new_messages === false) shouldSend = false;
          if (type === 'booking_confirmation' && userData.notify_booking_confirmations === false) shouldSend = false;
          if (type === 'manifestation_match' && userData.notify_manifestation_matches === false) shouldSend = false;

          if (shouldSend && email) {
            let emailContent: { html: string; text: string } | null = null;

            switch (type) {
              case 'connection_request':
                emailContent = buildNewConnectionEmail({
                  recipientName: name,
                  senderName: metadata?.senderName || 'Someone',
                });
                break;
              case 'new_message':
                emailContent = buildNewMessageEmail({
                  recipientName: name,
                  senderName: metadata?.senderName || 'Someone',
                  messageSnippet: notifBody.slice(0, 100),
                });
                break;
              case 'booking_confirmation':
                emailContent = buildBookingConfirmationEmail({
                  recipientName: name,
                  retreatTitle: metadata?.retreatTitle || 'your retreat',
                  amount: metadata?.amount || 0,
                });
                break;
              case 'manifestation_match':
                emailContent = buildManifestationMatchEmail({
                  recipientName: name,
                  matchDescription: notifBody,
                });
                break;
            }

            if (emailContent) {
              await sendEmail({
                to: email,
                subject: title,
                html: emailContent.html,
                text: emailContent.text,
              });
              await db.collection('notifications').doc(notifRef.id).update({ emailSent: true });
            }
          }
        }
      } catch (emailError) {
        // Email failures are non-blocking
        console.error('[NOTIFICATIONS] Email send failed:', emailError);
      }
    }

    return NextResponse.json({ success: true, notificationId: notifRef.id });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
