
import { MaterialRequest, RequestStatus, InventoryItem } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

const REQUESTS_KEY = 'sitemat_requests_v2';
const INVENTORY_KEY = 'sitemat_inventory_v1';

/*
  === GOOGLE APPS SCRIPT SETUP INSTRUCTIONS ===
  // ... (Previous instructions remain valid for Requests)
*/

// --- REQUESTS ---

export const getRequests = (): MaterialRequest[] => {
  const stored = localStorage.getItem(REQUESTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse requests", e);
    return [];
  }
};

const syncToGoogleSheet = async (payload: any, type: 'REQUEST' | 'INVENTORY' = 'REQUEST') => {
  if (!GOOGLE_SCRIPT_URL) {
    console.log("Google Script URL not set. Skipping cloud sync.");
    return;
  }

  try {
    // Send data with a type flag so backend can route to correct sheet tab if implemented
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, dataType: type })
    });
    console.log(`Synced ${type} to Google Sheet successfully`);
  } catch (error) {
    console.error("Failed to sync to Google Sheet", error);
  }
};

export const saveRequest = (request: MaterialRequest): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = getRequests();
      const updated = [request, ...current];
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
      
      syncToGoogleSheet(request, 'REQUEST');
      
      resolve();
    }, 800);
  });
};

export const updateRequestStatus = (id: string, status: RequestStatus, notes?: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = getRequests();
      const updated = current.map(req => {
        if (req.id === id) {
          const updatedReq = { 
            ...req, 
            status, 
            updatedAt: new Date().toISOString() 
          };
          if (status === RequestStatus.APPROVED || status === RequestStatus.REJECTED) {
            updatedReq.superiorNotes = notes;
          } else if (status === RequestStatus.ORDERED) {
            updatedReq.purchaseNotes = notes;
          }
          return updatedReq;
        }
        return req;
      });
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
      resolve();
    }, 500);
  });
};

// --- INVENTORY ---

export const getInventory = (): InventoryItem[] => {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse inventory", e);
    return [];
  }
};

export const addInventoryItem = (item: InventoryItem): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = getInventory();
      const updated = [item, ...current];
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(updated));
      
      syncToGoogleSheet(item, 'INVENTORY');
      
      resolve();
    }, 600);
  });
};

export const consumeInventory = (
  requestId: string, 
  itemId: string, 
  inventoryId: string, 
  quantityToUse: number
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Update Inventory
      const currentInventory = getInventory();
      let updatedInventory = currentInventory.map(inv => {
        if (inv.id === inventoryId) {
          return { ...inv, quantity: inv.quantity - quantityToUse };
        }
        return inv;
      });
      
      // Remove item if quantity is 0 or less (or keep as 0 if you prefer history)
      // For now, let's keep it but mark status if 0, or just filter it out in UI. 
      // Let's filter out 0s for simplicity in the list.
      updatedInventory = updatedInventory.filter(inv => inv.quantity > 0);

      localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));

      // 2. Update Request Item
      const currentRequests = getRequests();
      const updatedRequests = currentRequests.map(req => {
        if (req.id === requestId) {
          const updatedItems = req.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                sourcedFromInventory: true,
                inventorySourceId: inventoryId,
                notes: (item.notes || '') + ` [Sourced ${quantityToUse} ${item.unit} from Inventory]`
              };
            }
            return item;
          });
          return { ...req, items: updatedItems, updatedAt: new Date().toISOString() };
        }
        return req;
      });

      localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests));

      resolve();
    }, 600);
  });
};


export const seedInitialData = () => {
  if (!localStorage.getItem(REQUESTS_KEY)) {
    const initial: MaterialRequest[] = [
      {
        id: 'req_1',
        supervisorName: 'Alex (Site Supervisor)',
        requesterRole: 'SUPERVISOR' as any,
        siteName: 'Downtown Office - Floor 4',
        location: 'New York, NY',
        items: [
          { id: 'i1', name: 'Plywood 18mm BWR', quantity: 50, unit: 'sheets' },
          { id: 'i2', name: 'Fevicol SH', quantity: 20, unit: 'kg' }
        ],
        status: RequestStatus.PENDING,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'req_2',
        supervisorName: 'Jane Smith',
        requesterRole: 'SUPERVISOR' as any,
        siteName: 'Lakeside Villa - A2',
        location: 'Austin, TX',
        items: [
          { id: 'i3', name: 'White Cement', quantity: 5, unit: 'bags' }
        ],
        status: RequestStatus.APPROVED,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 100000000).toISOString()
      }
    ];
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(initial));
  }

  if (!localStorage.getItem(INVENTORY_KEY)) {
    const initialInv: InventoryItem[] = [
      {
        id: 'inv_1',
        name: 'Blue Paint (Royal)',
        quantity: 2,
        unit: 'liters',
        siteName: 'Lakeside Villa - A2',
        reportedBy: 'Alex',
        dateAdded: new Date(Date.now() - 200000000).toISOString(),
        status: 'AVAILABLE'
      },
      {
        id: 'inv_2',
        name: 'Plywood 18mm BWR',
        quantity: 10,
        unit: 'sheets',
        siteName: 'Lakeside Villa - A2',
        reportedBy: 'Jane',
        dateAdded: new Date(Date.now() - 100000000).toISOString(),
        status: 'AVAILABLE'
      }
    ];
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInv));
  }
};
