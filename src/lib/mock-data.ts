
import type { Guide as GuideType } from '@/components/guide-card';
import { getPlaceholderById } from './placeholder-images';

export type UserSubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'trial';

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
  { id: '1', title: 'Serene Yoga Escape', description: 'A grounding escape designed for deep rest, clarity, and reconnection.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: getPlaceholderById('yoga-beach'), type: ['yoga', 'meditation'], duration: '6 days / 5 nights', included: 'Lodging, daily yoga', lat: -8.5069, lng: 115.2624 },
  { id: '2', title: 'Forest Bathing', description: 'Slow down and awaken your senses in the heart of nature.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: getPlaceholderById('meditation-forest'), type: ['nature-immersion', 'mindfulness'], duration: '4 days / 3 nights', included: 'Lodging & guided sessions', lat: 35.0116, lng: 135.7681 },
  { id: '3', title: 'Andean Peaks', description: 'For those who crave altitude and challenge.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: getPlaceholderById('mountain-hike'), type: ['adventure', 'fitness'], duration: '8 days / 7 nights', included: 'All-inclusive', lat: -13.5320, lng: -71.9675 },
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
export const popularAmenities = [
    "Private rooms",
    "Shared rooms",
    "Dormitory / Hostel",
    "Pool",
    "Hot tub / Jacuzzi",
    "Yoga shala / studio",
    "Meditation room / space",
    "Chef's kitchen",
    "Communal kitchen",
    "Ocean / beach access",
    "Mountain views",
    "Garden / grounds",
    "Sauna",
    "Steam room",
    "Cold plunge",
];
export const otherAmenities = [
    "Gym / fitness area",
    "Outdoor ceremony space",
    "Fire pit",
    "BBQ / outdoor grill",
    "Rooftop terrace",
    "Library / reading room",
    "Wi-Fi",
    "A/C",
    "Parking",
    "Laundry",
    "EV charging",
    "Wheelchair accessible",
    "Pet friendly",
    "On-site spa",
    "Outdoor shower",
    "Hiking trails on property",
    "Farm / permaculture garden",
];
export const hostAmenities = [...popularAmenities, ...otherAmenities];

export const hostVibes = [
    { name: "Quiet + Restorative", description: "Low-key, peaceful." },
    { name: "Luxury + Elevated", description: "High-end comfort." },
    { name: "Adventure + Outdoors", description: "Active, nature-forward." },
    { name: "Community + Social", description: "Group-oriented, connective." },
    { name: "Spiritual + Sacred", description: "Ceremony, ritual, intention." },
    { name: "Rustic + Off-Grid", description: "Simple, unplugged, earthy." },
    { name: "Beachfront + Coastal", description: "Ocean vibes, salt air." },
    { name: "Jungle + Tropical", description: "Lush, warm, immersive." },
    { name: "Modern + Minimalist", description: "Clean lines, curated calm." },
    { name: "Cultural + Immersive", description: "Local traditions, authentic." },
];

export const vendorCategories = [
    { name: "Yoga / Meditation Instruction" },
    { name: "Breathwork / Pranayama" },
    { name: "Sound Healing / Sound Baths" },
    { name: "Reiki / Energy Work" },
    { name: "Massage / Bodywork" },
    { name: "Catering / Private Chef" },
    { name: "Nutrition / Meal Planning" },
    { name: "Photography" },
    { name: "Videography" },
    { name: "Florist / Event Design" },
    { name: "Transportation / Shuttle" },
    { name: "Adventure / Outdoor Guides" },
    { name: "Surf / Water Sports Instruction" },
    { name: "Horseback Riding / Equine Therapy" },
    { name: "Art / Creative Workshop Facilitation" },
    { name: "Music / DJ / Live Performance" },
    { name: "Ceremony / Ritual Facilitation" },
    { name: "Astrology / Tarot / Intuitive Readings" },
    { name: "Life Coaching / Transformational Coaching" },
    { name: "Acupuncture / TCM" },
    { name: "Ayurveda" },
    { name: "Fitness / Personal Training" },
    { name: "Dance / Movement Instruction" },
    { name: "Spa / Esthetician Services" },
    { name: "Event Planning / Retreat Coordination" },
    { name: "Other" },
];

export const experienceTypes = [
  { value: 'all-experiences', label: 'All Experiences' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'creative-arts', label: 'Creative Arts' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'nature-immersion', label: 'Nature Immersion' },
  { value: 'culinary', label: 'Culinary' },
  { value: 'mindfulness', label: 'Mindfulness' },
];

export const investmentRanges = [
  { value: 'any', label: 'Any Range' },
  { value: 'under-200', label: 'Under $200' },
  { value: '200-500', label: '$200 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2000', label: '$1,000 - $2,000' },
  { value: 'over-2000', label: '$2,000+' },
];

export const timingOptions = [
  { value: 'exploring', label: 'Just exploring' },
  { value: 'next-month', label: 'Within 1 month' },
  { value: 'next-3-months', label: 'Within 3 months' },
  { value: 'next-6-months', label: 'Within 6 months' },
  { value: 'next-year', label: 'Within a year' },
];

export const manifestRetreatTypes = ['Yoga', 'Meditation', 'Wellness'];
export const manifestMustHaves = ['Yoga', 'High-end chef', 'Transport'];
export const manifestNiceToHaves = ['Spa', 'Ocean view'];
export const lodgingPreferences = ['Villa', 'Retreat Center'];
export const luxuryTiers = ['Essentials', 'Elevated', 'Luxury', 'Ultra-Luxury'];
export const dietaryPreferences = ['Vegetarian', 'Vegan', 'No preference'];

/**
 * Back-compat exports used by various pages/components.
 * Keep these in sync with the mock datasets above.
 */
export const destinations: Record<string, string[]> = {
  'asia': ['Bali, Indonesia', 'Kyoto, Japan', 'Chiang Mai, Thailand', 'Goa, India', 'Ubud, Indonesia', 'Sri Lanka'],
  'europe': ['Tuscany, Italy', 'Ibiza, Spain', 'Algarve, Portugal', 'Santorini, Greece', 'Swiss Alps, Switzerland'],
  'north-america': ['Sedona, Arizona', 'Big Sur, California', 'Tulum, Mexico', 'Costa Rica', 'Hawaii, USA'],
  'south-america': ['Cusco, Peru', 'Sacred Valley, Peru', 'Medellin, Colombia', 'Florianopolis, Brazil'],
  'africa': ['Marrakech, Morocco', 'Cape Town, South Africa', 'Zanzibar, Tanzania'],
  'oceania': ['Byron Bay, Australia', 'Queenstown, New Zealand', 'Fiji'],
};
export const continents = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' },
];

export const matchingHostsForVendor = hosts;

// These are lightweight placeholders so imports resolve.
// Replace with real data models when you wire up Firestore.
export const connectionRequests: any[] = [];
export const confirmedBookings: any[] = [];
