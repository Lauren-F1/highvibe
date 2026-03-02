/**
 * Shared utility for querying Firestore users by role
 * and mapping them to the card component interfaces (Guide, Vendor, Host).
 *
 * Each dashboard calls `loadPartnersByRole()` to get real user profiles
 * from Firestore, with a fallback to mock data when no real users exist.
 */

import type { Guide } from '@/components/guide-card';
import type { Vendor } from '@/lib/mock-data';
import type { Host } from '@/components/host-card';
import type { UserProfile } from '@/firebase/auth/use-user';
import { Firestore, collection, query, where, getDocs } from 'firebase/firestore';

// --- Mappers: UserProfile → Card Interface ---

export function userProfileToGuide(profile: UserProfile): Guide {
  return {
    id: profile.uid,
    uid: profile.uid,
    name: profile.displayName || 'Anonymous Guide',
    specialty: profile.guideRetreatTypes?.join(', ') || 'Retreat Leader',
    rating: 0, // No reviews system yet
    reviewCount: 0,
    avatar: profile.avatarUrl || '',
    upcomingRetreatsCount: 0, // Could query retreats collection later
    retreatTypes: profile.guideRetreatTypes,
    premiumMembership: false, // Could check subscription later
    profileSlug: profile.profileSlug,
  };
}

export function userProfileToVendor(profile: UserProfile): Vendor {
  return {
    id: profile.uid,
    uid: profile.uid,
    name: profile.displayName || 'Anonymous Vendor',
    category: profile.vendorCategories?.join(', ') || 'Services',
    rating: 0,
    reviewCount: 0,
    avatar: profile.avatarUrl || '',
    luxApproved: false,
    premiumMembership: false,
    location: profile.locationLabel || '',
    vendorLat: profile.locationLat,
    vendorLng: profile.locationLng,
    startingPrice: undefined,
    profileSlug: profile.profileSlug,
  };
}

export function userProfileToHost(profile: UserProfile): Host {
  return {
    id: profile.uid,
    name: profile.displayName || 'Anonymous Host',
    location: profile.locationLabel || '',
    capacity: profile.typicalCapacity || 0,
    bedrooms: 0, // Not on user profile — on Space entity
    bathrooms: 0,
    pricePerNight: 0, // Not on user profile — on Space entity
    propertyType: profile.hostVibe || 'Property',
    image: profile.propertyShowcaseUrls?.[0] || profile.avatarUrl || '',
    luxApproved: false,
    premiumMembership: false,
    profileSlug: profile.profileSlug,
    hostLat: profile.locationLat,
    hostLng: profile.locationLng,
  };
}

// --- Query Functions ---

export type PartnerRole = 'guide' | 'host' | 'vendor';

/**
 * Query Firestore /users collection for users with a specific role.
 * Excludes the current user from results.
 */
export async function loadPartnersByRole(
  firestore: Firestore,
  role: PartnerRole,
  currentUserId: string
): Promise<UserProfile[]> {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('roles', 'array-contains', role));
  const snapshot = await getDocs(q);

  const profiles: UserProfile[] = [];
  snapshot.docs.forEach(doc => {
    if (doc.id === currentUserId) return; // exclude self
    profiles.push({ uid: doc.id, ...doc.data() } as UserProfile);
  });

  return profiles;
}

/**
 * Load guides from Firestore, mapped to GuideCard interface.
 */
export async function loadGuides(firestore: Firestore, currentUserId: string): Promise<Guide[]> {
  const profiles = await loadPartnersByRole(firestore, 'guide', currentUserId);
  return profiles.map(userProfileToGuide);
}

/**
 * Load vendors from Firestore, mapped to VendorCard interface.
 */
export async function loadVendors(firestore: Firestore, currentUserId: string): Promise<Vendor[]> {
  const profiles = await loadPartnersByRole(firestore, 'vendor', currentUserId);
  return profiles.map(userProfileToVendor);
}

/**
 * Load hosts from Firestore, mapped to HostCard interface.
 */
export async function loadHosts(firestore: Firestore, currentUserId: string): Promise<Host[]> {
  const profiles = await loadPartnersByRole(firestore, 'host', currentUserId);
  return profiles.map(userProfileToHost);
}
