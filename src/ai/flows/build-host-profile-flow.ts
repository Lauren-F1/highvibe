'use server';
/**
 * AI flow to build a Host's profile from a spoken monologue.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildHostProfileInputSchema = z.object({
  monologue: z.string().describe('A spoken monologue from a new Host describing themselves and their property.'),
});
export type BuildHostProfileInput = z.infer<typeof BuildHostProfileInputSchema>;

export const BuildHostProfileOutputSchema = z.object({
  displayName: z.string().describe("The user's full name."),
  headline: z.string().describe("A short, engaging headline for their profile (under 80 characters)."),
  bio: z.string().describe("A professional and welcoming bio (around 150-200 words). Rewrite in the first person."),
  hostVibe: z.string().describe("The overall vibe of the property (e.g., 'Luxury + Elevated', 'Quiet + Restorative', 'Adventure + Outdoors')."),
  hostAmenities: z.array(z.string()).describe("A list of amenities the property offers (e.g., 'Pool', 'Yoga Studio', 'Full Kitchen', 'WiFi')."),
  typicalCapacity: z.number().describe("The typical guest capacity of the property."),
});
export type BuildHostProfileOutput = z.infer<typeof BuildHostProfileOutputSchema>;

export async function buildHostProfileFromMonologue(
  input: BuildHostProfileInput
): Promise<BuildHostProfileOutput> {
  return buildHostProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buildHostProfilePrompt',
  input: {schema: BuildHostProfileInputSchema},
  output: {schema: BuildHostProfileOutputSchema},
  prompt: `You are an expert profile-building assistant for HighVibe Retreats. Your task is to create a host profile that is calm, measured, intelligent, and invitational. Avoid hype, spiritual cliches, and exaggerated claims.

**Instructions:**
1.  **Extract Display Name:** Identify the user's full name.
2.  **Create a Headline:** Synthesize their property and hosting style into a concise headline (e.g., "Boutique Villa Host in Bali" or "Coastal Retreat Center with Ocean Views").
3.  **Write a Bio:** Based on their description, write a warm, inviting bio in the first person. It should describe their property, what makes it special, and their hosting philosophy. Aim for 150-200 words.
4.  **Identify Vibe:** Choose the best-fitting vibe from these options: "Quiet + Restorative", "Luxury + Elevated", "Adventure + Outdoors", "Community + Social", "Spiritual + Sacred", "Rustic + Off-Grid", "Beachfront + Coastal", "Jungle + Tropical", "Modern + Minimalist", "Cultural + Immersive". Pick the single best match.
5.  **Extract Amenities:** List specific amenities mentioned (e.g., "Pool", "Yoga Studio", "Full Kitchen", "WiFi", "Garden", "Meditation Space").
6.  **Estimate Capacity:** Extract the typical guest capacity. If not explicitly stated, make a reasonable estimate based on the description.

**User Monologue:**
"{{monologue}}"

Based on the text above, generate the structured profile information.
`,
});

const buildHostProfileFlow = ai.defineFlow(
  {
    name: 'buildHostProfileFlow',
    inputSchema: BuildHostProfileInputSchema,
    outputSchema: BuildHostProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
