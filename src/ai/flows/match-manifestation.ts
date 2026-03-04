'use server';

/**
 * @fileOverview Match Manifestation — AI-powered provider matching.
 *
 * Scores guides, hosts, and vendors against a seeker's manifestation request
 * using Gemini to evaluate fit across retreat type, location, capacity, and vibe.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Input / Output Schemas ---

const ProviderProfileSchema = z.object({
  id: z.string().describe('Provider user ID'),
  role: z.enum(['guide', 'host', 'vendor']).describe('Provider role'),
  displayName: z.string().describe('Provider display name'),
  location: z.string().optional().describe('Provider location label'),
  specialties: z.string().optional().describe('Comma-separated specialties (guideRetreatTypes, vendorCategories, hostVibe)'),
  capacity: z.number().optional().describe('Typical capacity (hosts)'),
  bio: z.string().optional().describe('Provider bio or headline'),
});

const ManifestationInputSchema = z.object({
  destination_country: z.string().describe('Seeker desired country'),
  destination_region: z.string().optional().describe('Seeker desired region'),
  retreat_types: z.array(z.string()).describe('Desired retreat types'),
  must_haves: z.array(z.string()).describe('Must-have features'),
  nice_to_haves: z.array(z.string()).describe('Nice-to-have features'),
  group_size: z.number().describe('Expected group size'),
  lodging_preference: z.string().optional().describe('Lodging preference'),
  luxury_tier: z.string().optional().describe('Luxury tier preference'),
  budget_range: z.string().optional().describe('Budget range'),
  notes_text: z.string().optional().describe('Additional notes from seeker'),
});

const MatchInputSchema = z.object({
  manifestation: ManifestationInputSchema,
  providers: z.array(ProviderProfileSchema).describe('All eligible providers to score'),
});
export type MatchInput = z.infer<typeof MatchInputSchema>;

const ScoredMatchSchema = z.object({
  providerId: z.string().describe('Provider user ID'),
  providerRole: z.enum(['guide', 'host', 'vendor']).describe('Provider role'),
  score: z.number().describe('Overall match score 0-100'),
  scoreBreakdown: z.object({
    retreatTypeAlignment: z.number().describe('How well specialties align with retreat types (0-25)'),
    locationMatch: z.number().describe('Geographic proximity/alignment (0-25)'),
    capacityFit: z.number().describe('Group size and lodging compatibility (0-25)'),
    vibeCompatibility: z.number().describe('Luxury tier, nice-to-haves, aesthetic fit (0-25)'),
  }),
  matchReason: z.string().describe('One sentence explaining why this provider is a good match'),
});

const MatchOutputSchema = z.object({
  matches: z.array(ScoredMatchSchema).describe('Scored providers sorted by score descending'),
});
export type MatchOutput = z.infer<typeof MatchOutputSchema>;
export type ScoredMatch = z.infer<typeof ScoredMatchSchema>;

// --- Exported function ---

export async function matchManifestation(input: MatchInput): Promise<MatchOutput> {
  return matchManifestationFlow(input);
}

// --- AI Prompt ---

const matchPrompt = ai.definePrompt({
  name: 'matchManifestationPrompt',
  input: { schema: MatchInputSchema },
  output: { schema: MatchOutputSchema },
  prompt: `You are the matching engine for HighVibe Retreats, a wellness retreat marketplace.

A seeker has submitted a manifestation (dream retreat request). Your job is to score each provider on how well they match the seeker's vision.

## Seeker's Manifestation
- **Destination:** {{manifestation.destination_country}}{{#if manifestation.destination_region}}, {{manifestation.destination_region}}{{/if}}
- **Retreat Types:** {{#each manifestation.retreat_types}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Must-Haves:** {{#each manifestation.must_haves}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Nice-to-Haves:** {{#each manifestation.nice_to_haves}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Group Size:** {{manifestation.group_size}}
{{#if manifestation.lodging_preference}}- **Lodging:** {{manifestation.lodging_preference}}{{/if}}
{{#if manifestation.luxury_tier}}- **Luxury Tier:** {{manifestation.luxury_tier}}{{/if}}
{{#if manifestation.budget_range}}- **Budget:** {{manifestation.budget_range}}{{/if}}
{{#if manifestation.notes_text}}- **Notes:** {{manifestation.notes_text}}{{/if}}

## Providers to Evaluate
{{#each providers}}
- **{{this.displayName}}** ({{this.role}}) [ID: {{this.id}}]
  {{#if this.location}}Location: {{this.location}}{{/if}}
  {{#if this.specialties}}Specialties: {{this.specialties}}{{/if}}
  {{#if this.capacity}}Capacity: {{this.capacity}}{{/if}}
  {{#if this.bio}}Bio: {{this.bio}}{{/if}}
{{/each}}

## Scoring Rubric (4 dimensions, each 0-25, total 0-100)

1. **retreatTypeAlignment (0-25):** How well the provider's specialties match the seeker's retreat types and must-haves. Perfect overlap = 25, partial = 10-20, none = 0-5.

2. **locationMatch (0-25):** Geographic alignment. Same country/region = 20-25, same continent = 10-15, different = 0-5. For vendors/hosts, proximity to the desired destination matters most.

3. **capacityFit (0-25):** Can the provider handle the group size? Does the lodging preference align? Hosts: capacity vs group_size. Guides: experience with similar group sizes. Vendors: ability to serve the group.

4. **vibeCompatibility (0-25):** Does the provider's style match the luxury tier, nice-to-haves, and overall aesthetic? Read the seeker's notes for personality cues.

For each provider, return:
- The 4 sub-scores (each 0-25)
- A total score (sum of sub-scores, 0-100)
- A one-sentence matchReason explaining the fit

Sort results by total score descending. Only include providers with a score of 30 or higher.`,
});

// --- Flow ---

const matchManifestationFlow = ai.defineFlow(
  {
    name: 'matchManifestationFlow',
    inputSchema: MatchInputSchema,
    outputSchema: MatchOutputSchema,
  },
  async (input) => {
    if (input.providers.length === 0) {
      return { matches: [] };
    }

    const { output } = await matchPrompt(input);
    return output ?? { matches: [] };
  },
);
