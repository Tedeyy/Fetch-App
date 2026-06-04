import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import '../assets/css/map.css'

const Map = () => {
  const position: LatLngExpression = [8.367951, 124.865832]; //Manolo Fortich = 8.367951, 124.865832
  return (
    <MapContainer center={position} zoom={13} style={{ height: '200px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
