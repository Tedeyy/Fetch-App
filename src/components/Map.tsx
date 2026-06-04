import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import '../assets/css/map.css';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    if (data && data.display_name) {
      const address = data.address;
      const area = address.road || address.neighbourhood || address.suburb || address.village || address.town || address.city || data.name;
      return area || data.display_name.split(',')[0];
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
  return "Unknown Location";
};

interface MapProps {
  isBlurred?: boolean;
  isBooking?: boolean;
  onLocationSelect?: (locationName: string, lat: number, lng: number) => void;
}

const Map = ({ isBlurred = false, isBooking = false, onLocationSelect }: MapProps) => {
  const [position, setPosition] = useState<L.LatLngExpression>([8.367951, 124.865832]);
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          reverseGeocode(lat, lng).then(name => {
            if (onLocationSelect) {
              onLocationSelect(name, lat, lng);
            }
          });
        }
      },
    }),
    [onLocationSelect],
  );

  useEffect(() => {
    reverseGeocode(8.367951, 124.865832).then(name => {
      if (onLocationSelect) {
        onLocationSelect(name, 8.367951, 124.865832);
      }
    });
  }, []);

  return (
    <div className={isBlurred ? 'blurred-map' : ''} style={{ height: '100%', width: '100%', transition: 'filter 0.3s ease' }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <Marker
          draggable={isBooking}
          eventHandlers={isBooking ? eventHandlers : undefined}
          position={position}
          ref={markerRef}
        >
          {isBooking && (
            <Popup minWidth={90}>
              <span>Drag me to set location</span>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
