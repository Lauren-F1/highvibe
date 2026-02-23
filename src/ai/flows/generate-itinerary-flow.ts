'use server';
/**
 * @fileOverview An AI flow to generate a retreat itinerary.
 *
 * - generateItinerary - A function that creates a day-by-day schedule.
 * - GenerateItineraryInput - The input type for the function.
 * - GenerateItineraryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateItineraryInputSchema = z.object({
  theme: z.string().describe("The overall theme or title of the retreat."),
  destination: z.string().describe("The location of the retreat."),
  duration: z.string().describe("The total duration of the retreat in days."),
  keywords: z.string().describe("A comma-separated list of key activities, concepts, or required elements for the itinerary."),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

export const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe("A detailed, day-by-day itinerary formatted as markdown. Each day should be a heading, with bullet points for activities and timings."),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(
  input: GenerateItineraryInput
): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `You are an expert retreat producer for HighVibe Retreats, a luxury brand and functional marketplace. Your task is to create a thoughtful, well-paced, day-by-day itinerary for a retreat based on the provided details.

**Instructions:**
1.  **Logical Flow:** Arrange activities in a sensible order. Consider travel time, energy levels, and how activities build on each other. (e.g., place an acclimatization day early for high-altitude retreats).
2.  **Pacing:** Do not overschedule. Include downtime, free time, and meals. A luxury experience feels spacious, not rushed.
3.  **Formatting:** Use Markdown. Each day should be a heading (e.g., "### Day 1: Arrival & Grounding"). Use bullet points for activities, including approximate timings (e.g., "* 5:00 PM: Welcome Circle").
4.  **Tone:** The tone should be both inspiring and professional, blending emotional storytelling with operational clarity. Write with an elevated, confident voice that reflects a luxury brand.

**Retreat Details:**
*   **Theme:** {{theme}}
*   **Destination:** {{destination}}
*   **Duration:** {{duration}} days
*   **Key Elements:** {{keywords}}

Generate the complete itinerary based on these details.`,
});

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async input => {
    // Here you would add your marketing manifesto logic if needed before calling the LLM.
    const {output} = await prompt(input);
    return output!;
  }
);
