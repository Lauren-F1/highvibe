'use server';
/**
 * @fileOverview An AI flow to improve a piece of profile text (like a bio or headline).
 *
 * - improveProfileText - A function that rewrites a user's profile text to be more professional.
 * - ImproveProfileTextInput - The input type for the function.
 * - ImproveProfileTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveProfileTextInputSchema = z.object({
  text: z.string().describe('The original text to be improved.'),
  textType: z.enum(['bio', 'headline']).describe('The type of text being improved.'),
});
export type ImproveProfileTextInput = z.infer<typeof ImproveProfileTextInputSchema>;

const ImproveProfileTextOutputSchema = z.object({
  improvedText: z.string().describe('The improved, professional version of the text.'),
});
export type ImproveProfileTextOutput = z.infer<typeof ImproveProfileTextOutputSchema>;

export async function improveProfileText(
  input: ImproveProfileTextInput
): Promise<ImproveProfileTextOutput> {
  return improveProfileTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveProfileTextPrompt',
  input: {schema: ImproveProfileTextInputSchema},
  output: {schema: ImproveProfileTextOutputSchema},
  prompt: `You are an expert profile copywriter for HighVibe Retreats, a platform for wellness and travel.
A user has written a {{textType}} and wants to improve it.
Rewrite the following text to be more professional, engaging, and appealing to potential clients or collaborators.

**Original {{textType}}:**
"{{text}}"

**Instructions for a Bio:**
- Write in the first person.
- Ensure it is warm, inviting, and professional.
- It should summarize who they are, what they do, and their unique style.
- Aim for around 150-200 words.

**Instructions for a Headline:**
- Keep it concise and powerful (under 80 characters).
- It should synthesize their skills and identity into an engaging phrase.

Based on the text and type, generate the improved version. Only return the improved text.`,
});

const improveProfileTextFlow = ai.defineFlow(
  {
    name: 'improveProfileTextFlow',
    inputSchema: ImproveProfileTextInputSchema,
    outputSchema: ImproveProfileTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
