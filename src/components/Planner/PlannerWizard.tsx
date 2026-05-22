'use client';

import { useState } from 'react';
import { 
  MapPin, Plus, Trash2, Calendar, Users, Car, Sparkles, 
  DollarSign, CircleEqual, HelpCircle, ChevronDown, RefreshCw 
} from 'lucide-react';
import { 
  RoadTrip, Waypoint, Vehicle, VehicleType, FuelType, 
  Traveler, CurrencyCode, CURRENCIES 
} from '@/types/trip';

interface PlannerWizardProps {
  trip: RoadTrip;
  activeCurrency: CurrencyCode;
  onUpdateTrip: (updatedTrip: RoadTrip) => void;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onLoadPreset: (presetId: string) => void;
}

const VEHICLE_PRESETS: Record<VehicleType, { name: string; efficiency: number; fuelType: FuelType; fuelCost: number }> = {
  compact: { name: 'Eco Sedan', efficiency: 7.2, fuelType: 'petrol', fuelCost: 1.25 },
  suv: { name: 'Adventure SUV', efficiency: 11.5, fuelType: 'diesel', fuelCost: 1.18 },
  motorcycle: { name: 'Cruiser Motorcycle', efficiency: 4.2, fuelType: 'petrol', fuelCost: 1.25 },
  ev: { name: 'Long Range EV', efficiency: 17.5, fuelType: 'electricity', fuelCost: 0.35 }
};

// Preset dynamic suggestions for waypoints
const SUGGESTED_WAYPOINTS = [
  { name: 'Yellowstone Park, WY', lat: 44.4280, lng: -110.5885 },
  { name: 'Las Vegas, NV', lat: 36.1716, lng: -115.1398 },
  { name: 'New York City, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Taj Mahal, India', lat: 27.1751, lng: 78.0421 },
  { name: 'Cape Town, SA', lat: -33.9249, lng: 18.4241 },
];

