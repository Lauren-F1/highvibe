import { NextRequest, NextResponse } from 'next/server';
import { scoutHosts, type HostScoutInput } from '@/ai/flows/scout-local-hosts';
import { verifyAuthToken } from '@/lib/stripe-auth';

/**
 * POST /api/scout/hosts
 *
 * Searches for local accommodation properties (boutique hotels, resorts, villas,
 * eco-lodges, retreat centers) using Google Places API + Gemini AI enrichment.
 * Only returns properties with publicly listed contact emails.
 * Requires authentication.
 *
 * Body: { location: string, accommodationType: string, retreatDescription?: string, groupSize?: number }
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAuthToken(request);

    const body = await request.json();
    const { location, accommodationType, retreatDescription, groupSize } = body as HostScoutInput;

    if (!location || !accommodationType) {
      return NextResponse.json(
        { error: 'location and accommodationType are required' },
        { status: 400 }
      );
    }

    const result = await scoutHosts({ location, accommodationType, retreatDescription, groupSize });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Host scout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scout host properties' },
      { status: 500 }
    );
  }
}
