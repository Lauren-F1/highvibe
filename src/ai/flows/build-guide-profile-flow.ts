'use server';
/**
 * @fileOverview An AI flow to build a Guide's profile from a spoken monologue.
 *
 * - buildGuideProfileFromMonologue - A function that extracts structured profile data from text.
 * - BuildGuideProfileInput - The input type for the function.
 * - BuildGuideProfileOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildGuideProfileInputSchema = z.object({
  monologue: z.string().describe('A spoken monologue from a new Guide describing themselves and their work.'),
});
export type BuildGuideProfileInput = z.infer<typeof BuildGuideProfileInputSchema>;

export const BuildGuideProfileOutputSchema = z.object({
  displayName: z.string().describe("The user's full name."),
  headline: z.string().describe("A short, engaging headline for their profile (under 80 characters)."),
  bio: z.string().describe("A professional and welcoming bio (around 150-200 words). Rewrite the user's description in the first person."),
  guideRetreatTypes: z.array(z.string()).describe("A list of specific retreat types or specialties mentioned (e.g., 'Vinyasa Yoga', 'Sound Healing', 'Leadership Workshops')."),
});
export type BuildGuideProfileOutput = z.infer<typeof BuildGuideProfileOutputSchema>;

export async function buildGuideProfileFromMonologue(
  input: BuildGuideProfileInput
): Promise<BuildGuideProfileOutput> {
  return buildGuideProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buildGuideProfilePrompt',
  input: {schema: BuildGuideProfileInputSchema},
  output: {schema: BuildGuideProfileOutputSchema},
  prompt: `You are an expert profile-building assistant for HighVibe Retreats.
A new Guide has recorded a short monologue describing themselves. Your task is to analyze the text and extract the key information to create a professional and appealing profile for them.

**Instructions:**
1.  **Extract Display Name:** Identify the user's full name.
2.  **Create a Headline:** Synthesize their skills and identity into a concise, powerful headline (e.g., "Yoga Instructor & Sound Healer" or "Leading Journeys Back to the Self").
3.  **Write a Bio:** Based on their description, write a warm, inviting, and professional bio in the first person. It should summarize who they are, what they do, and their unique style.
4.  **Identify Specialties:** Extract a list of their specific skills or the types of retreats they lead. These should be short and clear (e.g., "Vinyasa Yoga", "Restorative Sound Baths", "Corporate Wellness").

**User Monologue:**
"{{monologue}}"

Based on the text above, generate the structured profile information.
`,
});

const buildGuideProfileFlow = ai.defineFlow(
  {
    name: 'buildGuideProfileFlow',
    inputSchema: BuildGuideProfileInputSchema,
    outputSchema: BuildGuideProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
