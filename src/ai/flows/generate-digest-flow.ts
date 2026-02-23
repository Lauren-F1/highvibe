'use server';
/**
 * @fileOverview An AI flow to generate a weekly opportunity digest for providers.
 *
 * - generateWeeklyDigest - A function that creates a summary of a user's weekly activity.
 * - WeeklyDigestInput - The input type for the function.
 * - WeeklyDigestOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string(),
});

const UnreadMessageSchema = z.object({
  senderName: z.string(),
  snippet: z.string(),
  link: z.string(),
});

const PendingTaskSchema = z.object({
    task: z.string(),
    link: z.string(),
});

export const WeeklyDigestInputSchema = z.object({
  userName: z.string(),
  newMatches: z.array(MatchSchema).describe("A list of new, high-quality matches for the user."),
  unreadMessages: z.array(UnreadMessageSchema).describe("A list of unread messages from important conversations."),
  pendingTasks: z.array(PendingTaskSchema).describe("A list of pending tasks or actions the user needs to take."),
});
export type WeeklyDigestInput = z.infer<typeof WeeklyDigestInputSchema>;

export const WeeklyDigestOutputSchema = z.object({
  subject: z.string().describe("The subject line for the weekly digest email."),
  summary: z.string().describe("A friendly, encouraging one-paragraph summary of the week's activity."),
  htmlBody: z.string().describe("The full HTML content for the email body."),
});
export type WeeklyDigestOutput = z.infer<typeof WeeklyDigestOutputSchema>;

export async function generateWeeklyDigest(
  input: WeeklyDigestInput
): Promise<WeeklyDigestOutput> {
  return generateDigestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyDigestPrompt',
  input: {schema: WeeklyDigestInputSchema},
  output: {schema: WeeklyDigestOutputSchema},
  prompt: `You are an AI assistant for HighVibe Retreats, a luxury brand and functional marketplace. Your task is to generate a personalized and encouraging weekly digest email for a provider named {{userName}}.

The tone should be warm, celebratory, and motivating, reflecting the brand's blend of emotional connection and clear, functional information. Use markdown for formatting the HTML body.

**Instructions:**
1.  **Subject Line:** Create a compelling subject line like "Your week on HighVibe: New opportunities are waiting ✨".
2.  **Summary:** Write a short, friendly opening paragraph. If there are new items, congratulate the user. If not, offer encouragement for the week ahead.
3.  **HTML Body:**
    *   Start with the summary paragraph.
    *   If there are new matches, create a "New Matches" section. List each match with its title and description, and link to it.
    *   If there are unread messages, create an "Unread Messages" section. List each message with the sender and a snippet.
    *   If there are pending tasks, create a "Your To-Do List" section.
    *   End with a warm closing, like "Here's to a great week of connection,".

**Data for {{userName}}:**

*   **New Matches:** {{json newMatches}}
*   **Unread Messages:** {{json unreadMessages}}
*   **Pending Tasks:** {{json pendingTasks}}

Generate the subject, summary, and full HTML email body based on this data.
`,
});

const generateDigestFlow = ai.defineFlow(
  {
    name: 'generateDigestFlow',
    inputSchema: WeeklyDigestInputSchema,
    outputSchema: WeeklyDigestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
