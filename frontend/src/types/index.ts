export interface PartyPackage {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  maxKids: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'BLOCKED';

export interface AdminReservation {
  id: string;
  packageId: string;
  packageName: string;
  parentName: string;
  childName: string;
  childAge: number;
  phone: string;
  email: string;
  startTime: string;
  endTime: string;
  price: number;
  notes?: string;
  internalNotes?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface BlockSlotPayload {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  reason: string;
}