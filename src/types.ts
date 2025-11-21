
export enum Role {
  SUPERVISOR = 'SUPERVISOR',
  LABOR = 'LABOR',
  SUPERIOR = 'SUPERIOR',
  PURCHASE = 'PURCHASE',
  CEO = 'CEO'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  DELIVERED = 'DELIVERED'
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  // New fields for inventory tracking
  sourcedFromInventory?: boolean;
  inventorySourceId?: string;
}

export interface MaterialRequest {
  id: string;
  supervisorName: string; // The name entered in the form
  requesterRole: Role;   // Who actually submitted it
  siteName: string;
  location: string;
  items: MaterialItem[];
  status: RequestStatus;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  superiorNotes?: string;
  purchaseNotes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  siteName: string; // Where the unused material is currently located
  reportedBy: string;
  dateAdded: string;
  status: 'AVAILABLE' | 'REUSED';
}

export interface User {
  role: Role;
  name: string;
}
