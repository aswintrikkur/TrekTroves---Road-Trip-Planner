'use client';

import { useState, useMemo } from 'react';
import { 
  Compass, Map, DollarSign, Calendar, Users, 
  Share2, FileText, CheckCircle, Sparkles, Navigation 
} from 'lucide-react';
import { PRESET_ROADTRIPS } from '@/data/presets';
import { RoadTrip, CurrencyCode, CURRENCIES } from '@/types/trip';

import PlannerWizard from '@/components/Planner/PlannerWizard';
import RoadTripMap from '@/components/Map/RoadTripMap';
import ItineraryTimeline from '@/components/Itinerary/ItineraryTimeline';
import ExpenseDashboard from '@/components/Dashboard/ExpenseDashboard';

export default function Home() {
  // Default to Route 66 preset
  const [activeTrip, setActiveTrip] = useState<RoadTrip>(PRESET_ROADTRIPS['route-66']);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<'schedule' | 'expenses'>('schedule');

  // Trigger state updates when components modify the trip
  const handleUpdateTrip = (updatedTrip: RoadTrip) => {
    setActiveTrip(updatedTrip);
  };

  // Switch active currency
  const handleChangeCurrency = (currency: CurrencyCode) => {
    setActiveCurrency(currency);
  };

  // Load a preset road trip
  const handleLoadPreset = (presetId: string) => {
    if (PRESET_ROADTRIPS[presetId]) {
      setActiveTrip(PRESET_ROADTRIPS[presetId]);
    }
  };

  const currentCurrency = CURRENCIES[activeCurrency];

  // Calculated overall trip summaries
  const totalsSummary = useMemo(() => {
    // Dynamic Fuel base costs formula: (Distance / 100) * efficiency * fuelPrice
    const fuelLiters = (activeTrip.totalDistanceKm * activeTrip.vehicle.efficiency) / 100;
    const baseFuelCostUsd = fuelLiters * activeTrip.vehicle.fuelCostPerUnit;
    
    // Toll base costs formula
    const baseTollCostUsd = activeTrip.vehicle.useTollPass ? activeTrip.totalTollCost : 0;

    let manualTotal = 0;
    activeTrip.expenses.forEach(e => {
      manualTotal += e.amount;
    });

    let activityTotal = 0;
    activeTrip.itinerary.forEach(day => {
      day.activities.forEach(act => {
        // Exclude driving type as it is already covered by fuel formula
        if (act.type === 'driving') return;

        // Prevent double counting if it's already generated in manual expenses list
        const isDouble = activeTrip.expenses.some(e => e.description.includes(act.title) && Math.abs(e.amount - act.cost) < 0.01);
        if (!isDouble) {
          activityTotal += act.cost;
        }
      });
    });

    const grandTotalUsd = baseFuelCostUsd + baseTollCostUsd + manualTotal + activityTotal;
    const grandTotalConverted = grandTotalUsd * currentCurrency.rate;

    return {
      totalCost: grandTotalConverted,
      distance: activeTrip.totalDistanceKm,
      days: activeTrip.itinerary.length,
      travelersCount: activeTrip.travelers.length
    };
  }, [activeTrip, activeCurrency]);

  // Export trip plan client-side mock action
  const handleExportPDF = () => {
    alert(`Successfully generated TrekTroves Driving Guide for "${activeTrip.name}"!\n\nOverview:\n- Span: ${totalsSummary.days} Days\n- Distance: ${totalsSummary.distance} km\n- Cost: ${currentCurrency.symbol}${totalsSummary.totalCost.toFixed(2)} (${activeCurrency})\n\nSafe travels! PDF has been downloaded successfully.`);
  };

  return (
    <main className="min-h-screen w-full py-6 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* 1. PRIMARY APP BRAND HEADER */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Compass className="w-6 h-6 text-slate-900 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              TrekTroves <span className="text-xs bg-slate-900 border border-slate-800 text-teal-400 font-extrabold px-2.5 py-0.5 rounded-full select-none">v1.0 (Beta)</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400">Integrated Roadtrip Planner & Expense Splitter</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportPDF}
            className="flex-grow md:flex-grow-0 px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-400" /> Export Travel Guide
          </button>
          
          <button
            onClick={() => alert(`Your trip "${activeTrip.name}" is now public! Share this unique link with your crew:\n\nhttps://trektroves.app/trip/${activeTrip.id}`)}
            className="flex-grow md:flex-grow-0 px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-indigo-400" /> Share Link
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC SUMMARY SUB-HEADER BAR */}
      <div className="glass-panel rounded-xl p-4.5 flex flex-wrap items-center justify-between gap-4.5">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-teal-500 animate-ping"></span>
          <h2 className="text-md font-extrabold text-slate-100 truncate max-w-[280px] sm:max-w-md">
            Active: {activeTrip.name}
          </h2>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 font-semibold overflow-x-auto select-none">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-teal-400" /> {totalsSummary.days} Days
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Navigation className="w-3.5 h-3.5 text-sky-400" /> {totalsSummary.distance} km
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> {totalsSummary.travelersCount} Squad
          </span>
          <span className="flex items-center gap-1.5 text-white font-extrabold whitespace-nowrap bg-teal-950/20 border border-teal-850 px-2.5 py-1 rounded-md">
            {currentCurrency.symbol}{totalsSummary.totalCost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. CORE PANEL GRID (PLANNER VS DISPLAY) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Configurator Wizard (takes 1/3) */}
        <div className="lg:col-span-1">
          <PlannerWizard
            trip={activeTrip}
            activeCurrency={activeCurrency}
            onUpdateTrip={handleUpdateTrip}
            onChangeCurrency={handleChangeCurrency}
            onLoadPreset={handleLoadPreset}
          />
        </div>

        {/* Right Side: Maps, Schedule, and Cost splits (takes 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          
          {/* A. Integrated Interactive Map Panel */}
          <div className="glass-panel rounded-xl overflow-hidden p-1 bg-slate-950/20">
            <div className="p-3 border-b border-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-teal-400" /> Live Interactive Route
              </span>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-900">
                Leaflet.js Engine Active
              </span>
            </div>
            
            {/* Map Frame container */}
            <div className="w-full h-[400px] rounded-lg overflow-hidden relative border border-slate-900">
              <RoadTripMap destinations={activeTrip.destinations} />
            </div>
          </div>

          {/* B. Details Display Tabs (Schedule vs Costs) */}
          <div className="flex flex-col gap-4">
            
            {/* Tab switch buttons */}
            <div className="flex items-center gap-3 bg-slate-950/60 p-1.5 rounded-xl border border-slate-850/80 select-none">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-grow py-2.5 px-4 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Calendar className="w-4 h-4" /> Travel Schedule
              </button>
              
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-grow py-2.5 px-4 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'expenses'
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Cost Splitting
              </button>
            </div>

            {/* Active Display Panel Content */}
            <div className="w-full">
              {activeTab === 'schedule' ? (
                <ItineraryTimeline
                  trip={activeTrip}
                  activeCurrency={activeCurrency}
                  onUpdateTrip={handleUpdateTrip}
                />
              ) : (
                <ExpenseDashboard
                  trip={activeTrip}
                  activeCurrency={activeCurrency}
                  onUpdateTrip={handleUpdateTrip}
                />
              )}
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
