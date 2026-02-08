import { ReactNode } from 'react';

export default function VendorLayout({ children }: { children: ReactNode }) {
  // This layout is now a simple passthrough to allow public access to the page.
  // Auth gating can be re-introduced for specific actions within the page itself.
  return <>{children}</>;
}
