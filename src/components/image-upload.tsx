'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { isFirebaseEnabled } from '@/firebase/config';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    storagePath: string; // e.g. 'retreats/[id]/gallery/'
    multiple?: boolean;
    maxFiles?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({
    value,
    onChange,
    storagePath,
    multiple = false,
    maxFiles = 6,
}: ImageUploadProps) {
    const { toast } = useToast();
    const storage = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const images = Array.isArray(value) ? value : (value ? [value] : []);

    const handleUploadClick = () => {
        if (!isFirebaseEnabled || !storage) {
            // Dev mode fallback: use placeholder images
            const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
            if (multiple) {
                const currentFiles = Array.isArray(value) ? value : [];
                if (currentFiles.length >= maxFiles) {
                    toast({ title: 'Maximum files reached', description: `You can only upload up to ${maxFiles} images.`, variant: 'destructive' });
                    return;
                }
                onChange([...currentFiles, randomImage.imageUrl]);
            } else {
                onChange(randomImage.imageUrl);
            }
            toast({ title: 'Image added', description: 'Placeholder image selected (dev mode).' });
            return;
        }

        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !storage) return;

        const currentFiles = Array.isArray(value) ? value : (value ? [value] : []);

        // Validate file count
        if (multiple && currentFiles.length + files.length > maxFiles) {
            toast({ title: 'Too many files', description: `You can only upload up to ${maxFiles} images total.`, variant: 'destructive' });
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate file type
                if (!ACCEPTED_TYPES.includes(file.type)) {
                    toast({ title: 'Invalid file type', description: `${file.name} is not a supported image format. Use JPG, PNG, or WebP.`, variant: 'destructive' });
                    continue;
                }

                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    toast({ title: 'File too large', description: `${file.name} exceeds the 5MB limit.`, variant: 'destructive' });
                    continue;
                }

                const fileExt = file.name.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const storageRef = ref(storage, `${storagePath}${fileName}`);

                const url = await new Promise<string>((resolve, reject) => {
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            const overallProgress = ((i + fileProgress / 100) / files.length) * 100;
                            setProgress(Math.round(overallProgress));
                        },
                        (error) => reject(error),
                        async () => {
                            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadUrl);
                        }
                    );
                });

                uploadedUrls.push(url);
            }

            if (uploadedUrls.length > 0) {
                if (multiple) {
                    onChange([...currentFiles, ...uploadedUrls]);
                } else {
                    onChange(uploadedUrls[0]);
                }
                toast({ title: 'Upload complete', description: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded.` });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
            setUploading(false);
            setProgress(0);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = (urlToRemove: string) => {
        if (multiple && Array.isArray(value)) {
            onChange(value.filter(url => url !== urlToRemove));
        } else {
            onChange('');
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
            />
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

                {((multiple && images.length < maxFiles) || (!multiple && images.length === 0)) && (
                    <div
                        onClick={uploading ? undefined : handleUploadClick}
                        className={`aspect-square rounded-md border border-input border-dashed flex flex-col items-center justify-center ${uploading ? 'opacity-50' : 'cursor-pointer hover:bg-accent'}`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground mt-2">Click to upload</p>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
