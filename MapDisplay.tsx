// src/components/ui/MapDisplay.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet marker icon issue with Webpack
// You might need to copy marker-icon.png, marker-icon-2x.png, and marker-shadow.png
// from node_modules/leaflet/dist/images to your public/images folder
// Or use a CDN path
useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}, []);

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  popupText?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude, popupText }) => {
  if (typeof window === 'undefined') {
    // Don't render on the server
    return null;
  }

  const position: L.LatLngExpression = [latitude, longitude];

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
    </MapContainer>
  );
};

export default MapDisplay;

