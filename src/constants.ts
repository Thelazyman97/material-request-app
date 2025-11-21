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

// 1. Tries to get URL from Vercel Environment Variables
// 2. Falls back to the hardcoded string if not found
// Replace the string below with your Web App URL if you are running locally
export const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyNjKiLF4ieoer1qt-v0R1ktEaBw7nXKS4CO3MyG8I7OBon3sGfGcJ5hrM1SQCIryl0kg/exec";
