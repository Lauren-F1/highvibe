'use server';

/**
 * @fileOverview An AI assistant for generating contextual message replies in the inbox.
 *
 * - generateMessageSuggestions - A function that suggests replies based on conversation context.
 * - MessageSuggestionsInput - The input type for the function.
 * - MessageSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Simplified schema, as we don't need the full message object for the prompt.
const MessageSchema = z.object({
  sender: z.enum(['me', 'them']),
  text: z.string(),
});

const MessageSuggestionsInputSchema = z.object({
  conversationHistory: z.array(MessageSchema).describe("The last 10 messages in the conversation, from oldest to newest."),
  userRole: z.string().describe("The role of the user requesting suggestions (e.g., 'Guide', 'Host')."),
  partnerRole: z.string().describe("The role of the other person in the conversation (e.g., 'Seeker', 'Vendor')."),
  retreatContext: z.string().describe("The name or topic of the retreat being discussed."),
});
export type MessageSuggestionsInput = z.infer<typeof MessageSuggestionsInputSchema>;

const MessageSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe("An array of 3 concise and relevant message suggestions."),
});
export type MessageSuggestionsOutput = z.infer<typeof MessageSuggestionsOutputSchema>;

export async function generateMessageSuggestions(
  input: MessageSuggestionsInput
): Promise<MessageSuggestionsOutput> {
  return generateSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'messageSuggestionsPrompt',
  input: {schema: MessageSuggestionsInputSchema},
  output: {schema: MessageSuggestionsOutputSchema},
  prompt: `You are an expert communication assistant for HighVibe Retreats, a platform connecting retreat organizers. Your goal is to help users communicate effectively to plan successful retreats.

A user, who is a {{userRole}}, is in a conversation with a {{partnerRole}} about a retreat called "{{retreatContext}}".

Based on the following conversation history, generate exactly 3 distinct, concise, and actionable message suggestions for the {{userRole}} to send next. The suggestions should help move the planning process forward.

CONVERSATION HISTORY:
{{#each conversationHistory}}
{{sender}}: "{{text}}"
{{/each}}

Based on this, suggest 3 helpful replies for the {{userRole}}.
`,
});

const generateSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateSuggestionsFlow',
    inputSchema: MessageSuggestionsInputSchema,
    outputSchema: MessageSuggestionsOutputSchema,
  },
  async input => {
    // Only send the last 10 messages to keep the prompt concise
    const recentHistory = input.conversationHistory.slice(-10);
    const {output} = await prompt({ ...input, conversationHistory: recentHistory });
    return output || { suggestions: [] };
  }
);
