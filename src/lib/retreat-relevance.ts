/**
 * Deterministic scoring for matching retreats against manifestations.
 * Used both server-side (reverse matching API) and client-side (Best Match sort).
 *
 * Scoring dimensions (0-100 total):
 * - Retreat type alignment (0-30)
 * - Location match (0-25)
 * - Budget fit (0-20)
 * - Group size fit (0-15)
 * - Luxury/lodging match (0-10)
 */

export interface RetreatForScoring {
  type?: string;
  locationDescription?: string;
  destination?: { country?: string; region?: string };
  costPerPerson?: number;
  capacity?: number;
  luxuryTier?: string;
  lodgingPreference?: string;
}

export interface ManifestationForScoring {
  retreat_types?: string[];
  destination?: { country?: string; region?: string };
  budget_range?: { min?: number; max?: number };
  group_size?: number;
  luxury_tier?: string;
  lodging_preference?: string;
}

export function scoreRetreatMatch(
  retreat: RetreatForScoring,
  manifestation: ManifestationForScoring,
): number {
  let score = 0;

  // 1. Retreat type alignment (0-30)
  if (manifestation.retreat_types?.length && retreat.type) {
    const retreatType = retreat.type.toLowerCase().replace(/[\s-]+/g, '');
    const manifTypes = manifestation.retreat_types.map(t => t.toLowerCase().replace(/[\s-]+/g, ''));
    if (manifTypes.includes(retreatType)) {
      score += 30;
    } else {
      // Partial match: check if any type starts similarly
      const partial = manifTypes.some(t => t.includes(retreatType) || retreatType.includes(t));
      if (partial) score += 15;
    }
  }

  // 2. Location match (0-25)
  const rDest = retreat.destination;
  const mDest = manifestation.destination;
  if (rDest && mDest) {
    const rCountry = (rDest.country || '').toLowerCase();
    const rRegion = (rDest.region || '').toLowerCase();
    const mCountry = (mDest.country || '').toLowerCase();
    const mRegion = (mDest.region || '').toLowerCase();

    if (rCountry && mCountry && rCountry === mCountry) {
      score += 20;
      if (rRegion && mRegion && rRegion === mRegion) {
        score += 5; // Exact region match bonus
      }
    } else if (rRegion && mRegion && rRegion === mRegion) {
      score += 15;
    } else {
      // Check location description as fallback
      const locDesc = (retreat.locationDescription || '').toLowerCase();
      if (mCountry && locDesc.includes(mCountry)) score += 15;
      else if (mRegion && locDesc.includes(mRegion)) score += 10;
    }
  }

  // 3. Budget fit (0-20)
  if (manifestation.budget_range && retreat.costPerPerson != null) {
    const min = manifestation.budget_range.min || 0;
    const max = manifestation.budget_range.max || Infinity;
    if (retreat.costPerPerson >= min && retreat.costPerPerson <= max) {
      score += 20;
    } else {
      // Within 20% of range still gets partial credit
      const range = max - min || max || 1;
      const overshoot = retreat.costPerPerson > max
        ? (retreat.costPerPerson - max) / range
        : (min - retreat.costPerPerson) / range;
      if (overshoot <= 0.2) score += 10;
    }
  }

  // 4. Group size fit (0-15)
  if (manifestation.group_size && retreat.capacity) {
    if (retreat.capacity >= manifestation.group_size) {
      score += 15;
    } else if (retreat.capacity >= manifestation.group_size * 0.7) {
      score += 8; // Close enough
    }
  }

  // 5. Luxury/lodging match (0-10)
  if (manifestation.luxury_tier && retreat.luxuryTier) {
    if (manifestation.luxury_tier.toLowerCase() === retreat.luxuryTier.toLowerCase()) {
      score += 5;
    }
  }
  if (manifestation.lodging_preference && retreat.lodgingPreference) {
    if (manifestation.lodging_preference.toLowerCase() === retreat.lodgingPreference.toLowerCase()) {
      score += 5;
    }
  }

  return Math.min(100, score);
}
