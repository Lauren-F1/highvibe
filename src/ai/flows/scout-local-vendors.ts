'use server';

/**
 * @fileOverview Scout Local Vendors — AI-powered vendor discovery.
 *
 * Uses Google Places API to find local businesses matching a category and location,
 * then uses Gemini to enrich and score each result for retreat relevance.
 *
 * Only businesses with a publicly listed email are included in results.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Input / Output Schemas ---

const ScoutInputSchema = z.object({
  location: z.string().describe('The location to search near (e.g., "Ubud, Bali" or "Topanga, California")'),
  category: z.string().describe('The type of vendor to search for (e.g., "Catering", "Photography", "Yoga Instructor")'),
  retreatDescription: z.string().optional().describe('Optional description of the retreat for better matching'),
});
export type ScoutInput = z.infer<typeof ScoutInputSchema>;

const ScoutedVendorSchema = z.object({
  name: z.string().describe('Business name'),
  address: z.string().describe('Business address'),
  phone: z.string().optional().describe('Phone number if available'),
  website: z.string().optional().describe('Website URL if available'),
  email: z.string().describe('Contact email (required — businesses without email are excluded)'),
  rating: z.number().optional().describe('Google rating (0-5)'),
  reviewCount: z.number().optional().describe('Number of Google reviews'),
  category: z.string().describe('Business category'),
  relevanceScore: z.number().describe('AI-computed relevance score 0-100'),
  relevanceReason: z.string().describe('Short explanation of why this vendor is a good fit'),
  photoUrl: z.string().optional().describe('Business photo URL'),
});

const ScoutOutputSchema = z.object({
  vendors: z.array(ScoutedVendorSchema).describe('List of scouted vendors with email, sorted by relevance'),
  searchSummary: z.string().describe('Brief summary of the search results'),
});
export type ScoutOutput = z.infer<typeof ScoutOutputSchema>;
export type ScoutedVendor = z.infer<typeof ScoutedVendorSchema>;

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
  category: string,
  location: string,
  apiKey: string
): Promise<PlacesResult[]> {
  const searchQuery = `${category} near ${location}`;
  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

  const searchResponse = await fetch(textSearchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.results || searchData.results.length === 0) {
    return [];
  }

  // Get details for top 10 results (to get phone, website, email)
  const detailedResults: PlacesResult[] = [];

  for (const place of searchData.results.slice(0, 10)) {
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

/**
 * Attempts to extract a contact email from a business website.
 * Fetches the homepage and common contact pages, then uses regex to find emails.
 * Returns null if no email found (and the business will be excluded from results).
 */
async function extractEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  const pagesToTry = [
    websiteUrl,
    `${websiteUrl.replace(/\/$/, '')}/contact`,
    `${websiteUrl.replace(/\/$/, '')}/about`,
  ];

  for (const url of pagesToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'HighVibeRetreats/1.0 (vendor-partnership-inquiry)' },
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const html = await response.text();
      // Match email addresses, excluding common false positives
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = html.match(emailRegex) || [];

      // Filter out generic/tracking emails
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
        // Prefer info@, contact@, hello@ addresses
        const preferred = filteredEmails.find(e =>
          e.toLowerCase().startsWith('info@') ||
          e.toLowerCase().startsWith('contact@') ||
          e.toLowerCase().startsWith('hello@') ||
          e.toLowerCase().startsWith('enquir')
        );
        return preferred || filteredEmails[0];
      }
    } catch {
      // Timeout or fetch error — skip this page
      continue;
    }
  }

  return null;
}

// --- AI Enrichment Prompt ---

