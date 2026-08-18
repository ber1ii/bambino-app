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

export interface BookingDetails {
  packageId: string;
  date: string;
  timeSlot: string;
  childName: string;
  childAge: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  additionalKids: number;
  notes?: string;
}
