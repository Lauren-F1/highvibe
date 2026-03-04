'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue in Next.js/webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapRetreat {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
}

interface RetreatMapProps {
  retreats: MapRetreat[];
}

function FitBounds({ retreats }: { retreats: MapRetreat[] }) {
  const map = useMap();

  useEffect(() => {
    if (retreats.length === 0) return;
    const bounds = L.latLngBounds(retreats.map(r => [r.lat, r.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [retreats, map]);

  return null;
}

export default function RetreatMap({ retreats }: RetreatMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={true}
      className="h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds retreats={retreats} />
      {retreats.map((retreat) => (
        <Marker key={retreat.id} position={[retreat.lat, retreat.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{retreat.title}</p>
              <p className="text-muted-foreground">From ${retreat.price} / night</p>
              <Link href={`/retreats/${retreat.id}`} className="text-primary underline text-xs">
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
