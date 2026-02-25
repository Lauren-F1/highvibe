
import type { Guide as GuideType } from '@/components/guide-card';
import { getPlaceholderById } from './placeholder-images';

export interface Host {
  id: string;
  name: string;
  location: string;
  capacity: number;
  eventCapacity?: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  propertyType: string;
  image?: string;
  luxApproved: boolean;
  premiumMembership?: boolean;
  roomStyleTags?: string[];
  retreatReady?: boolean;
  gatheringSpace?: boolean;
  quietSetting?: boolean;
  kitchenType?: ('full' | 'commercial')[];
  cateringAllowed?: boolean;
  privateChefAllowed?: boolean;
  policyTags?: string[];
  profileSlug?: string;
  hostLat?: number;
  hostLng?: number;
}

export type Guide = GuideType;

export const yourRetreats = [
  { id: '1', name: 'Sunrise Yoga in Bali', status: 'Published', bookings: 12, income: 4800, location: 'Bali, Indonesia', image: getPlaceholderById('yoga-beach'), datesSet: true, capacity: 15 },
  { id: '2', name: 'Silent Meditation in Kyoto', status: 'Draft', bookings: 0, income: 0, location: 'Kyoto, Japan', image: getPlaceholderById('host-kyoto-ryokan'), datesSet: false, capacity: 0 },
  { id: '3', name: 'Andes Hiking Adventure', status: 'Published', bookings: 8, income: 9600, location: 'Cusco, Peru', image: getPlaceholderById('mountain-hike'), datesSet: true, capacity: 20 },
];

export const allRetreats = [
  { id: '1', title: 'Serene Yoga Escape', description: 'A grounding escape designed for deep rest, clarity, and reconnection.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: getPlaceholderById('yoga-beach'), type: ['yoga-meditation'], duration: '6 days / 5 nights', included: 'Lodging, daily yoga' },
  { id: '2', title: 'Forest Bathing', description: 'Slow down and awaken your senses in the heart of nature.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: getPlaceholderById('meditation-forest'), type: ['nature-immersion'], duration: '4 days / 3 nights', included: 'Lodging & guided sessions' },
  { id: '3', title: 'Andean Peaks', description: 'For those who crave altitude and challenge.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: getPlaceholderById('mountain-hike'), type: ['adventure-aliveness'], duration: '8 days / 7 nights', included: 'All-inclusive' },
];

export const hosts: Host[] = [
    { id: 'h1', name: 'Ubud Jungle Haven', location: 'Bali, Indonesia', capacity: 20, bedrooms: 10, bathrooms: 10, pricePerNight: 1200, propertyType: 'Villa', image: getPlaceholderById('host-bali-villa'), luxApproved: true, premiumMembership: true, hostLat: -8.5, hostLng: 115.26, profileSlug: 'ubud-jungle-haven' },
    { id: 'h2', name: 'Kyoto Serenity', location: 'Kyoto, Japan', capacity: 15, bedrooms: 8, bathrooms: 8, pricePerNight: 950, propertyType: 'Retreat Center', image: getPlaceholderById('host-kyoto-ryokan'), luxApproved: false, premiumMembership: false, hostLat: 35.01, hostLng: 135.76, profileSlug: 'kyoto-serenity' },
];

export interface Vendor {
    id: string;
    uid: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    avatar?: string;
    luxApproved: boolean;
    premiumMembership?: boolean;
    location: string;
    vendorLat?: number;
    vendorLng?: number;
    startingPrice?: number;
    profileSlug?: string;
}

export const vendors: Vendor[] = [
  { id: 'v1', uid: 'v1', name: 'Elena Ray', category: 'Catering', rating: 4.9, reviewCount: 88, avatar: getPlaceholderById('vendor-chef-profile'), luxApproved: true, premiumMembership: true, location: 'Bali, Indonesia', vendorLat: -8.5, vendorLng: 115.26, startingPrice: 2000, profileSlug: 'elena-ray' },
  { id: 'v2', uid: 'v2', name: 'Sam Kolder', category: 'Photography', rating: 5.0, reviewCount: 120, avatar: getPlaceholderById('vendor-photographer'), luxApproved: true, premiumMembership: true, location: 'Global', startingPrice: 4500, profileSlug: 'sam-kolder' },
];

export const matchingGuidesForVendor: GuideType[] = [
  { id: 'g1', uid: 'g1', name: 'Asha Sharma', specialty: 'Yoga & Meditation', rating: 4.9, reviewCount: 45, upcomingRetreatsCount: 3, avatar: getPlaceholderById('vendor-yoga-teacher-profile'), premiumMembership: true, profileSlug: 'asha-sharma' },
];

export const yourServices = [
    { id: 's1', name: 'Holistic Catering', category: 'Catering', serviceArea: 'Bali, Indonesia', startingPrice: 1500, status: 'Active' },
];

export const hostSpaceTypes = ["Villa", "Retreat Center", "Boutique Hotel", "Eco-Lodge"];
export const popularAmenities = ["Private rooms", "Pool", "Yoga shala", "Chef's Kitchen"];
export const otherAmenities = ["Ocean access", "Mountain setting", "Sauna"];
export const hostAmenities = [...popularAmenities, ...otherAmenities];

export const hostVibes = [
    { name: "Quiet + Restorative", description: "Low-key, peaceful." },
    { name: "Luxury + Elevated", description: "High-end comfort." },
];

export const vendorCategories = [
    { name: "Yoga / Meditation" },
    { name: "Catering" },
    { name: "Photography" },
];

export const experienceTypes = [
  { value: 'all-experiences', label: 'All Experiences' },
  { value: 'rest-reset', label: 'Rest & Reset' },
  { value: 'yoga-meditation', label: 'Yoga & Meditation' },
];

export const investmentRanges = [
    { value: 'any', label: 'Any Range' },
    { value: 'under-500', label: 'Under $500' },
];

export const timingOptions = [
    { value: 'exploring', label: 'Just exploring' },
    { value: 'next-3-months', label: 'Next 3 months' },
];

export const manifestRetreatTypes = ['Yoga', 'Meditation', 'Wellness'];
export const manifestMustHaves = ['Yoga', 'High-end chef', 'Transport'];
export const manifestNiceToHaves = ['Spa', 'Ocean view'];
export const lodgingPreferences = ['Villa', 'Retreat Center'];
export const luxuryTiers = ['Essentials', 'Elevated', 'Luxury', 'Ultra-Luxury'];
export const dietaryPreferences = ['Vegetarian', 'Vegan', 'No preference'];
