import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import '../assets/css/map.css';

const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const pickupIcon = createMarkerIcon('#2dd36f'); // Ionic success green
const dropoffIcon = createMarkerIcon('#3880ff'); // Ionic primary blue

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    if (data && data.address) {
      const address = data.address;
      const street = address.road || address.pedestrian || "";
      const area = address.neighbourhood || address.suburb || address.village || address.town || "";
      const city = address.city || address.county || "";
      
      const parts = [street, area, city].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : data.display_name.split(',')[0];
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
  return "Unknown Location";
};

const RoutingMachine = ({ routePoints }: { routePoints: { pickup: [number, number], dropoff: [number, number] } }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !routePoints) return;

    // @ts-ignore
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(routePoints.pickup[0], routePoints.pickup[1]),
        L.latLng(routePoints.dropoff[0], routePoints.dropoff[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // hide instructions by default
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#3880ff', weight: 6, opacity: 0.8 }]
      },
      createMarker: () => null // Hide the default routing markers
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, routePoints]);

  return null;
};

interface MapProps {
  isBlurred?: boolean;
  isBooking?: boolean;
  activeField?: 'pickup' | 'dropoff';
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  onPickupUpdate: (name: string, lat: number, lng: number) => void;
  onDropoffUpdate: (name: string, lat: number, lng: number) => void;
  routePoints?: { pickup: [number, number], dropoff: [number, number] } | null;
}

const Map = ({ isBlurred = false, isBooking = false, activeField = 'pickup', pickupCoords, dropoffCoords, onPickupUpdate, onDropoffUpdate, routePoints }: MapProps) => {
  const pickupRef = useRef<L.Marker>(null);
  const dropoffRef = useRef<L.Marker>(null);

  const pickupHandlers = useMemo(
    () => ({
      dragend() {
        const marker = pickupRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          reverseGeocode(lat, lng).then(name => {
            onPickupUpdate(name, lat, lng);
          });
        }
      },
    }),
    [onPickupUpdate],
  );

  const dropoffHandlers = useMemo(
    () => ({
      dragend() {
        const marker = dropoffRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          reverseGeocode(lat, lng).then(name => {
            onDropoffUpdate(name, lat, lng);
          });
        }
      },
    }),
    [onDropoffUpdate],
  );

  useEffect(() => {
    // Initial geocode for pickup
    reverseGeocode(pickupCoords[0], pickupCoords[1]).then(name => {
      onPickupUpdate(name, pickupCoords[0], pickupCoords[1]);
    });
  }, []);

  return (
    <div className={isBlurred ? 'blurred-map' : ''} style={{ height: '100%', width: '100%', transition: 'filter 0.3s ease' }}>
      <MapContainer 
        center={pickupCoords} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        
        <Marker
          draggable={isBooking && activeField === 'pickup' && !routePoints}
          eventHandlers={pickupHandlers}
          position={pickupCoords}
          ref={pickupRef}
          icon={pickupIcon}
        >
          {isBooking && activeField === 'pickup' && !routePoints && (
            <Popup minWidth={90}>
              <span>Drag me to set <strong>Pickup</strong></span>
            </Popup>
          )}
        </Marker>

        <Marker
          draggable={isBooking && activeField === 'dropoff' && !routePoints}
          eventHandlers={dropoffHandlers}
          position={dropoffCoords}
          ref={dropoffRef}
          icon={dropoffIcon}
        >
          {isBooking && activeField === 'dropoff' && !routePoints && (
            <Popup minWidth={90}>
              <span>Drag me to set <strong>Dropoff</strong></span>
            </Popup>
          )}
        </Marker>

        {routePoints && <RoutingMachine routePoints={routePoints} />}
      </MapContainer>
    </div>
  );
};

export default Map;
