
import { LeafletMouseEvent } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

type CrecheMarkerProps = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  province: string;
  suburb: string;
};

export const CrecheMarker = ({
  id,
  name,
  latitude,
  longitude,
  province,
  suburb,
}: CrecheMarkerProps) => {
  const navigate = useNavigate();

  if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  const handleClick = (e: LeafletMouseEvent) => {
    e.originalEvent.stopPropagation();
    navigate(`/creches/${id}`);
  };

  return (
    <Marker position={[latitude, longitude]} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {suburb}, {province}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};
