'use client';

import dynamic from 'next/dynamic';

const RetreatMap = dynamic(() => import('./retreat-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg bg-secondary flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export { RetreatMap };
