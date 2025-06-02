import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

export default function Map({ center, onLocationSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: center.lat === 0 ? { lat: 36.7538, lng: 3.0588 } : center,
          zoom: 8,
        });

        markerRef.current = new google.maps.Marker({
          map,
          draggable: true,
          position: center.lat === 0 ? { lat: 36.7538, lng: 3.0588 } : center,
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng!;
          markerRef.current?.setPosition(latLng);
          onLocationSelect({ lat: latLng.lat(), lng: latLng.lng() });
        });
      }
    });
  }, [center, onLocationSelect]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
} 