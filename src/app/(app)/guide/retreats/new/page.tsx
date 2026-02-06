'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  destination: string;
  description: string;
};

export default function NewRetreatPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert('Retreat created! (Check console for data). You will now be redirected to the guide dashboard.');
    router.push('/guide');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Create a New Retreat</CardTitle>
              <CardDescription>
                Fill in the details below to get started. This will allow you to start matching with hosts and vendors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Retreat Name</Label>
                <Input id="name" placeholder="e.g., Sunrise Yoga in Bali" {...register('name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="e.g., Bali, Indonesia" {...register('destination', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Brief Description</Label>
                <Textarea id="description" placeholder="A short summary of your retreat's vision..." {...register('description')} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg">Create Retreat</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
