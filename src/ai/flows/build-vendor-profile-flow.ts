'use server';
/**
 * AI flow to build a Vendor's profile from a spoken monologue.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildVendorProfileInputSchema = z.object({
  monologue: z.string().describe('A spoken monologue from a new Vendor describing themselves and their services.'),
});
export type BuildVendorProfileInput = z.infer<typeof BuildVendorProfileInputSchema>;

export const BuildVendorProfileOutputSchema = z.object({
  displayName: z.string().describe("The user's full name."),
  headline: z.string().describe("A short, engaging headline for their profile (under 80 characters)."),
  bio: z.string().describe("A professional and welcoming bio (around 150-200 words). Rewrite in the first person."),
  vendorCategories: z.array(z.string()).describe("A list of service categories (e.g., 'Yoga / Meditation Instruction', 'Massage / Bodywork', 'Catering / Private Chef')."),
  offerings: z.array(z.string()).describe("Specific services or packages offered (e.g., '90-min Deep Tissue Massage', 'Vinyasa Flow Class', 'Farm-to-Table Dinner Service')."),
  serviceRadiusMiles: z.number().describe("How far they are willing to travel to provide services, in miles. Default to 50 if not mentioned."),
});
export type BuildVendorProfileOutput = z.infer<typeof BuildVendorProfileOutputSchema>;

export async function buildVendorProfileFromMonologue(
  input: BuildVendorProfileInput
): Promise<BuildVendorProfileOutput> {
  return buildVendorProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buildVendorProfilePrompt',
  input: {schema: BuildVendorProfileInputSchema},
  output: {schema: BuildVendorProfileOutputSchema},
  prompt: `You are an expert profile-building assistant for HighVibe Retreats. Your task is to create a vendor/service provider profile that is calm, measured, intelligent, and invitational. Avoid hype, spiritual cliches, and exaggerated claims.

**Instructions:**
1.  **Extract Display Name:** Identify the user's full name.
2.  **Create a Headline:** Synthesize their services into a concise headline (e.g., "Sound Healer & Breathwork Facilitator" or "Private Chef Specializing in Plant-Based Cuisine").
3.  **Write a Bio:** Based on their description, write a warm, inviting bio in the first person. It should describe their services, experience, and what makes them unique. Aim for 150-200 words.
4.  **Identify Categories:** Map their services to these categories (pick all that apply): "Yoga / Meditation Instruction", "Breathwork / Pranayama", "Sound Healing / Sound Baths", "Reiki / Energy Work", "Massage / Bodywork", "Catering / Private Chef", "Nutrition / Meal Planning", "Photography", "Videography", "Florist / Event Design", "Transportation / Shuttle", "Adventure / Outdoor Guides", "Surf / Water Sports Instruction", "Art / Creative Workshop Facilitation", "Music / DJ / Live Performance", "Ceremony / Ritual Facilitation", "Life Coaching / Transformational Coaching", "Acupuncture / TCM", "Ayurveda", "Fitness / Personal Training", "Dance / Movement Instruction", "Spa / Esthetician Services", "Event Planning / Retreat Coordination".
5.  **Extract Offerings:** List specific services or packages they mentioned.
6.  **Service Radius:** Extract how far they travel. Default to 50 miles if not mentioned.

**User Monologue:**
"{{monologue}}"

Based on the text above, generate the structured profile information.
`,
});

const buildVendorProfileFlow = ai.defineFlow(
  {
    name: 'buildVendorProfileFlow',
    inputSchema: BuildVendorProfileInputSchema,
    outputSchema: BuildVendorProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
