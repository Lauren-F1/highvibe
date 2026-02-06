
import { placeholderImages } from './placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';
import type { Host } from '@/components/host-card';
import type { Guide } from '@/components/guide-card';

export type { Host } from '@/components/host-card';
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
    { id: 'h1', name: 'Ubud Jungle Haven', location: 'Bali, Indonesia', capacity: 20, bedrooms: 10, pricePerNight: 1200, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'host-bali-villa')!, luxApproved: true },
    { id: 'h2', name: 'Kyoto Serenity Center', location: 'Kyoto, Japan', capacity: 15, bedrooms: 8, pricePerNight: 950, propertyType: 'Retreat Center', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan')!, luxApproved: false },
    { id: 'h3', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 25, bedrooms: 12, pricePerNight: 1500, propertyType: 'Hacienda', image: placeholderImages.find(p => p.id === 'hacienda-leather-interior')!, luxApproved: true },
    { id: 'h4', name: 'Tuscan Farmhouse Estate', location: 'Tuscany, Italy', capacity: 18, bedrooms: 9, pricePerNight: 1100, propertyType: 'Farmhouse', image: placeholderImages.find(p => p.id === 'host-tuscany-winery-sunset')!, luxApproved: false },
    { id: 'h5', name: 'Modern Bali Escape', location: 'Bali, Indonesia', capacity: 12, bedrooms: 6, pricePerNight: 800, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'space-owner-villa')!, luxApproved: false },
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
export const hostSpaceTypes = ["Villa", "Retreat Center", "Boutique Hotel", "Farmhouse/Estate", "Eco-Lodge", "Private Compound", "Other"];
export const hostAmenities = ["Private rooms", "Pool", "Ocean / lake access", "Mountain / jungle setting", "Yoga shala / studio", "Ceremony / event space", "Sauna / cold plunge", "On-site staff"];
export const hostVibes = ["Quiet + Restorative", "Social + Communal", "Luxury + Elevated", "Nature + Immersive", "Adventure-friendly"];

export const vendorCategories = [
    "Yoga / Meditation", "Breathwork", "Somatics / Bodywork", "Massage / Spa", "Sound healing", 
    "Plant medicine facilitator (where legal)", "Integration coach", "Private chef / Catering", 
    "Nutrition", "Photography / Videography", "Transportation", "Adventure guide", "Musician / DJ",
    "Art / Creative facilitation", "Decor / Styling / Rentals", "Security (for high-end)"
];
export const vendorPricingTiers = ["Budget", "Mid-range", "Premium", "Luxury"];
