'use server';

/**
 * @fileOverview AI-powered retreat description generator.
 *
 * - generateRetreatDescription - A function that generates a retreat description.
 * - RetreatDescriptionInput - The input type for the generateRetreatDescription function.
 * - RetreatDescriptionOutput - The return type for the generateRetreatDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RetreatDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe("Keywords related to the retreat, separated by commas."),
  retreatType: z.string().describe('The type of retreat (e.g., yoga, meditation, fitness).'),
});
export type RetreatDescriptionInput = z.infer<typeof RetreatDescriptionInputSchema>;

const RetreatDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated retreat description.'),
});
export type RetreatDescriptionOutput = z.infer<typeof RetreatDescriptionOutputSchema>;

export async function generateRetreatDescription(
  input: RetreatDescriptionInput
): Promise<RetreatDescriptionOutput> {
  return generateRetreatDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retreatDescriptionPrompt',
  input: {schema: RetreatDescriptionInputSchema},
  output: {schema: RetreatDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in writing compelling retreat descriptions.

  Based on the following keywords and retreat type, generate a draft retreat description.

  Keywords: {{{keywords}}}
  Retreat Type: {{{retreatType}}}

  Write a captivating description that highlights the key features and benefits of the retreat.
  The description should be engaging and encourage potential attendees to book the retreat.
  Do not include any promotional codes or website links.
  Keep the description concise (around 150-200 words).`,
});

const generateRetreatDescriptionFlow = ai.defineFlow(
  {
    name: 'generateRetreatDescriptionFlow',
    inputSchema: RetreatDescriptionInputSchema,
    outputSchema: RetreatDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
