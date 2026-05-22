'use client';

import dynamic from 'next/dynamic';
import { Waypoint } from '@/types/trip';

// Loading fallback skeleton
const MapSkeleton = () => (
  <div className="w-full h-full min-h-[380px] bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
    {/* Map Radar effect */}
    <div className="absolute w-44 h-44 rounded-full border border-teal-500/20 flex items-center justify-center animate-ping duration-1000">
      <div className="w-24 h-24 rounded-full border border-teal-500/40"></div>
    </div>
    
    <div className="z-10 flex flex-col items-center gap-3">
      <svg className="w-12 h-12 text-teal-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <span className="text-sm font-semibold text-slate-400 tracking-wider">Mounting Navigation System...</span>
    </div>
  </div>
);

// Dynamic import with SSR disabled
const DynamicRoadTripMap = dynamic(
  () => import('./RoadTripMapInner'),
  { 
    ssr: false,
    loading: () => <MapSkeleton />
  }
);

interface RoadTripMapProps {
  destinations: Waypoint[];
}

export default function RoadTripMap({ destinations }: RoadTripMapProps) {
  return <DynamicRoadTripMap destinations={destinations} />;
}
