/**
 * Static location → coordinates lookup for retreats missing lat/lng.
 * No external API calls — just a hardcoded table of known retreat destinations.
 */
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'bali, indonesia': { lat: -8.5069, lng: 115.2624 },
  'ubud, indonesia': { lat: -8.5069, lng: 115.2624 },
  'kyoto, japan': { lat: 35.0116, lng: 135.7681 },
  'cusco, peru': { lat: -13.5320, lng: -71.9675 },
  'sacred valley, peru': { lat: -13.3300, lng: -72.0800 },
  'tulum, mexico': { lat: 20.2114, lng: -87.4654 },
  'sedona, arizona': { lat: 34.8697, lng: -111.7610 },
  'big sur, california': { lat: 36.2704, lng: -121.8081 },
  'tuscany, italy': { lat: 43.7711, lng: 11.2486 },
  'ibiza, spain': { lat: 38.9067, lng: 1.4206 },
  'algarve, portugal': { lat: 37.0179, lng: -7.9304 },
  'santorini, greece': { lat: 36.3932, lng: 25.4615 },
  'costa rica': { lat: 9.7489, lng: -83.7534 },
  'hawaii, usa': { lat: 19.8968, lng: -155.5828 },
  'byron bay, australia': { lat: -28.6474, lng: 153.6020 },
  'queenstown, new zealand': { lat: -45.0312, lng: 168.6626 },
  'fiji': { lat: -17.7134, lng: 178.0650 },
  'chiang mai, thailand': { lat: 18.7883, lng: 98.9853 },
  'goa, india': { lat: 15.2993, lng: 74.1240 },
  'sri lanka': { lat: 7.8731, lng: 80.7718 },
  'marrakech, morocco': { lat: 31.6295, lng: -7.9811 },
  'cape town, south africa': { lat: -33.9249, lng: 18.4241 },
  'zanzibar, tanzania': { lat: -6.1659, lng: 39.2026 },
  'medellin, colombia': { lat: 6.2442, lng: -75.5812 },
  'florianopolis, brazil': { lat: -27.5954, lng: -48.5480 },
  'swiss alps, switzerland': { lat: 46.8182, lng: 8.2275 },
};

export function getCoordinatesForLocation(location: string): { lat: number; lng: number } | null {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();

  // Exact match
  if (LOCATION_COORDS[normalized]) return LOCATION_COORDS[normalized];

  // Partial match (e.g., "Bali" matches "bali, indonesia")
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (normalized.includes(key.split(',')[0]) || key.includes(normalized)) {
      return coords;
    }
  }

  return null;
}
