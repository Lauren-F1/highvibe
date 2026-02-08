'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { X, UploadCloud } from 'lucide-react';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    storagePath: string; // e.g. 'users/[uid]/avatar.jpg' or 'retreats/[id]/gallery/'
    multiple?: boolean;
    maxFiles?: number;
}

// THIS IS A PLACEHOLDER COMPONENT.
// In a real application, you would use Firebase Storage to upload files.
// This component simulates the upload process by selecting random placeholder images.

export function ImageUpload({
    value,
    onChange,
    multiple = false,
    maxFiles = 6,
}: ImageUploadProps) {
    const { toast } = useToast();

    const handleUploadClick = () => {
        // Simulate file upload by selecting a random image
        const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

        if (multiple) {
            const currentFiles = Array.isArray(value) ? value : [];
            if (currentFiles.length >= maxFiles) {
                toast({
                    title: 'Maximum files reached',
                    description: `You can only upload up to ${maxFiles} images.`,
                    variant: 'destructive',
                });
                return;
            }
            onChange([...currentFiles, randomImage.imageUrl]);
        } else {
            onChange(randomImage.imageUrl);
        }

        toast({
            title: 'Image "Uploaded"',
            description: 'Placeholder image has been selected.',
        });
    };
    
    const handleRemove = (urlToRemove: string) => {
        if (multiple && Array.isArray(value)) {
            onChange(value.filter(url => url !== urlToRemove));
        } else {
            onChange('');
        }
    }
    
    const images = Array.isArray(value) ? value : (value ? [value] : []);

    return (
        <div>
            <div className="mb-4 grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                        <Image src={url} alt={`Uploaded image ${index + 1}`} fill className="object-cover" />
                        <div className="absolute top-1 right-1">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(url)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                
                 { (multiple && images.length < maxFiles) || (!multiple && images.length === 0) ? (
                    <div
                        onClick={handleUploadClick}
                        className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-accent"
                    >
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">Click to upload</p>
                    </div>
                 ) : null}
            </div>
        </div>
    );
}
