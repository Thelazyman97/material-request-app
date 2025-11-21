import React, { useState, useEffect } from 'react';
import { MaterialItem, MaterialRequest, RequestStatus, Role } from '../types';
import { SITES, UNITS } from '../constants';
import { parseMaterialRequest } from '../services/geminiService';
import { Plus, Trash2, Sparkles, Loader2, Send, User } from 'lucide-react';

interface RequestFormProps {
  currentUserRole: Role;
  currentUserName: string;
  onSubmit: (req: MaterialRequest) => void;
  onCancel: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ currentUserRole, currentUserName, onSubmit, onCancel }) => {
  const [siteName, setSiteName] = useState(SITES[0]);
  const [customSite, setCustomSite] = useState('');
  const [location, setLocation] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  
  // Initialize Supervisor name based on login
  useEffect(() => {
    if (currentUserRole === Role.SUPERVISOR) {
        // Strip the (Role) part from the preset name for cleaner input
        const cleanName = currentUserName.split('(')[0].trim();
        setSupervisorName(cleanName);
    }
  }, [currentUserRole, currentUserName]);
  
  // AI Input State
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Manual Item State
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState(UNITS[0]);

  const handleAddItem = () => {
    if (!newItemName) return;
    const item: MaterialItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      quantity: newItemQty,
      unit: newItemUnit
    };
    setItems([...items, item]);
    setNewItemName('');
    setNewItemQty(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const parsedItems = await parseMaterialRequest(aiInput);
      setItems(prev => [...prev, ...parsedItems]);
      setAiInput(''); // Clear input after successful parse
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        alert("Please add at least one material item.");
        return;
    }
    if (!supervisorName.trim()) {
        alert("Please enter the Supervisor's Name.");
        return;
    }

    const finalSiteName = siteName === 'Other' ? customSite : siteName;
    
    const newRequest: MaterialRequest = {
      id: crypto.randomUUID(),
      supervisorName: supervisorName,
      requesterRole: currentUserRole,
      siteName: finalSiteName,
      location,
      items,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSubmit(newRequest);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col max-h-[90vh]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
        <div>
            <h2 className="text-xl font-bold text-gray-800">New Material Request</h2>
            <p className="text-xs text-gray-500">Created by {currentUserRole.toLowerCase()}</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        <form id="request-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Supervisor & Site Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Enter Supervisor Name"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        className="pl-9 w-full rounded-lg border-gray-300 border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                    />
                </div>
                {currentUserRole === Role.LABOR && (
                    <p className="text-xs text-gray-500 mt-1">Please enter the name of the supervisor for this site.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <select 
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                    {SITES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other (Specify)</option>
                </select>
                {siteName === 'Other' && (
                    <input 
                    type="text" 
                    placeholder="Enter Site Name"
                    value={customSite}
                    onChange={(e) => setCustomSite(e.target.value)}
                    className="mt-2 w-full rounded-lg border-gray-300 border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                    />
                )}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                    type="text" 
                    placeholder="e.g., 4th Ave, Block C"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                />
                </div>
            </div>
          </div>

          {/* AI Quick Add Section */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
            <label className="block text-sm font-medium text-orange-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              AI Quick Add
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., 'Need 10 bags of cement and 500 bricks for the wall'"
                className="flex-1 rounded-lg border-orange-200 border px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAiParse())}
              />
              <button 
                type="button"
                onClick={handleAiParse}
                disabled={isAnalyzing || !aiInput.trim()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
              </button>
            </div>
            <p className="text-xs text-orange-700 mt-2 opacity-80">
              Powered by Gemini 2.5 Flash. Describe what you need naturally.
            </p>
          </div>

          {/* Material List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Materials List</label>
              <span className="text-xs text-gray-500">{items.length} items added</span>
            </div>
            
            {/* Add Manual Item */}
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-[2] rounded-lg border-gray-300 border px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
              />
              <input 
                type="number" 
                placeholder="Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-20 rounded-lg border-gray-300 border px-3 py-2 text-sm"
                min="1"
              />
              <select 
                value={newItemUnit} 
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-24 rounded-lg border-gray-300 border px-3 py-2 text-sm"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <button 
                type="button"
                onClick={handleAddItem}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* List of Added Items */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden min-h-[100px]">
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No items added yet. Use the form above or AI Quick Add.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="p-3 flex justify-between items-center hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 text-xs font-bold">
                          {items.indexOf(item) + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          form="request-form"
          disabled={items.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Submit Request
        </button>
      </div>
    </div>
  );
};