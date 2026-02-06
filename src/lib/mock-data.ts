import { placeholderImages } from './placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';
import type { Host } from '@/components/host-card';
export type { Host } from '@/components/host-card';

export type UserSubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'trial';

export const yourRetreats = [
  { id: '1', name: 'Sunrise Yoga in Bali', status: 'Published', bookings: 12, income: 4800, location: 'Bali, Indonesia', image: placeholderImages.find(p => p.id === 'yoga-beach')! },
  { id: '2', name: 'Silent Meditation in Kyoto', status: 'Draft', bookings: 0, income: 0, location: 'Kyoto, Japan', image: placeholderImages.find(p => p.id === 'meditation-forest')! },
  { id: '3', name: 'Andes Hiking Adventure', status: 'Published', bookings: 8, income: 9600, location: 'Cusco, Peru', image: placeholderImages.find(p => p.id === 'mountain-hike')! },
  { id: '4', name: 'Tuscan Culinary Journey', status: 'Draft', bookings: 0, income: 0, location: 'Tuscany, Italy', image: placeholderImages.find(p => p.id === 'host-tuscany-farmhouse')!},
];

export const hosts: Host[] = [
    { id: 'h1', name: 'Ubud Jungle Haven', location: 'Bali, Indonesia', capacity: 20, bedrooms: 10, pricePerNight: 1200, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'host-bali-villa')!, luxApproved: true },
    { id: 'h2', name: 'Kyoto Serenity Center', location: 'Kyoto, Japan', capacity: 15, bedrooms: 8, pricePerNight: 950, propertyType: 'Retreat Center', image: placeholderImages.find(p => p.id === 'host-kyoto-ryokan')!, luxApproved: false },
    { id: 'h3', name: 'Sacred Valley Hacienda', location: 'Cusco, Peru', capacity: 25, bedrooms: 12, pricePerNight: 1500, propertyType: 'Hacienda', image: placeholderImages.find(p => p.id === 'host-peru-hacienda')!, luxApproved: true },
    { id: 'h4', name: 'Tuscan Farmhouse Estate', location: 'Tuscany, Italy', capacity: 18, bedrooms: 9, pricePerNight: 1100, propertyType: 'Farmhouse', image: placeholderImages.find(p => p.id === 'host-tuscany-farmhouse')!, luxApproved: false },
    { id: 'h5', name: 'Modern Bali Escape', location: 'Bali, Indonesia', capacity: 12, bedrooms: 6, pricePerNight: 800, propertyType: 'Villa', image: placeholderImages.find(p => p.id === 'space-owner-villa')!, luxApproved: false },
];

export interface Vendor {
    id: string;
    name: string;
    service: string;
    rating: number;
    reviewCount: number;
    avatar: ImagePlaceholder;
    luxApproved: boolean;
    location: string;
}

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Elena Ray', service: 'Catering & Nutrition', rating: 4.9, reviewCount: 88, avatar: placeholderImages.find(p => p.id === 'vendor-chef-profile')!, luxApproved: true, location: 'Bali, Indonesia' },
  { id: 'v2', name: 'Sam Kolder', service: 'Photography & Videography', rating: 5.0, reviewCount: 120, avatar: placeholderImages.find(p => p.id === 'vendor-photographer')!, luxApproved: true, location: 'Global' },
  { id: 'v3', name: 'Kyoto Wellness Collective', service: 'Yoga & Meditation', rating: 4.8, reviewCount: 75, avatar: placeholderImages.find(p => p.id === 'vendor-yoga-teacher-profile')!, luxApproved: false, location: 'Kyoto, Japan' },
  { id: 'v4', name: 'Andean Spirit Guides', service: 'Outdoor Adventure', rating: 4.9, reviewCount: 95, avatar: placeholderImages.find(p => p.id === 'friendly-host-portrait')!, luxApproved: false, location: 'Cusco, Peru' },
];
