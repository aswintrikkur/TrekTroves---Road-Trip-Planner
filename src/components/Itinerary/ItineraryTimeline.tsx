'use client';

import { useState } from 'react';
import { 
  Calendar, MapPin, Navigation, Clock, Utensils, 
  Bed, Camera, Award, Plus, Trash2, Edit2, Check, X 
} from 'lucide-react';
import { 
  RoadTrip, ItineraryDay, ItineraryActivity, 
  ActivityType, CurrencyCode, CURRENCIES 
} from '@/types/trip';

interface ItineraryTimelineProps {
  trip: RoadTrip;
  activeCurrency: CurrencyCode;
  onUpdateTrip: (updatedTrip: RoadTrip) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  driving: Navigation,
  dining: Utensils,
  lodging: Bed,
  sightseeing: Camera,
  other: Award
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  driving: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  dining: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  lodging: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  sightseeing: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  other: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
};

export default function ItineraryTimeline({
  trip,
  activeCurrency,
  onUpdateTrip
}: ItineraryTimelineProps) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);

  // New activity form state
  const [newActTime, setNewActTime] = useState('12:00 PM');
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState<ActivityType>('sightseeing');
  const [newActCost, setNewActCost] = useState('0');

  // Inline editing state
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCost, setEditCost] = useState('');

  const currentCurrency = CURRENCIES[activeCurrency];

  // Helper to format currency
  const formatCost = (usdAmount: number) => {
    const converted = usdAmount * currentCurrency.rate;
    return `${currentCurrency.symbol}${converted.toFixed(2)}`;
  };

  // Switch Active Day
  const handleSelectDay = (idx: number) => {
    setActiveDayIdx(idx);
    setShowAddActivityForm(false);
  };

  // Add a Day to the itinerary
  const handleAddDay = () => {
    const newDayNumber = trip.itinerary.length + 1;
    
    // Calculate new date
    const startMilli = new Date(trip.startDate).getTime();
    const dayMilli = 24 * 60 * 60 * 1000 * (newDayNumber - 1);
    const dateStr = new Date(startMilli + dayMilli).toISOString().split('T')[0];

    // Determine default start and end locations based on existing route
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    const defaultStart = lastDay ? lastDay.endLocation : 'Next Stop';

    const newDay: ItineraryDay = {
      dayNumber: newDayNumber,
      date: dateStr,
      startLocation: defaultStart,
      endLocation: 'Exploration Destination',
      distanceKm: 0,
      driveTimeMinutes: 0,
      activities: []
    };

    onUpdateTrip({
      ...trip,
      itinerary: [...trip.itinerary, newDay]
    });
    
    setActiveDayIdx(trip.itinerary.length); // Select new day
  };

  // Remove Active Day
  const handleRemoveDay = (dayNum: number) => {
    if (trip.itinerary.length <= 1) return;
    
    const updated = trip.itinerary
      .filter(d => d.dayNumber !== dayNum)
      .map((d, idx) => ({ ...d, dayNumber: idx + 1 })); // Re-number

    onUpdateTrip({ ...trip, itinerary: updated });
    setActiveDayIdx(Math.max(0, activeDayIdx - 1));
  };

  // Add Activity to Active Day
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle.trim()) return;

    // Convert input cost based on current currency back to USD for saving
    const inputCostFloat = parseFloat(newActCost) || 0;
    const usdCost = inputCostFloat / currentCurrency.rate;

    const newActivity: ItineraryActivity = {
      id: `act-${Date.now()}`,
      time: newActTime,
      title: newActTitle.trim(),
      type: newActType,
      cost: usdCost
    };

    const updatedItinerary = trip.itinerary.map((day, idx) => {
      if (idx === activeDayIdx) {
        // Recalculate totals if activity is driving
        let addDist = 0;
        let addTime = 0;
        if (newActType === 'driving') {
          // Mock driving segment adds 80km / 60mins
          addDist = 80;
          addTime = 60;
        }

        return {
          ...day,
          distanceKm: day.distanceKm + addDist,
          driveTimeMinutes: day.driveTimeMinutes + addTime,
          activities: [...day.activities, newActivity]
        };
      }
      return day;
    });

    // Also automatically inject this cost as a shared expense under travelers
    const newExpense = {
      id: `exp-itin-${Date.now()}`,
      category: newActType === 'lodging' ? 'lodging' : newActType === 'dining' ? 'food' : newActType === 'sightseeing' ? 'activities' : 'misc',
      amount: usdCost,
      description: `Day ${activeDayIdx + 1}: ${newActTitle}`,
      paidById: trip.travelers[0].id, // Default to first traveler
      splitWithIds: [], // Split among all
      date: trip.itinerary[activeDayIdx].date
    };

    onUpdateTrip({
      ...trip,
      itinerary: updatedItinerary,
      expenses: usdCost > 0 ? [...trip.expenses, newExpense as any] : trip.expenses,
      totalDistanceKm: trip.totalDistanceKm + (newActType === 'driving' ? 80 : 0)
    });

    // Reset form states
    setNewActTitle('');
    setNewActCost('0');
    setNewActTime('12:00 PM');
    setShowAddActivityForm(false);
  };

  // Delete Activity
  const handleDeleteActivity = (actId: string) => {
    const activeDay = trip.itinerary[activeDayIdx];
    const targetActivity = activeDay.activities.find(a => a.id === actId);
    if (!targetActivity) return;

    const updatedItinerary = trip.itinerary.map((day, idx) => {
      if (idx === activeDayIdx) {
        let minusDist = 0;
        let minusTime = 0;
        if (targetActivity.type === 'driving') {
          minusDist = 80;
          minusTime = 60;
        }

        return {
          ...day,
          distanceKm: Math.max(0, day.distanceKm - minusDist),
          driveTimeMinutes: Math.max(0, day.driveTimeMinutes - minusTime),
          activities: day.activities.filter(a => a.id !== actId)
        };
      }
      return day;
    });

    onUpdateTrip({
      ...trip,
      itinerary: updatedItinerary,
      totalDistanceKm: Math.max(0, trip.totalDistanceKm - (targetActivity.type === 'driving' ? 80 : 0))
    });
  };

  // Start Inline Editing Activity
  const handleStartEdit = (act: ItineraryActivity) => {
    setEditingActId(act.id);
    setEditTitle(act.title);
    setEditCost((act.cost * currentCurrency.rate).toFixed(2));
  };

  // Save Inline Edited Activity
  const handleSaveEdit = (actId: string) => {
    const costInUsd = (parseFloat(editCost) || 0) / currentCurrency.rate;

    const updatedItinerary = trip.itinerary.map((day, idx) => {
      if (idx === activeDayIdx) {
        return {
          ...day,
          activities: day.activities.map(a => 
            a.id === actId ? { ...a, title: editTitle, cost: costInUsd } : a
          )
        };
      }
      return day;
    });

    onUpdateTrip({
      ...trip,
      itinerary: updatedItinerary
    });

    setEditingActId(null);
  };

  const activeDay = trip.itinerary[activeDayIdx];

  // Helper to format drive times
  const formatDriveTime = (totalMins: number) => {
    if (totalMins <= 0) return '0 hrs';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col gap-5 w-full h-full">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3 flex-wrap gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-1 animate-pulse">
            <Calendar className="w-3.5 h-3.5" /> Adventure Schedule
          </span>
          <h2 className="text-xl font-extrabold text-white">Itinerary Timeline</h2>
        </div>
        <button
          onClick={handleAddDay}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 font-extrabold text-xs text-slate-350 flex items-center gap-1.5 border border-slate-750 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Travel Day
        </button>
      </div>

      {/* Day Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin select-none">
        {trip.itinerary.map((day, idx) => {
          const isActive = idx === activeDayIdx;
          return (
            <button
              key={day.dayNumber}
              onClick={() => handleSelectDay(idx)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-lg border font-bold text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-teal-950/30 border-teal-500 text-teal-400 shadow-md'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              Day {day.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Active Day Dashboard */}
      {activeDay ? (
        <div className="flex flex-col gap-5">
          {/* Daily overview statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
            {/* Travel leg */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Route Leg</span>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]" title={`${activeDay.startLocation} to ${activeDay.endLocation}`}>
                  {activeDay.startLocation} &rarr; {activeDay.endLocation}
                </span>
              </div>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Distance</span>
                <span className="text-xs font-extrabold text-slate-200">{activeDay.distanceKm} km</span>
              </div>
            </div>

            {/* Drive Duration */}
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Est. Driving</span>
                <span className="text-xs font-extrabold text-slate-200">{formatDriveTime(activeDay.driveTimeMinutes)}</span>
              </div>
            </div>
          </div>

          {/* Active timeline stream */}
          <div className="relative border-l-2 border-slate-800 ml-4.5 pl-7 flex flex-col gap-6.5 py-2">
            {activeDay.activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-6">
                <Clock className="w-9 h-9 text-slate-650" />
                <span className="text-xs font-semibold text-slate-500">No scheduled activities for today</span>
              </div>
            ) : (
              activeDay.activities.map((act) => {
                const Icon = ACTIVITY_ICONS[act.type];
                const colorClasses = ACTIVITY_COLORS[act.type];
                const isEditing = editingActId === act.id;

                return (
                  <div key={act.id} className="relative group animate-in fade-in slide-in-from-left-4 duration-200">
                    {/* Timeline Node Point */}
                    <div className={`absolute -left-11.5 top-0 w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transition duration-200 ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Timeline content bubble */}
                    <div className="p-3.5 bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-4 transition shadow-sm">
                      {isEditing ? (
                        <div className="flex items-center gap-2.5 flex-grow">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded outline-none text-slate-200 focus:border-teal-500 flex-grow"
                          />
                          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs">
                            <span className="text-slate-500 font-semibold">{currentCurrency.symbol}</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="bg-transparent border-none text-xs w-14 outline-none text-slate-200 font-bold"
                            />
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveEdit(act.id)}
                              className="p-1 hover:bg-teal-500/10 text-teal-400 rounded transition cursor-pointer"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => setEditingActId(null)}
                              className="p-1 hover:bg-red-500/10 text-red-400 rounded transition cursor-pointer"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-600" /> {act.time}
                            </span>
                            <h4 className="text-xs font-bold text-slate-250 capitalize">
                              {act.title}
                            </h4>
                          </div>

                          {/* Cost and management */}
                          <div className="flex items-center gap-3">
                            {act.cost > 0 ? (
                              <span className="text-xs font-extrabold text-teal-400">
                                {formatCost(act.cost)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase text-slate-600">Free</span>
                            )}
                            
                            {/* Actions panel */}
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition duration-150 gap-1.5">
                              <button
                                onClick={() => handleStartEdit(act)}
                                className="text-slate-500 hover:text-teal-400 p-1 hover:bg-slate-950 rounded transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(act.id)}
                                className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-950 rounded transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Form Trigger buttons */}
          {!showAddActivityForm ? (
            <button
              onClick={() => setShowAddActivityForm(true)}
              className="mt-2 w-full py-2.5 rounded-lg border border-dashed border-slate-800 bg-slate-950/20 text-slate-400 hover:text-teal-400 hover:border-teal-500/50 hover:bg-slate-900/10 flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Day {activeDayIdx + 1} Activity
            </button>
          ) : (
            /* Add Activity Form */
            <form onSubmit={handleAddActivity} className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex flex-col gap-3.5 animate-in slide-in-from-bottom-3 duration-250 mt-1">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-slate-300">Add Day {activeDayIdx + 1} Stop</span>
                <button
                  type="button"
                  onClick={() => setShowAddActivityForm(false)}
                  className="text-slate-500 hover:text-slate-300 font-extrabold text-sm cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Title</label>
                  <input
                    type="text"
                    value={newActTitle}
                    onChange={(e) => setNewActTitle(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-350 focus:border-teal-500"
                    placeholder="e.g. Visit Bixby Bridge"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Time</label>
                    <input
                      type="text"
                      value={newActTime}
                      onChange={(e) => setNewActTime(e.target.value)}
                      className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-350 focus:border-teal-500"
                      placeholder="e.g. 01:00 PM"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Cost</label>
                    <div className="flex items-center bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs">
                      <span className="text-slate-500 font-semibold">{currentCurrency.symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={newActCost}
                        onChange={(e) => setNewActCost(e.target.value)}
                        className="bg-transparent border-none text-xs w-full outline-none text-slate-350 font-bold ml-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Type</label>
                  <select
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as ActivityType)}
                    className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-350 focus:border-teal-500"
                  >
                    <option value="sightseeing">Sightseeing (Camera)</option>
                    <option value="driving">Driving Leg</option>
                    <option value="dining">Dining/Food (Utensils)</option>
                    <option value="lodging">Lodging (Bed)</option>
                    <option value="other">Other Event</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Add Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddActivityForm(false)}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-450 hover:text-slate-300 text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Delete day confirmation */}
          {trip.itinerary.length > 1 && (
            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveDay(activeDay.dayNumber)}
                className="text-[10px] text-red-500/70 hover:text-red-400 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Day {activeDay.dayNumber} Itinerary
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <Calendar className="w-12 h-12 text-slate-700 animate-pulse" />
          <span className="text-sm font-semibold text-slate-400">Initialize schedule to display travel timeline</span>
        </div>
      )}
    </div>
  );
}
