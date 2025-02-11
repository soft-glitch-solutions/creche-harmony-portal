
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrecheMarker } from './CrecheMarker';

export const SouthAfricaMap = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fix Leaflet's default icon path issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png',
      });
      setIsMounted(true);
    }
  }, []);

  const { data: creches } = useQuery({
    queryKey: ['creches'],
    queryFn: async () => {
      const { data } = await supabase
        .from('creches')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      return data || [];
    },
  });

  if (!isMounted || typeof window === 'undefined') {
    return <div className="h-[400px] w-full bg-muted animate-pulse" />;
  }

  return (
    <div className="h-[400px] w-full relative">
      {isMounted && (
        <MapContainer
          center={[-30.5595, 22.9375]}
          zoom={5}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {creches?.map((creche) => 
            creche.latitude && creche.longitude ? (
              <CrecheMarker
                key={creche.id}
                id={creche.id}
                name={creche.name}
                latitude={creche.latitude}
                longitude={creche.longitude}
                province={creche.province}
                suburb={creche.suburb}
              />
            ) : null
          )}
        </MapContainer>
      )}
    </div>
  );
};
