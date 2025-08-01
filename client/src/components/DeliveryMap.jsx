import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const DeliveryMap = ({ coordinates }) => (
  <MapContainer center={coordinates} zoom={13}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={coordinates} />
  </MapContainer>
);