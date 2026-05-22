export type VehicleType = 'compact' | 'suv' | 'motorcycle' | 'ev';
export type FuelType = 'petrol' | 'diesel' | 'electricity';
export type ExpenseCategory = 'fuel' | 'tolls' | 'lodging' | 'food' | 'activities' | 'misc';
export type ActivityType = 'driving' | 'dining' | 'lodging' | 'sightseeing' | 'other';

export interface Vehicle {
  name: string;
  type: VehicleType;
  efficiency: number; // L/100km or km/kWh
  fuelType: FuelType;
  fuelCostPerUnit: number; // USD per Liter or per kWh
  useTollPass: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number; // Stored in USD
  description: string;
  paidById: string; // Traveler ID
  splitWithIds: string[]; // Traveler IDs. Empty array means split among all travelers
  date: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  type: ActivityType;
  cost: number; // Stored in USD
  notes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  driveTimeMinutes: number;
  activities: ItineraryActivity[];
}

export interface RoadTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destinations: Waypoint[];
  vehicle: Vehicle;
  travelers: Traveler[];
  expenses: Expense[];
  itinerary: ItineraryDay[];
  totalDistanceKm: number;
  totalTollCost: number; // Stored in USD
}

export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP' | 'CAD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // 1 USD = X Currency
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'US Dollar (USD)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro (EUR)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'Indian Rupee (INR)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, label: 'British Pound (GBP)' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, label: 'Canadian Dollar (CAD)' },
};
