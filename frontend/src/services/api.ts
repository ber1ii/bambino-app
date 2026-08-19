import type {
  PartyPackage,
  AdminReservation,
  BlockSlotPayload,
  ReservationStatus,
} from "../types";

const PALETTE = ["#00BBF9", "#FF477E", "#9B5DE5", "#00D9B5"];

export interface Package {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  price: number;
}

export interface TimeSlot {
  start_time: string; // ISO 8601 string
  end_time: string; // ISO 8601 string
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
  end_time: string; // RFC3339 / ISO format
}

export interface PaginatedReservationsResponse {
  data: any[];
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

export function toPartyPackage(pkg: Package, index: number): PartyPackage {
  return {
    id: pkg.id,
    name: pkg.title,
    price: pkg.price,
    durationMinutes: pkg.duration_minutes,
    description: pkg.description,
    maxKids: 15, // backend doesn't return this yet
    features: [], // backend doesn't return this yet
    popular: index === 0,
    color: PALETTE[index % PALETTE.length],
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081/api";

export const api = {
  // --- Public Endpoints ---
  getPackages: async (): Promise<Package[]> => {
    const res = await fetch(`${API_BASE_URL}/packages`);
    if (!res.ok) throw new Error("Greška pri učitavanju paketa.");
    return res.json();
  },

  getAvailability: async (date: string): Promise<TimeSlot[]> => {
    const res = await fetch(
      `${API_BASE_URL}/availability?date=${encodeURIComponent(date)}`,
    );
    if (!res.ok) throw new Error("Greška pri proveri dostupnosti.");
    return res.json();
  },

  createReservation: async (payload: CreateReservationPayload) => {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Reservation response:", data);

    if (!res.ok) {
      throw new Error(
        data.error || "Došlo je do greške pri kreiranju rezervacije.",
      );
    }

    return data;
  },

  // --- Admin Endpoints ---
  loginAdmin: async (pin: string): Promise<{ token: string }> => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Neispravan PIN kod.");
    }
    return data; // Returns { token: "..." }
  },

  getAdminReservations: async (
    token: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedReservationsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/reservations?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Greška pri preuzimanju rezervacija.");
    }

    return response.json();
  },

  updateReservationStatus: async (
    id: string,
    status: ReservationStatus,
    notifyClient: boolean,
    token: string,
  ): Promise<AdminReservation> => {
    const res = await fetch(`${API_BASE_URL}/admin/reservations/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, send_email: notifyClient }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Ažuriranje statusa nije uspelo.");
    }
    return data;
  },

  blockTimeSlot: async (payload: BlockSlotPayload, token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/block-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Blokiranje termina nije uspelo.");
    }
    return data;
  },
};
