import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChargingStation } from '../types';

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:2.5px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;
    ">⚡</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const GREEN = makeIcon('#22c55e');
const AMBER = makeIcon('#f59e0b');
const RED = makeIcon('#ef4444');

function stationIcon(station: ChargingStation) {
  const op = station.statusType?.isOperational;
  if (op === true) return GREEN;
  if (op === false) return RED;
  return AMBER;
}

function RecenterOnLoad({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Props {
  center: [number, number];
  stations: ChargingStation[];
  onSelectStation: (s: ChargingStation) => void;
}

export default function LeafletMap({ center, stations, onSelectStation }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      <RecenterOnLoad center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker */}
      <Marker position={center} icon={L.divIcon({
        className: '',
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#6366f1;border:3px solid #fff;
          box-shadow:0 0 0 4px rgba(99,102,241,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })}>
        <Popup>You are here</Popup>
      </Marker>

      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={stationIcon(station)}
          eventHandlers={{ click: () => onSelectStation(station) }}
        >
          <Popup>
            <strong>{station.name}</strong><br />
            <span style={{ color: '#888', fontSize: 12 }}>{station.address}</span><br />
            <span style={{ fontSize: 12 }}>
              {station.statusType?.title ?? 'Status unknown'} ·{' '}
              {station.connections.length} connector{station.connections.length !== 1 ? 's' : ''}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
