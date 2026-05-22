'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Waypoint } from '@/types/trip';

// Re-map leaflet icons because standard bundle can fail to resolve images
import 'leaflet/dist/leaflet.css';

interface RoadTripMapInnerProps {
  destinations: Waypoint[];
}

// Custom markers using L.divIcon and Tailwind CSS
const createMarkerIcon = (type: 'start' | 'end' | 'waypoint', index?: number) => {
  let bgColor = 'bg-emerald-500';
  let borderColor = 'border-emerald-300';
  let shadowColor = 'shadow-emerald-500/45';
  let pulseColor = 'bg-emerald-500';
  let label = 'W';

  if (type === 'start') {
    bgColor = 'bg-teal-500';
    borderColor = 'border-teal-300';
    shadowColor = 'shadow-teal-500/50';
    pulseColor = 'bg-teal-400';
    label = 'A';
  } else if (type === 'end') {
    bgColor = 'bg-indigo-600';
    borderColor = 'border-indigo-400';
    shadowColor = 'shadow-indigo-600/50';
    pulseColor = 'bg-indigo-500';
    label = 'B';
  } else if (index !== undefined) {
    label = `${index}`;
  }

  return L.divIcon({
    className: 'custom-map-marker-container',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center rounded-full text-slate-900 font-bold border-2 border-slate-900 shadow-lg ${bgColor} ${borderColor} ${shadowColor}">
        ${type === 'start' || type === 'end' ? `<div class="marker-pulse absolute w-full h-full rounded-full opacity-60 animate-ping ${pulseColor}"></div>` : ''}
        <span class="text-xs font-extrabold text-white z-10">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to dynamically fit map bounds to the current destinations
function ChangeView({ destinations }: { destinations: Waypoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 0) return;

    // Filter out invalid coordinates
    const validCoords = destinations.filter(d => !isNaN(d.lat) && !isNaN(d.lng));
    if (validCoords.length === 0) return;

    const bounds = L.latLngBounds(validCoords.map(d => [d.lat, d.lng]));
    
    // Auto fit bounds with comfortable padding
    map.fitBounds(bounds, {
      padding: [55, 55],
      maxZoom: 12,
      animate: true,
      duration: 1.2,
    });
  }, [destinations, map]);

  return null;
}

export default function RoadTripMapInner({ destinations }: RoadTripMapInnerProps) {
  // Extract coordinate paths for the polyline connecting destinations
  const pathCoordinates = useMemo(() => {
    return destinations
      .filter(d => !isNaN(d.lat) && !isNaN(d.lng))
      .map(d => [d.lat, d.lng] as [number, number]);
  }, [destinations]);

  // Center on first destination or default center
  const defaultCenter: [number, number] = destinations.length > 0 && !isNaN(destinations[0].lat) && !isNaN(destinations[0].lng)
    ? [destinations[0].lat, destinations[0].lng]
    : [37.0902, -95.7129]; // Center of USA

  return (
    <div className="w-full h-full relative" style={{ minHeight: '380px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={4}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', minHeight: '380px' }}
      >
        {/* Sleek styled Dark Mode CartoDB Dark Matter tiles.
            Leaflet tiles will also be run through our custom CSS filter in globals.css
            for a visually gorgeous integration! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Path Rendering connecting destinations */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            color="#14b8a6"
            weight={4}
            opacity={0.8}
            lineJoin="round"
            dashArray="1, 8" /* Clean dotted explorer path style */
          />
        )}

        {/* Active solid backing Polyline to create an elegant dual-layered glowing path */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            color="#06b6d4"
            weight={3}
            opacity={0.9}
            lineJoin="round"
          />
        )}

        {/* Custom Marker Pins */}
        {destinations.map((dest, idx) => {
          let markerType: 'start' | 'end' | 'waypoint' = 'waypoint';
          if (idx === 0) markerType = 'start';
          else if (idx === destinations.length - 1) markerType = 'end';

          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createMarkerIcon(markerType, idx + 1)}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="text-sm font-bold text-teal-400">
                    {markerType === 'start' ? 'Start: ' : markerType === 'end' ? 'Destination: ' : `Stop #${idx + 1}: `}
                    {dest.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Latitude: {dest.lat.toFixed(4)} <br />
                    Longitude: {dest.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Reactive Bounds Adjuster */}
        <ChangeView destinations={destinations} />
      </MapContainer>
    </div>
  );
}
