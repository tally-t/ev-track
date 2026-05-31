import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { ChargingStation } from '../types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

interface Props {
  center: { lat: number; lng: number };
  stations: ChargingStation[];
  onSelectStation: (s: ChargingStation) => void;
}

function stationColor(station: ChargingStation): string {
  const op = station.statusType?.isOperational;
  if (op === true) return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  if (op === false) return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
}

export default function GoogleMapView({ center, stations, onSelectStation }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter(center);
  }, [center]);

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 40 }}>🗺️</span>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Google Maps failed to load.</p>
        <p style={{ color: '#888', fontSize: 13 }}>Check your EXPO_PUBLIC_GOOGLE_MAPS_KEY in Vercel.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: '#6366f1' }}>Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100vh' }}
      center={center}
      zoom={13}
      onLoad={onLoad}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* User location */}
      <Marker
        position={center}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#6366f1',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        }}
        title="You are here"
      />

      {stations.map((station) => (
        <Marker
          key={station.id}
          position={{ lat: station.latitude, lng: station.longitude }}
          icon={stationColor(station)}
          title={station.name}
          onClick={() => onSelectStation(station)}
        />
      ))}
    </GoogleMap>
  );
}
