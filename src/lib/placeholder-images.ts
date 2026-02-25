
import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderById(id: string): string {
  return placeholderImages.find(img => img.id === id)?.imageUrl || placeholderImages[0].imageUrl;
}
