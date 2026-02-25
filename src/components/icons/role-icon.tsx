
'use client';

import Image from 'next/image';

export const RoleIcon = ({ roleId }: { roleId: string }) => {
  const iconPaths: Record<string, string> = {
    seeker: '/seeker.svg',
    guide: '/guide.svg',
    vendor: '/vendor.svg',
    host: '/host.svg',
  };
  const iconSrc = iconPaths[roleId];

  if (!iconSrc) return null;

  return (
    <div className="relative h-24 w-24">
      <Image
        src={iconSrc}
        alt={`${roleId} icon`}
        fill
        className="object-contain"
      />
    </div>
  );
};
