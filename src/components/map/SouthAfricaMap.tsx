
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrecheMarker } from './CrecheMarker';

export const SouthAfricaMap = () => {
  // Fix the marker icon issue in leaflet
  useEffect(() => {
    // Ensure this only runs once on mount
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
    });
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

  // Ensure the MapContainer is only rendered on the client side
  if (typeof window === 'undefined') return null;

  return (
    <div style={{ height: '400px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[-30.5595, 22.9375]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {creches?.map((creche) => (
          <CrecheMarker
            key={creche.id}
            id={creche.id}
            name={creche.name}
            latitude={creche.latitude}
            longitude={creche.longitude}
            province={creche.province}
            suburb={creche.suburb}
          />
        ))}
      </MapContainer>
    </div>
  );
};
