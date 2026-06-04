import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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

const RoutingControl = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // @ts-ignore - leaflet-routing-machine types
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(8.367951, 124.865832), // Manolo Fortich
        L.latLng(8.477217, 124.645920)  // Cagayan de Oro
      ],
      routeWhileDragging: true,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // hide instructions by default
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#3880ff', weight: 5, opacity: 0.9 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map]);

  return null;
};

const Map = () => {
  return (
    <MapContainer 
      center={[8.367951, 124.865832]} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <RoutingControl />
    </MapContainer>
  );
};

export default Map;
