
import { placeholderImages } from './placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';
import type { Guide } from '@/components/guide-card';

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
  roomStyleTags?: string[];
  retreatReady?: boolean;
  gatheringSpace?: boolean;
  quietSetting?: boolean;
  kitchenType?: ('full' | 'commercial')[];
  cateringAllowed?: boolean;
  privateChefAllowed?: boolean;
  policyTags?: string[];
}

export type { Guide } from '@/components/guide-card';


export type UserSubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'trial';

const genericImage = placeholderImages.find(p => p.id === 'generic-placeholder')!;

export const yourRetreats = [
  { id: '1', name: 'Sunrise Yoga in Bali', status: 'Published', bookings: 12, income: 4800, location: 'Bali, Indonesia', image: placeholderImages.find(p => p.id === 'yoga-beach')! },
  { id: '2', name: 'Silent Meditation in Kyoto', status: 'Draft', bookings: 0, income: 0, location: 'Kyoto, Japan', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan') || genericImage },
  { id: '3', name: 'Andes Hiking Adventure', status: 'Published', bookings: 8, income: 9600, location: 'Cusco, Peru', image: placeholderImages.find(p => p.id === 'mountain-hike')! },
  { id: '4', name: 'Tuscan Culinary Journey', status: 'Draft', bookings: 0, income: 0, location: 'Tuscany, Italy', image: placeholderImages.find(p => p.id === 'host-tuscany-winery-sunset') || genericImage },
];

export const hosts: Host[] = [
    { id: 'h1', name: 'Ubud Jungle Haven', location: 'Bali, Indonesia', capacity: 20, eventCapacity: 30, bedrooms: 10, bathrooms: 10, pricePerNight: 1200, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'host-bali-villa')!, luxApproved: true, roomStyleTags: ['Private rooms available', 'Mixed (private + shared)'], retreatReady: true, gatheringSpace: true, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Wellness activities allowed (yoga / sound / breathwork)'] },
    { id: 'h2', name: 'Kyoto Serenity Center', location: 'Kyoto, Japan', capacity: 15, eventCapacity: 25, bedrooms: 8, bathrooms: 8, pricePerNight: 950, propertyType: 'Retreat Center', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan')!, luxApproved: false, roomStyleTags: ['Private rooms available'], retreatReady: true, gatheringSpace: true, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: false, policyTags: ['Wellness activities allowed (yoga / sound / breathwork)'] },
    { id: 'h3', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 25, eventCapacity: 40, bedrooms: 12, bathrooms: 12, pricePerNight: 1500, propertyType: 'Hacienda', image: placeholderImages.find(p => p.id === 'hacienda-leather-interior')!, luxApproved: true, roomStyleTags: ['Private rooms available', 'Shared rooms available', 'Mixed (private + shared)'], retreatReady: true, gatheringSpace: true, quietSetting: false, kitchenType: ['full', 'commercial'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Alcohol allowed', 'Wellness activities allowed (yoga / sound / breathwork)', 'Outdoor fires allowed (if applicable)'] },
    { id: 'h4', name: 'Tuscan Farmhouse Estate', location: 'Tuscany, Italy', capacity: 18, eventCapacity: 25, bedrooms: 9, bathrooms: 9, pricePerNight: 1100, propertyType: 'Farmhouse', image: placeholderImages.find(p => p.id === 'host-tuscany-winery-sunset')!, luxApproved: false, roomStyleTags: ['Private rooms available'], retreatReady: true, gatheringSpace: false, quietSetting: true, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: true, policyTags: ['Alcohol allowed', 'Outdoor fires allowed (if applicable)'] },
    { id: 'h5', name: 'Modern Bali Escape', location: 'Bali, Indonesia', capacity: 12, eventCapacity: 20, bedrooms: 6, bathrooms: 6, pricePerNight: 800, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'space-owner-villa')!, luxApproved: false, roomStyleTags: ['Private rooms available', 'Shared rooms available'], retreatReady: false, gatheringSpace: true, quietSetting: false, kitchenType: ['full'], cateringAllowed: true, privateChefAllowed: false, policyTags: ['Alcohol allowed'] },
];

export interface Vendor {
    id: string;
    name: string;
    service: string;
    rating: number;
    reviewCount: number;
    avatar?: ImagePlaceholder;
    luxApproved: boolean;
    location: string;
}

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Elena Ray', service: 'Catering & Nutrition', rating: 4.9, reviewCount: 88, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')!, luxApproved: true, location: 'Bali, Indonesia' },
  { id: 'v2', name: 'Sam Kolder', service: 'Photography & Videography', rating: 5.0, reviewCount: 120, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')!, luxApproved: true, location: 'Global' },
  { id: 'v3', name: 'Kyoto Wellness Collective', service: 'Yoga & Meditation', rating: 4.8, reviewCount: 75, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')!, luxApproved: false, location: 'Kyoto, Japan' },
  { id: 'v4', name: 'Andean Spirit Guides', service: 'Outdoor Adventure', rating: 4.9, reviewCount: 95, avatar: placeholderImages.find(p => p.id === 'friendly-host-portrait')!, luxApproved: false, location: 'Cusco, Peru' },
];

export const yourServices = [
    { id: 's1', name: 'Holistic Catering', category: 'Catering & Nutrition', serviceArea: 'Bali, Indonesia', startingPrice: 1500, status: 'Active' },
    { id: 's2', name: 'Adventure Photo & Film', category: 'Photography & Videography', serviceArea: 'Global', startingPrice: 4000, status: 'Active' },
    { id: 's3', name: 'Mindfulness Workshops', category: 'Yoga & Meditation', serviceArea: 'Kyoto, Japan', startingPrice: 800, status: 'Paused' },
];

export const matchingGuidesForVendor: Guide[] = [
  { id: 'g1', name: 'Asha Sharma', specialty: 'Yoga & Meditation', rating: 4.9, reviewCount: 45, upcomingRetreatsCount: 3, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')! },
  { id: 'g2', name: 'Marcus Green', specialty: 'Adventure & Leadership', rating: 5.0, reviewCount: 32, upcomingRetreatsCount: 2, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')! },
  { id: 'g3', name: 'Isabella Rossi', specialty: 'Culinary & Wellness', rating: 4.8, reviewCount: 60, upcomingRetreatsCount: 4, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')! },
];

export const matchingHostsForVendor: Host[] = hosts.slice(0, 4);


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

export const vendorCategories = [
    "Yoga / Meditation", "Breathwork", "Somatics / Bodywork", "Massage / Spa", "Sound healing", 
    "Plant medicine facilitator (where legal)", "Integration coach", "Private chef / Catering", 
    "Nutrition", "Photography / Videography", "Transportation", "Adventure guide", "Musician / DJ",
    "Art / Creative facilitation", "Decor / Styling / Rentals", "Security (for high-end)"
];
export const vendorPricingTiers = ["Budget", "Mid-range", "Premium", "Luxury"];