export default function PlannerWizard({
  trip,
  activeCurrency,
  onUpdateTrip,
  onChangeCurrency,
  onLoadPreset
}: PlannerWizardProps) {
  const [newTravelerName, setNewTravelerName] = useState('');
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [customWaypointName, setCustomWaypointName] = useState('');
  const [customWaypointLat, setCustomWaypointLat] = useState('');
  const [customWaypointLng, setCustomWaypointLng] = useState('');

  // Handle core trip details modification
  const updateField = (key: keyof RoadTrip, value: any) => {
    onUpdateTrip({ ...trip, [key]: value });
  };

  // Handle vehicle modifications
  const updateVehicle = (updatedVehicle: Partial<Vehicle>) => {
    onUpdateTrip({
      ...trip,
      vehicle: { ...trip.vehicle, ...updatedVehicle }
    });
  };

  // Change Vehicle Type & apply template defaults
  const handleVehicleTypeChange = (type: VehicleType) => {
    const preset = VEHICLE_PRESETS[type];
    onUpdateTrip({
      ...trip,
      vehicle: {
        type,
        name: preset.name,
        efficiency: preset.efficiency,
        fuelType: preset.fuelType,
        fuelCostPerUnit: preset.fuelCost,
        useTollPass: trip.vehicle.useTollPass
      }
    });
  };

  // Add Traveler
  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravelerName.trim()) return;

    const newTraveler: Traveler = {
      id: `t-custom-${Date.now()}`,
      name: newTravelerName.trim(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
    };

    updateField('travelers', [...trip.travelers, newTraveler]);
    setNewTravelerName('');
  };

  // Remove Traveler
  const handleRemoveTraveler = (id: string) => {
    // Keep at least 1 traveler to calculate splits
    if (trip.travelers.length <= 1) return;
    
    // Filter traveler list
    const filteredTravelers = trip.travelers.filter(t => t.id !== id);
    
    // Also remove or clean up expenses associated with deleted traveler
    const updatedExpenses = trip.expenses.map(exp => {
      // If paid by deleted traveler, re-assign to first remaining traveler
      const paidById = exp.paidById === id ? filteredTravelers[0].id : exp.paidById;
      
      // Remove deleted traveler from splitWith list
      const splitWithIds = exp.splitWithIds.filter(tid => tid !== id);
      
      return { ...exp, paidById, splitWithIds };
    });

    onUpdateTrip({
      ...trip,
      travelers: filteredTravelers,
      expenses: updatedExpenses
    });
  };

  // Add custom waypoint
  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWaypointName.trim()) return;

    const lat = parseFloat(customWaypointLat) || 37.7749;
    const lng = parseFloat(customWaypointLng) || -122.4194;

    const newDest: Waypoint = {
      id: `w-custom-${Date.now()}`,
      name: customWaypointName.trim(),
      lat,
      lng
    };

    // Append to destinations before the end destination
    const updatedDestinations = [...trip.destinations];
    if (updatedDestinations.length > 1) {
      // Insert right before the last element (End destination)
      updatedDestinations.splice(updatedDestinations.length - 1, 0, newDest);
    } else {
      updatedDestinations.push(newDest);
    }

    updateField('destinations', updatedDestinations);
    setCustomWaypointName('');
    setCustomWaypointLat('');
    setCustomWaypointLng('');
  };

  // Quick Add Suggested Waypoint
  const handleAddSuggestedWaypoint = (suggested: typeof SUGGESTED_WAYPOINTS[0]) => {
    const newDest: Waypoint = {
      id: `w-suggest-${Date.now()}`,
      name: suggested.name,
      lat: suggested.lat,
      lng: suggested.lng
    };

    const updatedDestinations = [...trip.destinations];
    if (updatedDestinations.length > 1) {
      updatedDestinations.splice(updatedDestinations.length - 1, 0, newDest);
    } else {
      updatedDestinations.push(newDest);
    }
    updateField('destinations', updatedDestinations);
  };

  // Remove Waypoint (destinations)
  const handleRemoveWaypoint = (id: string) => {
    // Keep start and end at least
    if (trip.destinations.length <= 2) return;
    const updated = trip.destinations.filter(d => d.id !== id);
    
    // Ensure start/end flags are preserved
    if (updated.length > 0) updated[0].isStart = true;
    if (updated.length > 1) updated[updated.length - 1].isEnd = true;

    updateField('destinations', updated);
  };

  // Update specific destination coordinates directly
  const handleUpdateDestCoords = (id: string, latVal: string, lngVal: string) => {
    const lat = parseFloat(latVal) || 0;
    const lng = parseFloat(lngVal) || 0;

    const updated = trip.destinations.map(d => {
      if (d.id === id) {
        return { ...d, lat, lng };
      }
      return d;
    });

    updateField('destinations', updated);
  };

  // Update specific destination name
  const handleUpdateDestName = (id: string, name: string) => {
    const updated = trip.destinations.map(d => {
      if (d.id === id) {
        return { ...d, name };
      }
      return d;
    });
    updateField('destinations', updated);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* 1. TOP HEADER & CURRENCY SELECTION */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1.5 mb-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> TrekTroves Dashboard
          </span>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Trip Configurator
          </h2>
        </div>

        {/* Currency Switcher & Preset Loader */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Currency Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 flex-grow md:flex-grow-0 justify-between">
            <span className="text-xs text-slate-400 font-semibold mr-1">Currency:</span>
            <select
              value={activeCurrency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-teal-400 outline-none cursor-pointer focus:ring-0 select-none"
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code} className="bg-slate-950 text-slate-200">
                  {CURRENCIES[code as CurrencyCode].symbol} {code}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              className="px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Presets <ChevronDown className="w-3 h-3" />
            </button>
            {showPresetsDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-950 border border-slate-850 shadow-2xl z-40 p-2.5 animate-in fade-in slide-in-from-top-3 duration-250">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 pb-1.5 border-b border-slate-900">
                  Choose Preset Roadtrip
                </p>
                <div className="flex flex-col gap-1 mt-1.5">
                  <button
                    onClick={() => { onLoadPreset('route-66'); setShowPresetsDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition"
                  >
                    Historic Route 66 (USA)
                  </button>
                  <button
                    onClick={() => { onLoadPreset('leh-ladakh'); setShowPresetsDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition"
                  >
                    Leh-Ladakh Highway (India)
                  </button>
                  <button
                    onClick={() => { onLoadPreset('pch'); setShowPresetsDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition"
                  >
                    Pacific Coast Highway (USA)
                  </button>
                  <button
                    onClick={() => { onLoadPreset('amalfi-coast'); setShowPresetsDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-teal-400 transition"
                  >
                    Amalfi Coast Vespa (Italy)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CORE TRIP INFORMATION FORM */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-5">
        <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest border-b border-slate-850 pb-2">
          Basic Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trip Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
              Adventure Name
            </label>
            <input
              type="text"
              value={trip.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="glass-input text-sm"
              placeholder="e.g. Coast to Coast Expedition"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" /> Start Date
              </label>
              <input
                type="date"
                value={trip.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="glass-input text-xs font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" /> End Date
              </label>
              <input
                type="date"
                value={trip.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="glass-input text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. WAYPOINT & ROUTE PLANNER */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest">
            Route Destinations
          </h3>
          <span className="text-xs bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-slate-400 font-semibold">
            {trip.destinations.length} Stops
          </span>
        </div>

        {/* Existing Waypoint inputs */}
        <div className="flex flex-col gap-4">
          {trip.destinations.map((dest, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === trip.destinations.length - 1;
            
            return (
              <div 
                key={dest.id} 
                className={`flex flex-col gap-3 p-3.5 rounded-lg border transition ${
                  isStart 
                    ? 'bg-teal-950/20 border-teal-850/60' 
                    : isEnd 
                      ? 'bg-indigo-950/20 border-indigo-850/60' 
                      : 'bg-slate-900/40 border-slate-850'
                }`}
              >
                {/* Header label and removal */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] text-slate-900 ${
                      isStart 
                        ? 'bg-teal-500 font-black' 
                        : isEnd 
                          ? 'bg-indigo-500 font-black text-white' 
                          : 'bg-slate-700 font-bold text-slate-200'
                    }`}>
                      {isStart ? 'A' : isEnd ? 'B' : idx}
                    </span>
                    <span className={isStart ? 'text-teal-400' : isEnd ? 'text-indigo-400' : 'text-slate-300'}>
                      {isStart ? 'Starting Location' : isEnd ? 'Final Destination' : `Waypoint #${idx}`}
                    </span>
                  </span>
                  
                  {!isStart && !isEnd && (
                    <button
                      onClick={() => handleRemoveWaypoint(dest.id)}
                      className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Input grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Name</label>
                    <input
                      type="text"
                      value={dest.name}
                      onChange={(e) => handleUpdateDestName(dest.id, e.target.value)}
                      className="bg-slate-950/60 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-200 focus:border-teal-500"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:col-span-2">
                    <div className="flex flex-col gap-1 w-1/2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={dest.lat}
                        onChange={(e) => handleUpdateDestCoords(dest.id, e.target.value, String(dest.lng))}
                        className="bg-slate-950/60 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-200 focus:border-teal-500 w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={dest.lng}
                        onChange={(e) => handleUpdateDestCoords(dest.id, String(dest.lat), e.target.value)}
                        className="bg-slate-950/60 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-200 focus:border-teal-500 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom waypoint */}
        <form onSubmit={handleAddWaypoint} className="p-3.5 bg-slate-950/40 rounded-lg border border-slate-850/60 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-teal-400" /> Insert Midpoint Waypoint
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={customWaypointName}
              onChange={(e) => setCustomWaypointName(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded text-slate-300 outline-none focus:border-teal-500"
              placeholder="Stop Name (e.g. Yosemite Valley)"
            />
            <input
              type="number"
              step="0.0001"
              value={customWaypointLat}
              onChange={(e) => setCustomWaypointLat(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded text-slate-300 outline-none focus:border-teal-500"
              placeholder="Latitude (e.g. 37.7456)"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.0001"
                value={customWaypointLng}
                onChange={(e) => setCustomWaypointLng(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded text-slate-300 outline-none focus:border-teal-500 flex-grow"
                placeholder="Longitude (e.g. -119.5332)"
              />
              <button
                type="submit"
                className="px-3 bg-slate-850 hover:bg-teal-500 hover:text-slate-950 text-slate-300 font-bold rounded text-xs transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Dynamic coordinate assistant */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Quick coordinates assistant (Click to inject standard locations)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_WAYPOINTS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleAddSuggestedWaypoint(s)}
                className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-850/60 text-slate-400 hover:text-teal-400 hover:border-teal-400 transition cursor-pointer"
              >
                + {s.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. VEHICLE CONFIGURATOR */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-5">
        <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest border-b border-slate-850 pb-2">
          Vehicle Profile
        </h3>

        {/* Preset selections */}
        <div className="grid grid-cols-4 gap-2">
          {(['compact', 'suv', 'motorcycle', 'ev'] as VehicleType[]).map((type) => {
            const isActive = trip.vehicle.type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleVehicleTypeChange(type)}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-950/30 border-teal-500 text-teal-400 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Car className="w-4 h-4" />
                <span className="text-[9px] font-extrabold capitalize">{type === 'ev' ? 'Electric EV' : type}</span>
              </button>
            );
          })}
        </div>

        {/* Custom parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Vehicle Description</label>
            <input
              type="text"
              value={trip.vehicle.name}
              onChange={(e) => updateVehicle({ name: e.target.value })}
              className="glass-input text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">
                Efficiency {trip.vehicle.type === 'ev' ? '(kWh/100km)' : '(L/100km)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={trip.vehicle.efficiency}
                onChange={(e) => updateVehicle({ efficiency: parseFloat(e.target.value) || 0 })}
                className="glass-input text-xs font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">
                Cost {trip.vehicle.type === 'ev' ? '($/kWh)' : '($/Liter)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={trip.vehicle.fuelCostPerUnit}
                onChange={(e) => updateVehicle({ fuelCostPerUnit: parseFloat(e.target.value) || 0 })}
                className="glass-input text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Toll road options */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-lg border border-slate-850/60">
          <div>
            <h4 className="text-xs font-bold text-slate-200">Include Express Toll Roads</h4>
            <p className="text-[10px] text-slate-500">Enable automatic calculated tolls split during trip calculations.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={trip.vehicle.useTollPass}
              onChange={(e) => updateVehicle({ useTollPass: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500 peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
          </label>
        </div>
      </div>

      {/* 5. TRAVELERS LIST */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest border-b border-slate-850 pb-2">
          Travel Squad
        </h3>

        {/* Traveler tags */}
        <div className="flex flex-wrap gap-2.5">
          {trip.travelers.map((traveler) => (
            <div 
              key={traveler.id} 
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-950/60 border border-slate-850 pr-1.5"
            >
              <img 
                src={traveler.avatar} 
                alt={traveler.name} 
                className="w-5.5 h-5.5 rounded-full object-cover border border-slate-800" 
              />
              <span className="text-xs font-semibold text-slate-200">{traveler.name}</span>
              
              {trip.travelers.length > 1 && (
                <button
                  onClick={() => handleRemoveTraveler(traveler.id)}
                  className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900 transition cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add traveler form */}
        <form onSubmit={handleAddTraveler} className="flex gap-2">
          <input
            type="text"
            value={newTravelerName}
            onChange={(e) => setNewTravelerName(e.target.value)}
            className="glass-input text-xs flex-grow font-semibold"
            placeholder="Add partner name (e.g. Bob)"
          />
          <button
            type="submit"
            className="px-3.5 bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Join
          </button>
        </form>
      </div>
    </div>
  );
}
