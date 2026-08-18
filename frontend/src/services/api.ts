import type { PartyPackage } from '../types';

const PALETTE = ['#00BBF9', '#FF477E', '#9B5DE5', '#00D9B5'];

export function toPartyPackage(pkg: Package, index: number): PartyPackage {
  return {
    id: pkg.id,
    name: pkg.title,
    price: pkg.price,
    durationMinutes: pkg.duration_minutes,
    description: pkg.description,
    maxKids: 15,          // backend doesn't return this yet — see note below
    features: [],         // backend doesn't return this yet — see note below
    popular: index === 0,
    color: PALETTE[index % PALETTE.length],
  };
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export interface Package {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  price: number;
}

export interface TimeSlot {
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
}

export interface CreateReservationPayload {
  package_id: string;
  parent_name: string;
  child_name: string;
  child_age: number;
  phone_number: string;
  email: string;
  notes?: string;
  start_time: string; // RFC3339 / ISO format
  end_time: string;   // RFC3339 / ISO format
}

export const api = {
  // Fetch available party packages
  getPackages: async (): Promise<Package[]> => {
    const res = await fetch(`${API_BASE_URL}/packages`);
    if (!res.ok) throw new Error('Greška pri učitavanju paketa.');
    return res.json();
  },

  // Fetch booked slots for a given date (YYYY-MM-DD)
  getAvailability: async (date: string): Promise<TimeSlot[]> => {
    const res = await fetch(`${API_BASE_URL}/availability?date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Greška pri proveri dostupnosti.');
    return res.json();
  },

  // Submit a new reservation
  createReservation: async (payload: CreateReservationPayload) => {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log('Reservation response:', data);

    if (!res.ok) {
      throw new Error(data.error || 'Došlo je do greške pri kreiranju rezervacije.');
    }

    return data;
  },
};