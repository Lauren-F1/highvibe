
import { placeholderImages } from './placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';
import type { Guide as GuideType } from '@/components/guide-card';

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
  image?: ImagePlaceholder;
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
  hostAddress?: string;
  hostCity?: string;
  hostStateRegion?: string;
}

export type Guide = GuideType;


export type UserSubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'trial';

const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

export const yourRetreats = [
  { id: '1', name: 'Sunrise Yoga in Bali', status: 'Published', bookings: 12, income: 4800, location: 'Bali, Indonesia', image: placeholderImages.find(p => p.id === 'yoga-beach')!, datesSet: true, capacity: 15 },
  { id: '2', name: 'Silent Meditation in Kyoto', status: 'Draft', bookings: 0, income: 0, location: 'Kyoto, Japan', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan') || genericImage, datesSet: false, capacity: 0 },
  { id: '3', name: 'Andes Hiking Adventure', status: 'Published', bookings: 8, income: 9600, location: 'Cusco, Peru', image: placeholderImages.find(p => p.id === 'mountain-hike')!, datesSet: true, capacity: 20 },
  { id: '4', name: 'Tuscan Culinary Journey', status: 'Draft', bookings: 0, income: 0, location: 'Tuscany, Italy', image: placeholderImages.find(p => p.id === 'host-tuscany-winery-sunset') || genericImage, datesSet: false, capacity: 0 },
];

export const allRetreats = [
  { id: '1', title: 'Serene Yoga Escape', description: 'A grounding escape designed for deep rest, clarity, and reconnection.', location: 'Bali, Indonesia', price: 400, rating: 4.8, image: placeholderImages.find(p => p.id === 'yoga-beach')!, type: ['yoga-meditation', 'rest-reset', 'wellness-healing'], duration: '6 days / 5 nights', included: 'Lodging, daily yoga, breakfast' },
  { id: '2', title: 'Forest Bathing & Mindfulness', description: 'An invitation to slow down, awaken your senses, and find presence in the heart of nature.', location: 'Kyoto, Japan', price: 550, rating: 4.9, image: placeholderImages.find(p => p.id === 'meditation-forest')!, type: ['nature-immersion', 'yoga-meditation', 'rest-reset'], duration: '4 days / 3 nights', included: 'Lodging & guided sessions' },
  { id: '3', title: 'Andean Peaks Adventure', description: 'For those who crave altitude and challenge, this is an ascent into unforgettable landscapes.', location: 'Cusco, Peru', price: 1200, rating: 5.0, image: placeholderImages.find(p => p.id === 'mountain-hike')!, type: ['adventure-aliveness', 'nature-immersion'], duration: '8 days / 7 nights', included: 'All-inclusive' },
  { id: '4', title: 'Cozy Writer\'s Retreat', description: 'A quiet sanctuary designed for the creative soul, where inspiration flows and your next story awaits.', location: 'Vermont, USA', price: 350, rating: 4.7, image: placeholderImages.find(p => p.id === 'cozy-cabin')!, type: ['creativity-expression', 'personal-growth-self-development'], duration: 'Weekend', included: 'Lodging & writing workshops' },
  { id: '5', title: 'Gourmet Wellness Journey', description: 'A culinary journey to nourish and delight, designed to celebrate vibrant, wholesome food and mindful eating.', location: 'Tuscany, Italy', price: 750, rating: 4.9, image: placeholderImages.find(p => p.id === 'healthy-food-chef')!, type: ['wellness-healing', 'creativity-expression'], duration: '5 days', included: 'Lodging, cooking classes, meals' },
  { id: '6', title: 'Ultimate Spa & Relaxation', description: 'Your permission to completely unwind. A week of pure indulgence and restorative care designed for total rejuvenation.', location: 'Phuket, Thailand', price: 600, rating: 4.8, image: placeholderImages.find(p => p.id === 'spa-massage')!, type: ['rest-reset', 'wellness-healing'], included: 'Lodging, all spa treatments' },
];


export const hosts: Host[] = [
    { id: 'h1', name: 'Ubud Jungle Haven', location: 'Bali, Indonesia', capacity: 20, eventCapacity: 30, bedrooms: 10, bathrooms: 10, pricePerNight: 1200, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'host-bali-villa')!, luxApproved: true, premiumMembership: true, roomStyleTags: ['Private rooms available', 'Mixed (private + shared)'], retreatReady: true, gatheringSpace: true, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Wellness activities allowed (yoga / sound / breathwork)'], hostLat: -8.5, hostLng: 115.26, profileSlug: 'ubud-jungle-haven' },
    { id: 'h2', name: 'Kyoto Serenity Center', location: 'Kyoto, Japan', capacity: 15, eventCapacity: 25, bedrooms: 8, bathrooms: 8, pricePerNight: 950, propertyType: 'Retreat Center', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan')!, luxApproved: false, premiumMembership: false, roomStyleTags: ['Private rooms available'], retreatReady: true, gatheringSpace: true, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: false, policyTags: ['Wellness activities allowed (yoga / sound / breathwork)'], hostLat: 35.01, hostLng: 135.76, profileSlug: 'kyoto-serenity-center' },
    { id: 'h3', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 25, eventCapacity: 40, bedrooms: 12, bathrooms: 12, pricePerNight: 1500, propertyType: 'Hacienda', image: placeholderImages.find(p => p.id === 'spanish-villa-sunset')!, luxApproved: true, premiumMembership: true, roomStyleTags: ['Private rooms available', 'Shared rooms available', 'Mixed (private + shared)'], retreatReady: true, gatheringSpace: true, quietSetting: false, kitchenType: ['full', 'commercial'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Alcohol allowed', 'Wellness activities allowed (yoga / sound / breathwork)', 'Outdoor fires allowed (if applicable)'], hostLat: -13.53, hostLng: -71.96, profileSlug: 'sacred-valley-hacienda' },
    { id: 'h4', name: 'Tuscan Farmhouse Estate', location: 'Tuscany, Italy', capacity: 18, eventCapacity: 25, bedrooms: 9, bathrooms: 9, pricePerNight: 1100, propertyType: 'Farmhouse', image: placeholderImages.find(p => p.id === 'host-tuscany-winery-sunset')!, luxApproved: false, premiumMembership: false, roomStyleTags: ['Private rooms available'], retreatReady: true, gatheringSpace: false, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Alcohol allowed', 'Outdoor fires allowed (if applicable)'], hostLat: 43.77, hostLng: 11.25, profileSlug: 'tuscan-farmhouse-estate' },
    { id: 'h5', name: 'Modern Bali Escape', location: 'Bali, Indonesia', capacity: 12, eventCapacity: 20, bedrooms: 6, bathrooms: 6, pricePerNight: 800, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'space-owner-villa')!, luxApproved: false, premiumMembership: false, roomStyleTags: ['Private rooms available', 'Shared rooms available'], retreatReady: false, gatheringSpace: true, quietSetting: false, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: false, policyTags: ['Alcohol allowed'], hostLat: -8.4, hostLng: 115.18, profileSlug: 'modern-bali-escape' },
];

export interface Vendor {
    id: string;
    uid: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    avatar?: ImagePlaceholder;
    luxApproved: boolean;
    premiumMembership?: boolean;
    location: string;
    vendorLat?: number;
    vendorLng?: number;
    vendorServiceRadiusMiles?: number;
    vendorBaseLocationLabel?: string;
    vendorVibeTags?: string[];
    startingPrice?: number;
    isSample?: boolean;
    profileSlug?: string;
    distance?: number;
}

export const vendors: Vendor[] = [
  { id: 'v1', uid: 'v1', name: 'Elena Ray', category: 'Catering & Nutrition', rating: 4.9, reviewCount: 88, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')!, luxApproved: true, premiumMembership: true, location: 'Bali, Indonesia', vendorLat: -8.5, vendorLng: 115.26, startingPrice: 2000, isSample: true, profileSlug: 'elena-ray' },
  { id: 'v2', uid: 'v2', name: 'Sam Kolder', category: 'Photography & Videography', rating: 5.0, reviewCount: 120, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')!, luxApproved: true, premiumMembership: true, location: 'Global', vendorServiceRadiusMiles: 10000, startingPrice: 4500, isSample: true, profileSlug: 'sam-kolder' },
  { id: 'v3', uid: 'v3', name: 'Kyoto Wellness Collective', category: 'Yoga & Meditation', rating: 4.8, reviewCount: 75, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')!, luxApproved: false, premiumMembership: false, location: 'Kyoto, Japan', vendorLat: 35.01, vendorLng: 135.76, startingPrice: 1000, isSample: true, profileSlug: 'kyoto-wellness-collective' },
  { id: 'v4', uid: 'v4', name: 'Andean Spirit Guides', category: 'Outdoor Adventure', rating: 4.9, reviewCount: 95, avatar: placeholderImages.find(p => p.id === 'friendly-host-portrait')!, luxApproved: false, premiumMembership: false, location: 'Cusco, Peru', vendorLat: -13.53, vendorLng: -71.96, startingPrice: 1500, isSample: true, profileSlug: 'andean-spirit-guides' },
  { id: 'v5', uid: 'v5', name: 'The Sound Sanctuary', category: 'Sound healing', rating: 4.9, reviewCount: 60, avatar: placeholderImages.find(p => p.id === 'generic-placeholder')!, luxApproved: true, premiumMembership: true, location: 'California, USA', vendorLat: 34.05, vendorLng: -118.24, vendorServiceRadiusMiles: 100, startingPrice: 800, isSample: true, profileSlug: 'the-sound-sanctuary' },
  { id: 'v6', uid: 'v6', name: 'Breathwork Journeys', category: 'Breathwork', rating: 4.7, reviewCount: 40, avatar: placeholderImages.find(p => p.id === 'profile-avatar-placeholder')!, luxApproved: false, premiumMembership: false, location: 'Remote', startingPrice: 500, isSample: true, profileSlug: 'breathwork-journeys' },
  { id: 'v7', uid: 'v7', name: 'Tuscan Tastings', category: 'Private chef / Catering', rating: 5.0, reviewCount: 72, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')!, luxApproved: true, premiumMembership: false, location: 'Tuscany, Italy', vendorLat: 43.77, vendorLng: 11.25, vendorServiceRadiusMiles: 50, startingPrice: 3000, isSample: true, profileSlug: 'tuscan-tastings' },
  { id: 'v8', uid: 'v8', name: 'Bali Bodywork', category: 'Massage / Spa', rating: 4.8, reviewCount: 110, avatar: placeholderImages.find(p => p.id === 'spa-massage')!, luxApproved: false, premiumMembership: false, location: 'Bali, Indonesia', vendorLat: -8.65, vendorLng: 115.21, startingPrice: 400, isSample: true, profileSlug: 'bali-bodywork' }
];

export const yourServices = [
    { id: 's1', name: 'Holistic Catering', category: 'Catering & Nutrition', serviceArea: 'Bali, Indonesia', startingPrice: 1500, status: 'Active' },
    { id: 's2', name: 'Adventure Photo & Film', category: 'Photography & Videography', serviceArea: 'Global', startingPrice: 4000, status: 'Active' },
    { id: 's3', name: 'Mindfulness Workshops', category: 'Yoga & Meditation', serviceArea: 'Kyoto, Japan', startingPrice: 800, status: 'Paused' },
];

export const matchingGuidesForVendor: Guide[] = [
  { id: 'g1', uid: 'g1', name: 'Asha Sharma', specialty: 'Yoga & Meditation', rating: 4.9, reviewCount: 45, upcomingRetreatsCount: 3, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')!, premiumMembership: true, isSample: true, retreatTypes: ['Yoga & Meditation', 'Wellness & Healing'], vibeTags: ['Quiet + Restorative'], profileSlug: 'asha-sharma' },
  { id: 'g2', uid: 'g2', name: 'Marcus Green', specialty: 'Adventure & Leadership', rating: 5.0, reviewCount: 32, upcomingRetreatsCount: 2, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')!, premiumMembership: false, isSample: true, retreatTypes: ['Adventure & Aliveness', 'Leadership & Professional Growth'], vibeTags: ['Adventure-friendly'], profileSlug: 'marcus-green' },
  { id: 'g3', uid: 'g3', name: 'Isabella Rossi', specialty: 'Culinary & Wellness', rating: 4.8, reviewCount: 60, upcomingRetreatsCount: 4, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')!, premiumMembership: true, isSample: true, retreatTypes: ['Wellness & Healing', 'Creativity & Expression'], vibeTags: ['Luxury + Elevated'], profileSlug: 'isabella-rossi' },
  { id: 'g4', uid: 'g4', name: 'Liam Johnson', specialty: 'Nature Immersion', rating: 4.7, reviewCount: 28, upcomingRetreatsCount: 1, avatar: placeholderImages.find(p => p.id === 'profile-avatar-placeholder')!, premiumMembership: false, isSample: true, retreatTypes: ['Nature Immersion'], vibeTags: ['Nature + Immersive'], profileSlug: 'liam-johnson' },
  { id: 'g5', uid: 'g5', name: 'Sophia Chen', specialty: 'Creative Expression', rating: 4.9, reviewCount: 55, upcomingRetreatsCount: 2, avatar: placeholderImages.find(p => p.id === 'friendly-host-portrait')!, premiumMembership: true, isSample: true, retreatTypes: ['Creativity & Expression'], vibeTags: ['Social + Communal'], profileSlug: 'sophia-chen' },
  { id: 'g6', uid: 'g6', name: 'David Lee', specialty: 'Spiritual Exploration', rating: 4.6, reviewCount: 38, upcomingRetreatsCount: 3, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')!, premiumMembership: false, isSample: true, retreatTypes: ['Spiritual Exploration', 'Personal Growth'], vibeTags: ['Quiet + Restorative'], profileSlug: 'david-lee' },
];

export const matchingHostsForVendor: Host[] = hosts.slice(0, 4);

export const connectionRequests = [
    { id: 'cr1', partnerId: 'h2', name: 'Kyoto Serenity Center', role: 'Host', forRetreat: 'Silent Meditation in Kyoto', status: 'Invite Sent' },
    { id: 'cr2', partnerId: 'v3', name: 'Kyoto Wellness Collective', role: 'Vendor', forRetreat: 'Silent Meditation in Kyoto', status: 'Invite Sent' },
    { id: 'cr3', partnerId: 'h1', name: 'Ubud Jungle Haven', role: 'Host', forRetreat: 'Sunrise Yoga in Bali', status: 'Conversation Started' },
    { id: 'cr4', partnerId: 'v1', name: 'Elena Ray', role: 'Vendor', forRetreat: 'Sunrise Yoga in Bali', status: 'Confirmed' },
    { id: 'cr5', partnerId: 'v8', name: 'Bali Bodywork', role: 'Vendor', forRetreat: 'Sunrise Yoga in Bali', status: 'Declined' },
];

export const confirmedBookings = [
  { id: 'cb1', partnerId: 'h3', partnerName: 'Sacred Valley Hacienda', role: 'Host', forRetreat: 'Andes Hiking Adventure', dates: 'Oct 15-22, 2024' },
  { id: 'cb2', partnerId: 'v4', partnerName: 'Andean Spirit Guides', role: 'Vendor', forRetreat: 'Andes Hiking Adventure', dates: 'Oct 15-22, 2024' },
];

// Data for filters
export const continents = [
    { value: 'anywhere', label: 'Anywhere' },
    { value: 'africa', label: 'Africa' },
    { value: 'asia', label: 'Asia' },
    { value: 'europe', label: 'Europe' },
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'oceania', label: 'Oceania' },
    { value: 'middle-east', label: 'Middle East' },
];

export const destinations: Record<string, string[]> = {
  africa: ['Morocco', 'South Africa', 'Kenya', 'Tanzania', 'Egypt', 'Namibia', 'Rwanda', 'Seychelles'],
  asia: ['Bali, Indonesia', 'Thailand', 'Japan', 'India', 'Nepal', 'Sri Lanka', 'Vietnam', 'Cambodia', 'Philippines', 'Bhutan', 'Phuket, Thailand', 'Kyoto, Japan'],
  europe: ['Italy', 'France', 'Portugal', 'Spain', 'Greece', 'Switzerland', 'Austria', 'Iceland', 'Croatia', 'United Kingdom', 'Tuscany, Italy'],
  'north-america': ['California, USA', 'Utah, USA', 'Arizona, USA', 'Colorado, USA', 'Vermont, USA', 'British Columbia, Canada', 'Baja California, Mexico', 'Costa Rica'],
  'south-america': ['Peru', 'Colombia', 'Brazil', 'Argentina', 'Chile', 'Ecuador', 'Patagonia (Region)', 'Cusco, Peru'],
  oceania: ['New Zealand', 'Australia', 'Fiji', 'Tahiti (French Polynesia)', 'Hawaii, USA'],
  'middle-east': ['Jordan', 'Oman', 'United Arab Emirates', 'Turkey', 'Israel', 'Lebanon'],
};

export const hostSpaceTypes = ["Villa", "Retreat Center", "Boutique Hotel", "Farmhouse/Estate", "Eco-Lodge", "Private Compound", "Other"];

export const popularAmenities = ["Private rooms", "Pool", "Yoga shala / studio", "Wi-Fi", "A/C", "Chef's Kitchen"];
export const otherAmenities = ["Ocean / lake access", "Mountain / jungle setting", "Ceremony / event space", "Sauna / cold plunge", "On-site staff"];
export const hostAmenities = [...popularAmenities, ...otherAmenities];

export const hostVibes = [
    { name: "Quiet + Restorative", description: "Low-key, peaceful, and ideal for deep rest." },
    { name: "Social + Communal", description: "Vibrant, connective, and great for group bonding." },
    { name: "Luxury + Elevated", description: "High-end, polished, and offering premium comfort." },
    { name: "Nature + Immersive", description: "Surrounded by nature, grounding, and unplugged." },
    { name: "Adventure-friendly", description: "A great home base for outdoor activities." },
];

export const vendorCategories: { name: string; description?: string }[] = [
    { name: "Yoga / Meditation" },
    { name: "Breathwork" },
    { name: "Somatics / Bodywork" },
    { name: "Massage / Spa" },
    { name: "Sound healing" },
    { name: "Plant medicine facilitator (where legal)" },
    { name: "Integration coach" },
    { name: "Private chef / Catering" },
    { name: "Catering & Nutrition" },
    { name: "Photography / Videography" },
    { name: "Transportation" },
    { name: "Outdoor Adventure" },
    { name: "Musician / DJ" },
    { name: "Art / Creative facilitation" },
    { name: "Decor / Styling / Rentals" },
    { name: "Security (for high-end)" },
    { name: "Other", description: "I offer something out of the box that I think would be your vibe." },
];
export const vendorPricingTiers = ["Budget", "Mid-range", "Premium", "Luxury"];

export const experienceTypes = [
  { value: 'all-experiences', label: 'All Experiences' },
  { value: 'rest-reset', label: 'Rest & Reset' },
  { value: 'wellness-healing', label: 'Wellness & Healing' },
  { value: 'yoga-meditation', label: 'Yoga & Meditation' },
  { value: 'personal-growth-self-development', label: 'Personal Growth & Self-Development' },
  { value: 'adventure-aliveness', label: 'Adventure & Aliveness' },
  { value: 'creativity-expression', label: 'Creativity & Expression' },
  { value: 'nature-immersion', label: 'Nature Immersion' },
  { value: 'leadership-professional-growth', label: 'Leadership & Professional Growth' },
];

export const investmentRanges = [
    { value: 'any', label: 'Any Range' },
    { value: 'under-500', label: 'Under $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-2000', label: '$1,000 - $2,000' },
    { value: 'over-2000', label: 'Over $2,000' },
];

export const timingOptions = [
    { value: 'exploring', label: 'Just exploring' },
    { value: 'next-3-months', label: 'Next 3 months' },
    { value: 'next-6-months', label: 'Next 6 months' },
    { value: 'next-year', label: 'Next year' },
];

// --- Manifest Feature Data ---
export const manifestRetreatTypes = ['Tantra', 'Yoga', 'Meditation', 'Breathwork', 'Somatics', 'Wellness', 'Adventure', 'Leadership', 'Other'];
export const manifestMustHaves = ['Yoga', 'Tantra facilitator/guide', 'High-end vegetarian chef', 'Transportation', 'Massage/bodywork', 'Sound bath', 'Photographer', 'Other'];
export const manifestNiceToHaves = ['Spa access', 'Private villa', 'Ocean view', 'Hikes', 'Winery'];
export const lodgingPreferences = ['Villa', 'Boutique Hotel', 'Retreat Center', 'Flexible'];
export const luxuryTiers = ['Essentials', 'Elevated', 'Luxury', 'Ultra-Luxury'];
export const dietaryPreferences = ['Vegetarian', 'Vegan', 'Gluten-free friendly', 'No preference'];
