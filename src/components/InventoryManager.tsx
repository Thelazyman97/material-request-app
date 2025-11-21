import React, { useState } from 'react';
import { InventoryItem, Role } from '../types';
import { SITES, UNITS } from '../constants';
import { Plus, Package, MapPin, Calendar } from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  role: Role;
  onAddInventory: (item: InventoryItem) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, role, onAddInventory }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(UNITS[0]);
  const [siteName, setSiteName] = useState(SITES[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
        id: crypto.randomUUID(),
        name,
        quantity,
        unit,
        siteName,
        reportedBy: role === Role.SUPERVISOR ? 'Supervisor' : 'Staff',
        dateAdded: new Date().toISOString(),
        status: 'AVAILABLE'
    };
    onAddInventory(newItem);
    setIsAdding(false);
    setName('');
    setQuantity(1);
  };

  const canAdd = role === Role.SUPERVISOR || role === Role.LABOR || role === Role.SUPERIOR;

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold">Unused Material Inventory</h2>
                <p className="text-blue-200 text-sm mt-1">Track leftover materials at sites to reduce wastage.</p>
            </div>
            {canAdd && (
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-white text-blue-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Report Unused
                </button>
            )}
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-top-2">
            <h3 className="font-bold text-gray-800 mb-4">Report Unused Material</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Material Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Leftover Cement"
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                        required 
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                            required min="0.1" step="0.1"
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                        <select 
                            value={unit}
                            onChange={e => setUnit(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                        >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location (Site)</label>
                    <select 
                        value={siteName}
                        onChange={e => setSiteName(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                    >
                         {SITES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button 
                        type="button" 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save to Inventory
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {inventory.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No unused materials reported yet.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Material</div>
                    <div className="col-span-4">Location</div>
                    <div className="col-span-3 text-right">Date</div>
                </div>
                {inventory.map(item => (
                    <div key={item.id} className="px-4 py-3 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-5">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                                <span className="font-bold bg-green-100 text-green-700 px-1.5 rounded">{item.quantity} {item.unit}</span>
                            </p>
                        </div>
                        <div className="col-span-4 flex items-start gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {item.siteName}
                        </div>
                        <div className="col-span-3 text-right flex items-center justify-end gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.dateAdded).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};