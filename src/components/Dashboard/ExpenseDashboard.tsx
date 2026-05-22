'use client';

import { useState, useMemo } from 'react';
import { 
  DollarSign, Receipt, Plus, Trash2, Split, ArrowRight,
  TrendingUp, Fuel, Milestone, Home, Coffee, Compass, HelpCircle 
} from 'lucide-react';
import { 
  RoadTrip, Expense, ExpenseCategory, Traveler, 
  CurrencyCode, CURRENCIES 
} from '@/types/trip';

interface ExpenseDashboardProps {
  trip: RoadTrip;
  activeCurrency: CurrencyCode;
  onUpdateTrip: (updatedTrip: RoadTrip) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fuel: '#0ea5e9', // Blue
  tolls: '#6366f1', // Indigo
  lodging: '#a855f7', // Purple
  food: '#f59e0b', // Amber
  activities: '#10b981', // Emerald
  misc: '#64748b' // Slate
};

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  fuel: Fuel,
  tolls: Milestone,
  lodging: Home,
  food: Coffee,
  activities: Compass,
  misc: HelpCircle
};

export default function ExpenseDashboard({
  trip,
  activeCurrency,
  onUpdateTrip
}: ExpenseDashboardProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expPaidBy, setExpPaidBy] = useState(trip.travelers[0]?.id || '');

  const currentCurrency = CURRENCIES[activeCurrency];

  // Dynamically calculate fuel and toll base costs based on vehicle and destinations
  const calculatedCosts = useMemo(() => {
    // Fuel Formula: (Distance / 100) * Efficiency * CostPerUnit
    const fuelLiters = (trip.totalDistanceKm * trip.vehicle.efficiency) / 100;
    const baseFuelCostUsd = fuelLiters * trip.vehicle.fuelCostPerUnit;
    
    // Toll Formula: Preset base toll + extra waypoints, set to 0 if tollpass disabled
    const baseTollCostUsd = trip.vehicle.useTollPass ? trip.totalTollCost : 0;

    return {
      fuel: baseFuelCostUsd,
      tolls: baseTollCostUsd
    };
  }, [trip.totalDistanceKm, trip.vehicle, trip.totalTollCost]);

  // Aggregate all expenses: Calculated + Manual + Itinerary activities
  const aggregatedExpenses = useMemo(() => {
    const categories: Record<ExpenseCategory, number> = {
      fuel: calculatedCosts.fuel,
      tolls: calculatedCosts.tolls,
      lodging: 0,
      food: 0,
      activities: 0,
      misc: 0
    };

    // Add manual expenses
    trip.expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    // Add itinerary activity expenses if they aren't already covered in manual list
    trip.itinerary.forEach(day => {
      day.activities.forEach(act => {
        // Map itinerary types to expense categories
        let cat: ExpenseCategory = 'misc';
        if (act.type === 'lodging') cat = 'lodging';
        else if (act.type === 'dining') cat = 'food';
        else if (act.type === 'sightseeing') cat = 'activities';
        else if (act.type === 'driving') return; // Covered by auto fuel formula

        // Avoid double counting if it's already generated as a manual expense
        // Manual expenses generated from itinerary will have 'exp-itin-' prefix
        const isAlreadyManual = trip.expenses.some(e => e.description.includes(act.title) && Math.abs(e.amount - act.cost) < 0.01);
        if (!isAlreadyManual) {
          categories[cat] += act.cost;
        }
      });
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    return {
      byCategory: categories,
      total
    };
  }, [trip.expenses, trip.itinerary, calculatedCosts]);

  // Split-Cost Calculations
  const splits = useMemo(() => {
    const numTravelers = trip.travelers.length || 1;
    const sharePerPerson = aggregatedExpenses.total / numTravelers;

    // Calculate how much each person paid
    const paidByTraveler: Record<string, number> = {};
    trip.travelers.forEach(t => {
      paidByTraveler[t.id] = 0;
    });

    // Share of auto-calculated costs (Fuel & Tolls are split equally automatically)
    const autoCostPerPerson = (calculatedCosts.fuel + calculatedCosts.tolls) / numTravelers;
    
    // Distribute auto cost payment equally as if they all paid their exact share of it
    trip.travelers.forEach(t => {
      paidByTraveler[t.id] += autoCostPerPerson;
    });

    // Add manual expenses paid
    trip.expenses.forEach(exp => {
      if (paidByTraveler[exp.paidById] !== undefined) {
        paidByTraveler[exp.paidById] += exp.amount;
      }
    });

    // Balances: Paid - SharePerPerson
    const balances = trip.travelers.map(t => {
      const paid = paidByTraveler[t.id] || 0;
      const balance = paid - sharePerPerson;
      return {
        traveler: t,
        paid,
        balance
      };
    });

    // Settlement Optimization Algorithm (Who owes Who)
    // Create copies of balances for mutability
    const debtPeople = balances
      .filter(b => b.balance < -0.01)
      .map(b => ({ ...b, balance: Math.abs(b.balance) }));
    
    const creditPeople = balances
      .filter(b => b.balance > 0.01)
      .map(b => ({ ...b, balance: b.balance }));

    const transactions: Array<{ from: Traveler; to: Traveler; amount: number }> = [];

    let debtIdx = 0;
    let creditIdx = 0;

    while (debtIdx < debtPeople.length && creditIdx < creditPeople.length) {
      const debtor = debtPeople[debtIdx];
      const creditor = creditPeople[creditIdx];

      const amountToTransfer = Math.min(debtor.balance, creditor.balance);

      transactions.push({
        from: debtor.traveler,
        to: creditor.traveler,
        amount: amountToTransfer
      });

      debtor.balance -= amountToTransfer;
      creditor.balance -= amountToTransfer;

      if (debtor.balance < 0.01) debtIdx++;
      if (creditor.balance < 0.01) creditIdx++;
    }

    return {
      sharePerPerson,
      balances,
      transactions
    };
  }, [trip.travelers, aggregatedExpenses, calculatedCosts]);

  // Conversion helpers
  const convertAmount = (usd: number) => usd * currentCurrency.rate;
  
  const formatVal = (usd: number) => {
    return `${currentCurrency.symbol}${convertAmount(usd).toFixed(2)}`;
  };

  // Add custom manual expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim() || !expAmount) return;

    // Convert input amount to USD
    const inputAmount = parseFloat(expAmount) || 0;
    const usdAmount = inputAmount / currentCurrency.rate;

    const newExpense: Expense = {
      id: `exp-manual-${Date.now()}`,
      category: expCategory,
      amount: usdAmount,
      description: expDescription.trim(),
      paidById: expPaidBy || trip.travelers[0]?.id,
      splitWithIds: [], // Empty means split among all
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateTrip({
      ...trip,
      expenses: [...trip.expenses, newExpense]
    });

    setExpAmount('');
    setExpDescription('');
    setShowAddExpense(false);
  };

  // Remove manual expense
  const handleRemoveExpense = (id: string) => {
    onUpdateTrip({
      ...trip,
      expenses: trip.expenses.filter(e => e.id !== id)
    });
  };

  // Custom SVG Donut Chart divisions calculations
  const donutSegments = useMemo(() => {
    const total = aggregatedExpenses.total;
    if (total <= 0) return [];

    let accumulatedPercentage = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return Object.entries(aggregatedExpenses.byCategory)
      .filter(([_, val]) => val > 0)
      .map(([cat, val]) => {
        const percentage = val / total;
        const strokeDasharray = `${percentage * circumference} ${circumference}`;
        const strokeDashoffset = `${accumulatedPercentage * circumference}`;
        
        accumulatedPercentage -= percentage; // Move counterclockwise

        return {
          category: cat as ExpenseCategory,
          value: val,
          percentage: percentage * 100,
          strokeDasharray,
          strokeDashoffset
        };
      });
  }, [aggregatedExpenses]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. TOP GENERAL STATS BANNER */}
      <div className="glass-panel rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total cost */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-teal-400" /> Projected Budget
          </span>
          <span className="text-2xl font-black text-white">{formatVal(aggregatedExpenses.total)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Calculated + Manual Items</span>
        </div>

        {/* Per person */}
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-850 pt-3 sm:pt-0 sm:pl-5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Split className="w-3.5 h-3.5 text-indigo-400" /> Share Per Person
          </span>
          <span className="text-xl font-extrabold text-slate-100">{formatVal(splits.sharePerPerson)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Split among {trip.travelers.length} travelers</span>
        </div>

        {/* Distance summary */}
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-850 pt-3 sm:pt-0 sm:pl-5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Fleet Distance
          </span>
          <span className="text-xl font-extrabold text-slate-100">{trip.totalDistanceKm} km</span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {trip.vehicle.name} ({trip.vehicle.type})
          </span>
        </div>
      </div>

      {/* 2. DYNAMIC GAUGES AND BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost divisions visual donut chart */}
        <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest border-b border-slate-850 pb-2">
            Expense Allocation
          </h3>

          {aggregatedExpenses.total > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6.5 py-4">
              {/* Donut Chart SVG */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="stroke-slate-850"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={seg.category}
                      cx="60"
                      cy="60"
                      r="50"
                      stroke={CATEGORY_COLORS[seg.category]}
                      strokeWidth="11"
                      fill="transparent"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-in-out cursor-pointer hover:stroke-[13px]"
                      style={{ transformOrigin: 'center' }}
                    />
                  ))}
                </svg>
                {/* Center price */}
                <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                  <span className="text-sm font-black text-slate-200 truncate max-w-[90px]">
                    {currentCurrency.symbol}{Math.round(convertAmount(aggregatedExpenses.total))}
                  </span>
                </div>
              </div>

              {/* Legends Checklist */}
              <div className="flex flex-col gap-2 w-full">
                {Object.entries(aggregatedExpenses.byCategory)
                  .filter(([_, val]) => val > 0)
                  .map(([cat, val]) => {
                    const percentage = (val / aggregatedExpenses.total) * 100;
                    const Icon = CATEGORY_ICONS[cat as ExpenseCategory];
                    const color = CATEGORY_COLORS[cat as ExpenseCategory];

                    return (
                      <div key={cat} className="flex items-center justify-between text-xs p-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: color }}
                          >
                            <Icon className="w-2.5 h-2.5 text-slate-900" />
                          </span>
                          <span className="capitalize font-semibold text-slate-300">{cat}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500">{percentage.toFixed(0)}%</span>
                          <span className="font-extrabold text-slate-200">{formatVal(val)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Receipt className="w-10 h-10 text-slate-700" />
              <span className="text-xs text-slate-550">No expenses recorded for allocation</span>
            </div>
          )}
        </div>

        {/* Traveler splits balances and settlement checklist */}
        <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest border-b border-slate-850 pb-2">
            Group Share & Settlements
          </h3>

          <div className="flex flex-col gap-3.5">
            {/* Balances list */}
            {splits.balances.map(({ traveler, paid, balance }) => {
              const isCreditor = balance > 0.01;
              const isSettled = Math.abs(balance) <= 0.01;

              return (
                <div key={traveler.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/60">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={traveler.avatar} 
                      alt={traveler.name} 
                      className="w-7 h-7 rounded-full object-cover border border-slate-800" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">{traveler.name}</span>
                      <span className="text-[9px] text-slate-500 font-semibold">Paid: {formatVal(paid)}</span>
                    </div>
                  </div>

                  {/* Balance badge */}
                  <div className="flex flex-col items-end">
                    {isSettled ? (
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                        Settled
                      </span>
                    ) : isCreditor ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-teal-400">+{formatVal(balance)}</span>
                        <span className="text-[8px] text-slate-500 font-semibold uppercase">Get back</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-red-400">-{formatVal(Math.abs(balance))}</span>
                        <span className="text-[8px] text-slate-500 font-semibold uppercase">Owes group</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Settlements checklist optimizer */}
            {splits.transactions.length > 0 && (
              <div className="mt-2.5 bg-indigo-950/15 border border-indigo-900/35 rounded-xl p-4">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-3">
                  Settlements Checklist (Splitwise Mode)
                </span>
                <div className="flex flex-col gap-2.5">
                  {splits.transactions.map((trans, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-850/30">
                      <div className="flex items-center gap-2">
                        <img src={trans.from.avatar} className="w-5.5 h-5.5 rounded-full object-cover" />
                        <span className="font-bold text-slate-300">{trans.from.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center flex-grow text-slate-500 px-2">
                        <span className="text-[10px] font-black text-indigo-400">{formatVal(trans.amount)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{trans.to.name}</span>
                        <img src={trans.to.avatar} className="w-5.5 h-5.5 rounded-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DETAILED MANUAL EXPENSES LOG */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest">
            Manual & Custom Expenses
          </h3>
          
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-teal-500 hover:text-slate-950 font-bold text-xs text-slate-300 flex items-center gap-1 border border-slate-750 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Expense
          </button>
        </div>

        {/* Inline Add Expense Form */}
        {showAddExpense && (
          <form onSubmit={handleAddExpenseSubmit} className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex flex-col gap-3 animate-in slide-in-from-top-3 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <input
                  type="text"
                  required
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-200 focus:border-teal-500"
                  placeholder="e.g. Italian Pizza Dinner"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
                <div className="flex items-center bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs">
                  <span className="text-slate-500 font-semibold">{currentCurrency.symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="bg-transparent border-none text-xs w-full outline-none text-slate-200 font-bold ml-1"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Paid By</label>
                  <select
                    value={expPaidBy}
                    onChange={(e) => setExpPaidBy(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-300 focus:border-teal-500"
                  >
                    {trip.travelers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded outline-none text-slate-350 focus:border-teal-500"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="lodging">Lodging/Hotel</option>
                    <option value="activities">Activities & Entry</option>
                    <option value="fuel">Fuel Addition</option>
                    <option value="tolls">Toll Addition</option>
                    <option value="misc">Miscellaneous</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Save Log
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Expenses List */}
        <div className="flex flex-col gap-2">
          {/* Autocalculated Fuel Expense */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-850/60">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <Fuel className="w-3.5 h-3.5" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-300">Vehicle Fuel Costs (Auto Calculated)</span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase">System Calculated | Split equally</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-250">{formatVal(calculatedCosts.fuel)}</span>
              <span className="text-[10px] text-slate-550 select-none mr-1.5 font-bold">Lock</span>
            </div>
          </div>

          {/* Autocalculated Toll Expense */}
          {trip.vehicle.useTollPass && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-850/60">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Milestone className="w-3.5 h-3.5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-300">Calculated Highway Tolls</span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">System Calculated | Split equally</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-slate-250">{formatVal(calculatedCosts.tolls)}</span>
                <span className="text-[10px] text-slate-550 select-none mr-1.5 font-bold">Lock</span>
              </div>
            </div>
          )}

          {/* Manual logs list */}
          {trip.expenses.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-slate-550 text-xs font-semibold">
              No manual logged expenses. Fuel and tolls calculations are active above.
            </div>
          ) : (
            trip.expenses.map((exp) => {
              const payer = trip.travelers.find(t => t.id === exp.paidById);
              const color = CATEGORY_COLORS[exp.category];
              const Icon = CATEGORY_ICONS[exp.category];

              return (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-850/60 hover:border-slate-800 transition">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-7 h-7 rounded-lg text-slate-900 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-250">{exp.description}</span>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        Paid by {payer?.name || 'Someone'} | {exp.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-200">{formatVal(exp.amount)}</span>
                    <button
                      onClick={() => handleRemoveExpense(exp.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-950 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
