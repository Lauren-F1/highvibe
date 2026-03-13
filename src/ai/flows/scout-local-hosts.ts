'use server';

/**
 * @fileOverview Scout Local Hosts — AI-powered accommodation discovery.
 *
 * Uses Google Places API to find boutique hotels, resorts, villas, eco-lodges,
 * and retreat centers matching a location, then uses Gemini to enrich and score
 * each result for retreat hosting suitability.
 *
 * Only businesses with a publicly listed email are included in results.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Input / Output Schemas ---

const HostScoutInputSchema = z.object({
  location: z.string().describe('The location to search near (e.g., "Ubud, Bali" or "Topanga, California")'),
  accommodationType: z.string().describe('The type of accommodation to search for (e.g., "Boutique Hotel", "Resort", "Villa", "Eco-Lodge", "Retreat Center")'),
  retreatDescription: z.string().optional().describe('Optional description of the retreat for better matching'),
  groupSize: z.number().optional().describe('Expected group size for capacity matching'),
});
export type HostScoutInput = z.infer<typeof HostScoutInputSchema>;

const ScoutedHostSchema = z.object({
  name: z.string().describe('Property name'),
  address: z.string().describe('Property address'),
  phone: z.string().optional().describe('Phone number if available'),
  website: z.string().optional().describe('Website URL if available'),
  email: z.string().describe('Contact email (required — properties without email are excluded)'),
  rating: z.number().optional().describe('Google rating (0-5)'),
  reviewCount: z.number().optional().describe('Number of Google reviews'),
  accommodationType: z.string().describe('Property type'),
  relevanceScore: z.number().describe('AI-computed relevance score 0-100'),
  relevanceReason: z.string().describe('Short explanation of why this property is a good fit for retreat hosting'),
  photoUrl: z.string().optional().describe('Property photo URL'),
  estimatedCapacity: z.string().optional().describe('AI-estimated guest capacity (e.g., "20-30 guests")'),
});

const HostScoutOutputSchema = z.object({
  hosts: z.array(ScoutedHostSchema).describe('List of scouted properties with email, sorted by relevance'),
  searchSummary: z.string().describe('Brief summary of the search results'),
});
export type HostScoutOutput = z.infer<typeof HostScoutOutputSchema>;
export type ScoutedHost = z.infer<typeof ScoutedHostSchema>;

// --- Google Places API ---

interface PlacesResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  place_id: string;
  business_status?: string;
}

async function searchGooglePlaces(
  accommodationType: string,
  location: string,
  apiKey: string
): Promise<PlacesResult[]> {
  // Use multiple search queries to maximize results for accommodation types
  const searchQueries = [
    `${accommodationType} near ${location}`,
    `boutique ${accommodationType} ${location}`,
  ];

  const allResults = new Map<string, PlacesResult>();

  for (const searchQuery of searchQueries) {
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    const searchResponse = await fetch(textSearchUrl);
    const searchData = await searchResponse.json();

    if (searchData.results) {
      for (const place of searchData.results) {
        if (!allResults.has(place.place_id)) {
          allResults.set(place.place_id, place);
        }
      }
    }
  }

  // Get details for top 12 results
  const detailedResults: PlacesResult[] = [];
  const places = Array.from(allResults.values()).slice(0, 12);

  for (const place of places) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,business_status&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.result) {
        detailedResults.push({
          ...detailsData.result,
          place_id: place.place_id,
        });
      }
    } catch (error) {
      console.error(`Error fetching details for ${place.name}:`, error);
    }
  }

  return detailedResults;
}

// --- Email Extraction ---

async function extractEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  const pagesToTry = [
    websiteUrl,
    `${websiteUrl.replace(/\/$/, '')}/contact`,
    `${websiteUrl.replace(/\/$/, '')}/about`,
    `${websiteUrl.replace(/\/$/, '')}/contact-us`,
    `${websiteUrl.replace(/\/$/, '')}/group-bookings`,
    `${websiteUrl.replace(/\/$/, '')}/events`,
  ];

  for (const url of pagesToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'HighVibeRetreats/1.0 (host-partnership-inquiry)' },
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const html = await response.text();
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = html.match(emailRegex) || [];

      const filteredEmails = emails.filter(email => {
        const lower = email.toLowerCase();
        return !lower.includes('example.com') &&
          !lower.includes('sentry.io') &&
          !lower.includes('wixpress.com') &&
          !lower.includes('googleapis.com') &&
          !lower.endsWith('.png') &&
          !lower.endsWith('.jpg') &&
          !lower.endsWith('.svg');
      });

      if (filteredEmails.length > 0) {
        // Prefer relevant contact addresses
        const preferred = filteredEmails.find(e => {
          const lower = e.toLowerCase();
          return lower.startsWith('info@') ||
            lower.startsWith('contact@') ||
            lower.startsWith('hello@') ||
            lower.startsWith('reservations@') ||
            lower.startsWith('events@') ||
            lower.startsWith('groups@') ||
            lower.startsWith('bookings@') ||
            lower.startsWith('enquir');
        });
        return preferred || filteredEmails[0];
      }
    } catch {
      continue;
    }
  }

  return null;
}

// --- AI Enrichment Prompt ---

const enrichPrompt = ai.definePrompt({
  name: 'hostScoutEnrichPrompt',
  input: {
    schema: z.object({
      properties: z.array(z.object({
        name: z.string(),
        address: z.string(),
        website: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        accommodationType: z.string(),
        email: z.string(),
      })),
      searchAccommodationType: z.string(),
      searchLocation: z.string(),
      retreatDescription: z.string().optional(),
      groupSize: z.number().optional(),
    }),
  },
  output: {
    schema: z.object({
      enrichedProperties: z.array(z.object({
        name: z.string(),
        relevanceScore: z.number(),
        relevanceReason: z.string(),
        estimatedCapacity: z.string().optional(),
      })),
    }),
  },
  prompt: `You are a property matchmaker for HighVibe Retreats, a wellness retreat marketplace.

A retreat leader is looking for **{{searchAccommodationType}}** properties near **{{searchLocation}}** to host a retreat.
{{#if retreatDescription}}Their retreat: {{retreatDescription}}{{/if}}
{{#if groupSize}}Expected group size: {{groupSize}} people{{/if}}

Score each property on suitability for hosting wellness/spiritual retreats (0-100).
Consider: location appeal, property type alignment with retreat hosting, Google rating, review volume, and whether the property name/type suggests it could accommodate groups.

Properties to evaluate:
{{#each properties}}
- **{{this.name}}** ({{this.address}})
  {{#if this.website}}Website: {{this.website}}{{/if}}
  Rating: {{this.rating}}/5 ({{this.reviewCount}} reviews)
  Type search: {{this.accommodationType}}
  Email: {{this.email}}
{{/each}}

For each property, provide:
- relevanceScore: 0-100 (higher = better fit for retreat hosting)
- relevanceReason: One sentence explaining the fit (e.g., "Boutique resort with spa facilities and group event spaces, ideal for wellness retreats")
- estimatedCapacity: Estimated guest capacity based on property type and name (e.g., "15-25 guests")`,
});

// --- Main Scout Flow ---

export const scoutLocalHosts = ai.defineFlow(
  {
    name: 'scoutLocalHostsFlow',
    inputSchema: HostScoutInputSchema,
    outputSchema: HostScoutOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    // Step 1: Search Google Places
    const places = await searchGooglePlaces(input.accommodationType, input.location, apiKey);

    if (places.length === 0) {
      return {
        hosts: [],
        searchSummary: `No ${input.accommodationType} properties found near ${input.location}.`,
      };
    }

    // Step 2: Extract emails from websites
    const propertiesWithEmail: {
      name: string;
      address: string;
      phone?: string;
      website?: string;
      email: string;
      rating?: number;
      reviewCount?: number;
      accommodationType: string;
      photoUrl?: string;
    }[] = [];

    for (const place of places) {
      let email: string | null = null;

      if (place.website) {
        email = await extractEmailFromWebsite(place.website);
      }

      if (!email) continue;

      propertiesWithEmail.push({
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        email,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        accommodationType: input.accommodationType,
        photoUrl: place.photos?.[0]?.photo_reference
          ? `/api/scout/photo?ref=${encodeURIComponent(place.photos[0].photo_reference)}`
          : undefined,
      });
    }

    if (propertiesWithEmail.length === 0) {
      return {
        hosts: [],
        searchSummary: `Found ${places.length} ${input.accommodationType} properties near ${input.location}, but none had a publicly listed contact email.`,
      };
    }

    // Step 3: AI enrichment
    const { output: enriched } = await enrichPrompt({
      properties: propertiesWithEmail.map(p => ({
        name: p.name,
        address: p.address,
        website: p.website,
        rating: p.rating,
        reviewCount: p.reviewCount,
        accommodationType: p.accommodationType,
        email: p.email,
      })),
      searchAccommodationType: input.accommodationType,
      searchLocation: input.location,
      retreatDescription: input.retreatDescription,
      groupSize: input.groupSize,
    });

    // Step 4: Merge enrichment data
    const scoredHosts: ScoutedHost[] = propertiesWithEmail.map(property => {
      const enrichment = enriched?.enrichedProperties?.find(e => e.name === property.name);
      return {
        name: property.name,
        address: property.address,
        phone: property.phone,
        website: property.website,
        email: property.email,
        rating: property.rating,
        reviewCount: property.reviewCount,
        accommodationType: property.accommodationType,
        relevanceScore: enrichment?.relevanceScore ?? 50,
        relevanceReason: enrichment?.relevanceReason ?? 'Matches your search criteria.',
        photoUrl: property.photoUrl,
        estimatedCapacity: enrichment?.estimatedCapacity,
      };
    });

    scoredHosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      hosts: scoredHosts,
      searchSummary: `Found ${scoredHosts.length} ${input.accommodationType} propert${scoredHosts.length === 1 ? 'y' : 'ies'} near ${input.location} with contact info available.`,
    };
  }
);

// Server action wrapper
export async function scoutHosts(input: HostScoutInput): Promise<HostScoutOutput> {
  return scoutLocalHosts(input);
}
