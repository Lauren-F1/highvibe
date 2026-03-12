import { NextRequest, NextResponse } from 'next/server';
import { scoutVendors, type ScoutInput } from '@/ai/flows/scout-local-vendors';
import { verifyAuthToken } from '@/lib/stripe-auth';

/**
 * POST /api/scout
 *
 * Searches for local vendors using Google Places API + Gemini AI enrichment.
 * Only returns vendors with publicly listed contact emails.
 * Requires authentication.
 *
 * Body: { location: string, category: string, retreatDescription?: string }
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAuthToken(request);

    const body = await request.json();

    const { location, category, retreatDescription } = body as ScoutInput;

    if (!location || !category) {
      return NextResponse.json(
        { error: 'location and category are required' },
        { status: 400 }
      );
    }

    const result = await scoutVendors({ location, category, retreatDescription });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Scout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scout vendors' },
      { status: 500 }
    );
  }
}
