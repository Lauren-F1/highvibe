'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { generateItinerary, type GenerateItineraryInput } from '@/ai/flows/generate-itinerary-flow';

type FormData = {
  theme: string;
  destination: string;
  duration: string;
  keywords: string;
};

export default function ItineraryPlannerPage() {
  const { register, handleSubmit } = useForm<FormData>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState('');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setItinerary('');
    
    try {
        // This is where you would call the AI flow.
        // For now, we will simulate the experience as requested.
        // const result = await generateItinerary(data);
        // setItinerary(result.itinerary);
        
        // Placeholder simulation:
        setTimeout(() => {
            const placeholderResponse = `### Day 1: Arrival & Grounding in ${data.destination || 'Paradise'}
*   Afternoon: Guest arrivals, welcome drinks, and check-in.
*   5:00 PM: Opening Circle & Intention Setting Ceremony.
*   7:00 PM: Welcome Dinner featuring local, organic cuisine.

### Day 2: Deep Dive - ${data.keywords.split(',')[0] || 'Core Activity'}
*   8:00 AM: Morning Session (e.g., Yoga, Meditation).
*   10:00 AM: Workshop focusing on the retreat's theme.
*   1:00 PM: Nourishing Lunch.
*   Afternoon: Free time for reflection, journaling, or enjoying the space.
*   6:00 PM: Evening activity related to: ${data.keywords.split(',')[1] || 'Second Activity'}.

...and so on for ${data.duration || 'X'} days.

This is a placeholder response. Once the AI is fully enabled with your brand manifesto, this will be a complete, tailored itinerary.`;

            setItinerary(placeholderResponse);
            setIsLoading(false);
            toast({
                title: "Itinerary Draft Created!",
                description: "The AI has generated a starting point for your retreat.",
            });
        }, 2000);

    } catch (error) {
        console.error("Error generating itinerary:", error);
        toast({
            variant: "destructive",
            title: "AI Planner Error",
            description: "Could not generate an itinerary at this time.",
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-2">
                <Sparkles className="text-primary" />
                AI Itinerary Planner
              </CardTitle>
              <CardDescription>
                Describe your retreat's vision, and let our AI craft a starting point for your day-by-day schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Retreat Theme / Title</Label>
                <Input id="theme" placeholder="e.g., 'Andes Hiking & Leadership Summit'" {...register('theme', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="e.g., Cusco, Peru" {...register('destination', { required: true })} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="duration">Duration (in days)</Label>
                  <Input id="duration" type="number" placeholder="e.g., 7" {...register('duration', { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Key Activities & Keywords</Label>
                <Textarea id="keywords" placeholder="e.g., sunrise hike, daily meditation, team-building workshop, local cuisine, acclimatization day" {...register('keywords')} />
                <p className="text-xs text-muted-foreground">Separate ideas with commas.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoading ? 'Generating...' : 'Generate Itinerary'}
              </Button>
            </CardFooter>
          </Card>
        </form>
         <Card className="md:sticky md:top-24">
            <CardHeader>
              <CardTitle>Your Itinerary</CardTitle>
              <CardDescription>Review, edit, and use this as a foundation for your retreat listing.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] bg-secondary/50 rounded-md p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : itinerary ? (
                <Textarea className="h-full w-full bg-transparent border-0 font-mono text-sm" value={itinerary} onChange={(e) => setItinerary(e.target.value)} rows={15} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-center">Your generated itinerary will appear here.</p>
                </div>
              )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
