import { useEffect, useRef } from "react";
import { Theater } from "@shared/schema";

interface MapComponentProps {
  theaters: Theater[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export function MapComponent({ 
  theaters, 
  center = [10.8505, 76.2711], 
  zoom = 8,
  height = "h-96"
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map
    mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Add markers for theaters
    theaters.forEach(theater => {
      const marker = window.L.marker([theater.latitude, theater.longitude])
        .addTo(mapInstanceRef.current);
      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-medium">${theater.name}</h3>
          <p class="text-sm text-gray-600">${theater.address}</p>
          <p class="text-sm">${theater.screens} screens</p>
        </div>
      `);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theaters, center, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={`rounded-material-lg ${height} w-full`}
      data-testid="theater-map"
    />
  );
}
