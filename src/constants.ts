import { Role } from './types';

export const SITES = [
  "Lakeside Villa - A2",
  "Downtown Office - Floor 4",
  "Skyline Penthouse - B12",
  "Riverside Cafe Renovation"
];

export const UNITS = [
  "pcs",
  "kg",
  "liters",
  "meters",
  "sq.ft",
  "boxes",
  "bags",
  "sheets"
];

export const MOCK_USER_PRESETS: Record<Role, string> = {
  [Role.SUPERVISOR]: "Alex (Site Supervisor)",
  [Role.LABOR]: "John (Site Labor)",
  [Role.SUPERIOR]: "Sarah (Project Manager)",
  [Role.PURCHASE]: "David (Procurement)",
  [Role.CEO]: "Mr. Anderson (CEO)"
};

// Replace this with your deployed Google Apps Script Web App URL
export const GOOGLE_SCRIPT_URL = "";