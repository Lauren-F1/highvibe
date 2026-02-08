'use client';

export function DevModeBanner() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 text-center p-2 text-sm">
      Dev Mode: Auth disabled (Firebase not configured).
    </div>
  );
}