const enrichPrompt = ai.definePrompt({
  name: 'scoutEnrichPrompt',
  input: {
    schema: z.object({
      vendors: z.array(z.object({
        name: z.string(),
        address: z.string(),
        website: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        category: z.string(),
        email: z.string(),
      })),
      retreatCategory: z.string(),
      retreatLocation: z.string(),
      retreatDescription: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      enrichedVendors: z.array(z.object({
        name: z.string(),
        relevanceScore: z.number(),
        relevanceReason: z.string(),
      })),
    }),
  },
  prompt: `You are a vendor matchmaker for HighVibe Retreats, a wellness retreat marketplace.

A retreat leader is looking for **{{retreatCategory}}** services near **{{retreatLocation}}**.
{{#if retreatDescription}}Their retreat: {{retreatDescription}}{{/if}}

Score each vendor on relevance (0-100) and explain why they'd be a good fit for a wellness/retreat context.
Consider: location proximity, business type alignment, Google rating, and review volume.

Vendors to evaluate:
{{#each vendors}}
- **{{this.name}}** ({{this.address}})
  {{#if this.website}}Website: {{this.website}}{{/if}}
  Rating: {{this.rating}}/5 ({{this.reviewCount}} reviews)
  Category search: {{this.category}}
  Email: {{this.email}}
{{/each}}

For each vendor, provide:
- relevanceScore: 0-100 (higher = better fit for retreat context)
- relevanceReason: One sentence explaining the fit (e.g., "Highly rated organic caterer with experience serving wellness events")`,
});

// --- Main Scout Flow ---

export const scoutLocalVendors = ai.defineFlow(
  {
    name: 'scoutLocalVendorsFlow',
    inputSchema: ScoutInputSchema,
    outputSchema: ScoutOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    // Step 1: Search Google Places
    const places = await searchGooglePlaces(input.category, input.location, apiKey);

    if (places.length === 0) {
      return {
        vendors: [],
        searchSummary: `No ${input.category} businesses found near ${input.location}.`,
      };
    }

    // Step 2: Extract emails from websites (no email = excluded)
    const vendorsWithEmail: {
      name: string;
      address: string;
      phone?: string;
      website?: string;
      email: string;
      rating?: number;
      reviewCount?: number;
      category: string;
      photoUrl?: string;
    }[] = [];

    for (const place of places) {
      let email: string | null = null;

      if (place.website) {
        email = await extractEmailFromWebsite(place.website);
      }

      // No email = no contact. Skip this vendor.
      if (!email) continue;

      vendorsWithEmail.push({
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        email,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        category: input.category,
        photoUrl: place.photos?.[0]?.photo_reference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
          : undefined,
      });
    }

    if (vendorsWithEmail.length === 0) {
      return {
        vendors: [],
        searchSummary: `Found ${places.length} ${input.category} businesses near ${input.location}, but none had a publicly listed contact email.`,
      };
    }

    // Step 3: AI enrichment — score and explain relevance
    const { output: enriched } = await enrichPrompt({
      vendors: vendorsWithEmail.map(v => ({
        name: v.name,
        address: v.address,
        website: v.website,
        rating: v.rating,
        reviewCount: v.reviewCount,
        category: v.category,
        email: v.email,
      })),
      retreatCategory: input.category,
      retreatLocation: input.location,
      retreatDescription: input.retreatDescription,
    });

    // Step 4: Merge enrichment data with vendor details
    const scoredVendors: ScoutedVendor[] = vendorsWithEmail.map(vendor => {
      const enrichment = enriched?.enrichedVendors?.find(e => e.name === vendor.name);
      return {
        name: vendor.name,
        address: vendor.address,
        phone: vendor.phone,
        website: vendor.website,
        email: vendor.email,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        category: vendor.category,
        relevanceScore: enrichment?.relevanceScore ?? 50,
        relevanceReason: enrichment?.relevanceReason ?? 'Matches your search criteria.',
        photoUrl: vendor.photoUrl,
      };
    });

    // Sort by relevance score descending
    scoredVendors.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      vendors: scoredVendors,
      searchSummary: `Found ${scoredVendors.length} ${input.category} vendor${scoredVendors.length === 1 ? '' : 's'} near ${input.location} with contact info available.`,
    };
  }
);

// Server action wrapper
export async function scoutVendors(input: ScoutInput): Promise<ScoutOutput> {
  return scoutLocalVendors(input);
}
