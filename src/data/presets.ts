import { RoadTrip } from '../types/trip';

export const PRESET_ROADTRIPS: Record<string, RoadTrip> = {
  'route-66': {
    id: 'route-66',
    name: 'Historic Route 66 Adventure',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
    destinations: [
      { id: 'r66-1', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, isStart: true },
      { id: 'r66-2', name: 'St. Louis, MO', lat: 38.6270, lng: -90.1994 },
      { id: 'r66-3', name: 'Amarillo, TX', lat: 35.2220, lng: -101.8313 },
      { id: 'r66-4', name: 'Albuquerque, NM', lat: 35.0844, lng: -106.6504 },
      { id: 'r66-5', name: 'Grand Canyon, AZ', lat: 36.0544, lng: -112.1375 },
      { id: 'r66-6', name: 'Santa Monica, CA', lat: 34.0194, lng: -118.4912, isEnd: true }
    ],
    vehicle: {
      name: 'Ford Mustang Convertible',
      type: 'compact',
      efficiency: 9.5, // L/100km
      fuelType: 'petrol',
      fuelCostPerUnit: 1.15, // USD per Liter (~$4.35 per Gallon)
      useTollPass: true
    },
    travelers: [
      { id: 't1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't2', name: 'Sam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't3', name: 'Jordan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ],
    totalDistanceKm: 3660,
    totalTollCost: 75.00,
    expenses: [
      { id: 'e1', category: 'fuel', amount: 400.00, description: 'Fuel Refill: Chicago to St. Louis', paidById: 't1', splitWithIds: [], date: '2026-06-01' },
      { id: 'e2', category: 'tolls', amount: 35.00, description: 'Illinois & Missouri Tolls', paidById: 't2', splitWithIds: [], date: '2026-06-02' },
      { id: 'e3', category: 'lodging', amount: 180.00, description: 'Classic Route 66 Motel St. Louis', paidById: 't3', splitWithIds: [], date: '2026-06-02' },
      { id: 'e4', category: 'food', amount: 95.00, description: 'Dinner at Cozy Dog Drive-In', paidById: 't1', splitWithIds: [], date: '2026-06-03' },
      { id: 'e5', category: 'activities', amount: 120.00, description: 'Cadillac Ranch Souvenirs & Spray Paint', paidById: 't2', splitWithIds: [], date: '2026-06-04' },
      { id: 'e6', category: 'lodging', amount: 220.00, description: 'Retro Hotel Albuquerque', paidById: 't1', splitWithIds: [], date: '2026-06-05' },
      { id: 'e7', category: 'activities', amount: 150.00, description: 'Grand Canyon National Park Pass', paidById: 't3', splitWithIds: [], date: '2026-06-06' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: '2026-06-01',
        startLocation: 'Chicago, IL',
        endLocation: 'St. Louis, MO',
        distanceKm: 480,
        driveTimeMinutes: 290,
        activities: [
          { id: 'a1', time: '08:00 AM', title: 'Route 66 Begin Sign Photo-Op', type: 'sightseeing', cost: 0, notes: 'Right in downtown Chicago, Adams Street.' },
          { id: 'a2', time: '12:30 PM', title: 'Lunch at Dell Rhea\'s Chicken Basket', type: 'dining', cost: 45, notes: 'Famous Route 66 landmark restaurant.' },
          { id: 'a3', time: '05:30 PM', title: 'Arrive in St. Louis & Check-in', type: 'lodging', cost: 180, notes: 'Check into the retro themed Route 66 motel.' }
        ]
      },
      {
        dayNumber: 2,
        date: '2026-06-02',
        startLocation: 'St. Louis, MO',
        endLocation: 'Amarillo, TX',
        distanceKm: 1200,
        driveTimeMinutes: 710,
        activities: [
          { id: 'a4', time: '07:30 AM', title: 'Gateway Arch Visit', type: 'sightseeing', cost: 30, notes: 'Ride to the top of the iconic arch!' },
          { id: 'a5', time: '01:00 PM', title: 'Lunch at Elwood\'s Diner', type: 'dining', cost: 35 },
          { id: 'a6', time: '08:00 PM', title: 'Late check-in Amarillo', type: 'lodging', cost: 120 }
        ]
      },
      {
        dayNumber: 3,
        date: '2026-06-03',
        startLocation: 'Amarillo, TX',
        endLocation: 'Albuquerque, NM',
        distanceKm: 460,
        driveTimeMinutes: 260,
        activities: [
          { id: 'a7', time: '09:00 AM', title: 'Cadillac Ranch Spraying', type: 'sightseeing', cost: 25, notes: 'Spray paint some classic half-buried Cadillacs.' },
          { id: 'a8', time: '01:00 PM', title: 'Lunch at Midpoint Cafe', type: 'dining', cost: 40, notes: 'Exactly halfway point of Route 66!' },
          { id: 'a9', time: '06:00 PM', title: 'Albuquerque Old Town Walk', type: 'sightseeing', cost: 0 }
        ]
      },
      {
        dayNumber: 4,
        date: '2026-06-04',
        startLocation: 'Albuquerque, NM',
        endLocation: 'Grand Canyon, AZ',
        distanceKm: 660,
        driveTimeMinutes: 380,
        activities: [
          { id: 'a10', time: '08:30 AM', title: 'Drive through Red Rock Country', type: 'driving', cost: 0 },
          { id: 'a11', time: '02:00 PM', title: 'Wigwam Motel Photo Stop', type: 'sightseeing', cost: 0, notes: 'Classic concrete teepees in Holbrook.' },
          { id: 'a12', time: '05:30 PM', title: 'Grand Canyon Sunset View', type: 'sightseeing', cost: 35, notes: 'Mather Point offers incredible sunset views.' }
        ]
      },
      {
        dayNumber: 5,
        date: '2026-06-05',
        startLocation: 'Grand Canyon, AZ',
        endLocation: 'Santa Monica, CA',
        distanceKm: 860,
        driveTimeMinutes: 520,
        activities: [
          { id: 'a13', time: '08:00 AM', title: 'Sunrise Hike at Grand Canyon', type: 'sightseeing', cost: 0 },
          { id: 'a14', time: '02:30 PM', title: 'Lunch in Seligman - Birthplace of R66', type: 'dining', cost: 50, notes: 'Check out Delgadillo\'s Snow Cap!' },
          { id: 'a15', time: '07:30 PM', title: 'End of Trail Celebration at Santa Monica Pier', type: 'sightseeing', cost: 60, notes: 'End of the Trail sign photo and dinner!' }
        ]
      }
    ]
  },
  'leh-ladakh': {
    id: 'leh-ladakh',
    name: 'Leh-Ladakh Mountain Pass Expedition',
    startDate: '2026-07-10',
    endDate: '2026-07-17',
    destinations: [
      { id: 'll-1', name: 'Manali, HP', lat: 32.2396, lng: 77.1887, isStart: true },
      { id: 'll-2', name: 'Keylong', lat: 32.5714, lng: 77.0302 },
      { id: 'll-3', name: 'Sarchu Camp', lat: 32.9056, lng: 77.5794 },
      { id: 'll-4', name: 'Pang Pass', lat: 33.1256, lng: 77.7844 },
      { id: 'll-5', name: 'Leh, Ladakh', lat: 34.1526, lng: 77.5771, isEnd: true }
    ],
    vehicle: {
      name: 'Toyota Fortuner 4x4',
      type: 'suv',
      efficiency: 11.2, // L/100km
      fuelType: 'diesel',
      fuelCostPerUnit: 1.08, // USD per Liter
      useTollPass: false
    },
    travelers: [
      { id: 't4', name: 'Rohan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't5', name: 'Priya', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't6', name: 'Kabir', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't7', name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ],
    totalDistanceKm: 472,
    totalTollCost: 12.00,
    expenses: [
      { id: 'll-e1', category: 'fuel', amount: 180.00, description: 'Fuel Jerrycans Stockpile', paidById: 't4', splitWithIds: [], date: '2026-07-10' },
      { id: 'll-e2', category: 'lodging', amount: 110.00, description: 'Keylong Guest House Stay', paidById: 't5', splitWithIds: [], date: '2026-07-11' },
      { id: 'll-e3', category: 'lodging', amount: 150.00, description: 'Sarchu Luxury Tents + Dinner', paidById: 't6', splitWithIds: [], date: '2026-07-12' },
      { id: 'll-e4', category: 'activities', amount: 80.00, description: 'Inner Line Permits & Wildlife Fees', paidById: 't7', splitWithIds: [], date: '2026-07-13' },
      { id: 'll-e5', category: 'food', amount: 45.00, description: 'Maggi and Tea at Baralacha La Pass', paidById: 't4', splitWithIds: [], date: '2026-07-12' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: '2026-07-10',
        startLocation: 'Manali, HP',
        endLocation: 'Keylong',
        distanceKm: 115,
        driveTimeMinutes: 240,
        activities: [
          { id: 'll-a1', time: '09:00 AM', title: 'Drive through Atal Tunnel', type: 'driving', cost: 0, notes: 'The world\'s longest highway tunnel above 10,000 feet.' },
          { id: 'll-a2', time: '01:00 PM', title: 'Lunch at Jispa Riverside Diner', type: 'dining', cost: 20 },
          { id: 'll-a3', time: '05:00 PM', title: 'Explore Keylong Town', type: 'sightseeing', cost: 0 }
        ]
      },
      {
        dayNumber: 2,
        date: '2026-07-11',
        startLocation: 'Keylong',
        endLocation: 'Sarchu Camp',
        distanceKm: 108,
        driveTimeMinutes: 300,
        activities: [
          { id: 'll-a4', time: '08:00 AM', title: 'Cross Baralacha La Pass (16,040 ft)', type: 'driving', cost: 0, notes: 'Breathtaking glacier views.' },
          { id: 'll-a5', time: '12:00 PM', title: 'Hot Soup at Bharatpur Tents', type: 'dining', cost: 15, notes: 'Maggi noodles standard stops!' },
          { id: 'll-a6', time: '04:00 PM', title: 'Acclimatization Rest at Sarchu Tents', type: 'lodging', cost: 150, notes: 'Stargazing at 14,000 ft altitude.' }
        ]
      },
      {
        dayNumber: 3,
        date: '2026-07-12',
        startLocation: 'Sarchu Camp',
        endLocation: 'Leh, Ladakh',
        distanceKm: 250,
        driveTimeMinutes: 480,
        activities: [
          { id: 'll-a7', time: '06:00 AM', title: 'Conquer Gata Loops', type: 'driving', cost: 0, notes: '21 hairpin bends winding up the mountain wall.' },
          { id: 'll-a8', time: '11:00 AM', title: 'Lachung La & Nakee La Passes', type: 'driving', cost: 0 },
          { id: 'll-a9', time: '02:00 PM', title: 'Lunch at Pang Military Transit Camp', type: 'dining', cost: 25 },
          { id: 'll-a10', time: '06:30 PM', title: 'Arrival in Leh Valley', type: 'lodging', cost: 80 }
        ]
      }
    ]
  },
  'pch': {
    id: 'pch',
    name: 'Pacific Coast Highway EV Cruise',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    destinations: [
      { id: 'pch-1', name: 'San Francisco, CA', lat: 37.7749, bg: -122.4194, latLng: [37.7749, -122.4194], isStart: true } as any,
      { id: 'pch-2', name: 'Monterey, CA', lat: 36.6002, lng: -121.8947 },
      { id: 'pch-3', name: 'Big Sur, CA', lat: 36.2704, lng: -121.8081 },
      { id: 'pch-4', name: 'Santa Barbara, CA', lat: 34.4208, lng: -119.6982 },
      { id: 'pch-5', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, isEnd: true }
    ],
    vehicle: {
      name: 'Tesla Model Y Long Range',
      type: 'ev',
      efficiency: 16.5, // kWh/100km
      fuelType: 'electricity',
      fuelCostPerUnit: 0.32, // USD per kWh Supercharger average
      useTollPass: true
    },
    travelers: [
      { id: 't8', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't9', name: 'Liam', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ],
    totalDistanceKm: 750,
    totalTollCost: 15.00,
    expenses: [
      { id: 'pch-e1', category: 'fuel', amount: 45.00, description: 'Supercharger Refill (Tesla Monterey)', paidById: 't8', splitWithIds: [], date: '2026-08-20' },
      { id: 'pch-e2', category: 'food', amount: 135.00, description: 'Cliffside Dinner at Nepenthe Big Sur', paidById: 't9', splitWithIds: [], date: '2026-08-21' },
      { id: 'pch-e3', category: 'lodging', amount: 320.00, description: 'Boutique Oceanside Lodge Big Sur', paidById: 't8', splitWithIds: [], date: '2026-08-21' },
      { id: 'pch-e4', category: 'activities', amount: 60.00, description: 'Monterey Bay Aquarium Entry Tickets', paidById: 't9', splitWithIds: [], date: '2026-08-20' },
      { id: 'pch-e5', category: 'fuel', amount: 30.00, description: 'Supercharger Refill (Santa Barbara)', paidById: 't9', splitWithIds: [], date: '2026-08-22' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: '2026-08-20',
        startLocation: 'San Francisco, CA',
        endLocation: 'Monterey, CA',
        distanceKm: 190,
        driveTimeMinutes: 140,
        activities: [
          { id: 'pch-a1', time: '09:00 AM', title: 'Drive across Golden Gate Bridge', type: 'driving', cost: 9, notes: 'Enjoy gorgeous morning bay views.' },
          { id: 'pch-a2', time: '01:30 PM', title: 'Seafood Lunch at Old Fisherman\'s Wharf', type: 'dining', cost: 55 },
          { id: 'pch-a3', time: '03:30 PM', title: 'Monterey Bay Aquarium Visit', type: 'sightseeing', cost: 60 }
        ]
      },
      {
        dayNumber: 2,
        date: '2026-08-21',
        startLocation: 'Monterey, CA',
        endLocation: 'Big Sur, CA',
        distanceKm: 50,
        driveTimeMinutes: 50,
        activities: [
          { id: 'pch-a4', time: '10:00 AM', title: 'Scenic Cruise on 17-Mile Drive', type: 'driving', cost: 12, notes: 'View the Lone Cypress.' },
          { id: 'pch-a5', time: '01:00 PM', title: 'Cross Bixby Creek Bridge', type: 'sightseeing', cost: 0, notes: 'The ultimate coastal roadtrip photo stop!' },
          { id: 'pch-a6', time: '06:00 PM', title: 'Sunset Dinner at Nepenthe', type: 'dining', cost: 135, notes: 'Stunning outdoor dining suspended high above the Pacific.' }
        ]
      },
      {
        dayNumber: 3,
        date: '2026-08-22',
        startLocation: 'Big Sur, CA',
        endLocation: 'Santa Barbara, CA',
        distanceKm: 380,
        driveTimeMinutes: 280,
        activities: [
          { id: 'pch-a7', time: '08:30 AM', title: 'McWay Falls Viewpoint Hike', type: 'sightseeing', cost: 10, notes: 'Stunning beach waterfall.' },
          { id: 'pch-a8', time: '01:00 PM', title: 'Hearst Castle Stop', type: 'sightseeing', cost: 40 },
          { id: 'pch-a9', time: '06:30 PM', title: 'Stroll Santa Barbara Funk Zone', type: 'sightseeing', cost: 0 }
        ]
      }
    ]
  },
  'amalfi-coast': {
    id: 'amalfi-coast',
    name: 'Amalfi Coast Vespa Cruise',
    startDate: '2026-09-05',
    endDate: '2026-09-09',
    destinations: [
      { id: 'ac-1', name: 'Sorrento', lat: 40.6263, lng: 14.3758, isStart: true },
      { id: 'ac-2', name: 'Positano', lat: 40.6281, lng: 14.4850 },
      { id: 'ac-3', name: 'Amalfi Town', lat: 40.6331, lng: 14.6028 },
      { id: 'ac-4', name: 'Ravello', lat: 40.6491, lng: 14.6117 },
      { id: 'ac-5', name: 'Salerno', lat: 40.6785, lng: 14.7594, isEnd: true }
    ],
    vehicle: {
      name: 'Vespa 125cc Scooter',
      type: 'motorcycle',
      efficiency: 2.8, // L/100km
      fuelType: 'petrol',
      fuelCostPerUnit: 1.85, // USD equivalent per Liter in Italy
      useTollPass: false
    },
    travelers: [
      { id: 't10', name: 'Marco', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 't11', name: 'Sofia', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ],
    totalDistanceKm: 65,
    totalTollCost: 0,
    expenses: [
      { id: 'ac-e1', category: 'fuel', amount: 15.00, description: 'Fuel refill (Sorrento Garage)', paidById: 't10', splitWithIds: [], date: '2026-09-05' },
      { id: 'ac-e2', category: 'food', amount: 80.00, description: 'Limoncello & Italian Pasta Positano', paidById: 't11', splitWithIds: [], date: '2026-09-06' },
      { id: 'ac-e3', category: 'lodging', amount: 240.00, description: 'Cliffside Bed & Breakfast Positano', paidById: 't10', splitWithIds: [], date: '2026-09-06' },
      { id: 'ac-e4', category: 'activities', amount: 90.00, description: 'Private Boat Tour around Capri Cave', paidById: 't11', splitWithIds: [], date: '2026-09-07' }
    ],
    itinerary: [
      {
        dayNumber: 1,
        date: '2026-09-05',
        startLocation: 'Sorrento',
        endLocation: 'Positano',
        distanceKm: 18,
        driveTimeMinutes: 45,
        activities: [
          { id: 'ac-a1', time: '10:00 AM', title: 'Collect Rental Vespa', type: 'other', cost: 65, notes: 'Vespa Sprint 125cc selected.' },
          { id: 'ac-a2', time: '01:00 PM', title: 'Lunch at Positano Beachfront Cafes', type: 'dining', cost: 45 },
          { id: 'ac-a3', time: '05:30 PM', title: 'Wander vertical alleys of Positano', type: 'sightseeing', cost: 0 }
        ]
      },
      {
        dayNumber: 2,
        date: '2026-09-06',
        startLocation: 'Positano',
        endLocation: 'Amalfi Town',
        distanceKm: 16,
        driveTimeMinutes: 40,
        activities: [
          { id: 'ac-a4', time: '09:30 AM', title: 'Drive through Furore Fjord Bridge', type: 'driving', cost: 0, notes: 'The famous deep gorge cutting into cliffs.' },
          { id: 'ac-a5', time: '01:00 PM', title: 'Lunch at Amalfi Piazza Duomo', type: 'dining', cost: 35 },
          { id: 'ac-a6', time: '04:00 PM', title: 'Visit Ravello Villa Rufolo Gardens', type: 'sightseeing', cost: 16 }
        ]
      }
    ]
  }
};
