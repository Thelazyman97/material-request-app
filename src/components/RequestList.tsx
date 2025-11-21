
import React, { useState, useEffect } from 'react';
import { MaterialRequest, RequestStatus, Role, InventoryItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, Package, CheckCircle, XCircle, Truck, AlertTriangle, User, Sparkles, ArrowRight } from 'lucide-react';
import { analyzeRequestRisk } from '../services/geminiService';

interface RequestListProps {
  requests: MaterialRequest[];
  role: Role;
  inventory: InventoryItem[]; // Passed to check for matches
  onUpdateStatus: (id: string, status: RequestStatus, notes?: string) => void;
  onConsumeInventory: (requestId: string, itemId: string, inventoryId: string, qty: number) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  role, 
  inventory,
  onUpdateStatus,
  onConsumeInventory 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Fetch AI analysis for pending requests when viewed by Superior
  useEffect(() => {
    if (role === Role.SUPERIOR) {
        const pending = requests.filter(r => r.status === RequestStatus.PENDING);
        pending.forEach(async (req) => {
            if (!riskAnalysis[req.id]) {
                const summary = `${req.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')} for ${req.siteName}`;
                const analysis = await analyzeRequestRisk(summary);
                setRiskAnalysis(prev => ({ ...prev, [req.id]: analysis }));
            }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, role]);

  const filteredRequests = requests.filter(r => {
    if (role === Role.SUPERVISOR || role === Role.LABOR) return true; // Site staff see all
    if (role === Role.SUPERIOR) return r.status !== RequestStatus.DELIVERED; // Superior focus on active
    if (role === Role.PURCHASE) return r.status === RequestStatus.APPROVED || r.status === RequestStatus.ORDERED;
    return true;
  });

  // Sort by date desc
  filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper to find matching inventory
  const findInventoryMatch = (itemName: string) => {
    if (!inventory || inventory.length === 0) return null;
    const normalizedItemName = itemName.toLowerCase().trim();
    return inventory.find(inv => 
      inv.status === 'AVAILABLE' && 
      (inv.name.toLowerCase().includes(normalizedItemName) || normalizedItemName.includes(inv.name.toLowerCase()))
    );
  };

  return (
    <div className="space-y-4">
      {filteredRequests.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No requests found.</p>
        </div>
      )}

      {filteredRequests.map((req) => (
        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
          <div 
            className="p-4 cursor-pointer"
            onClick={() => toggleExpand(req.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{req.siteName}</h3>
                    {role === Role.SUPERIOR && riskAnalysis[req.id] && req.status === RequestStatus.PENDING && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            riskAnalysis[req.id].includes("High") ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                            <AlertTriangle size={10} />
                            {riskAnalysis[req.id]}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" /> {req.location}
                </p>
              </div>
              <StatusBadge status={req.status} />
            </div>
            
            <div className="flex justify-between items-end mt-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="font-medium text-gray-900">{req.supervisorName}</span>
                  <span className="text-xs text-gray-400">({req.requesterRole?.toLowerCase() || 'supervisor'})</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{req.items.length} items requested</div>
              </div>
              <div className="text-xs text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedId === req.id && (
            <div className="px-4 pb-4 pt-0 bg-gray-50/50 border-t border-gray-100">
              <div className="mt-3 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Material List</h4>
                <ul className="space-y-2">
                  {req.items.map((item, idx) => {
                    const match = role === Role.PURCHASE && !item.sourcedFromInventory ? findInventoryMatch(item.name) : null;
                    
                    return (
                      <li key={idx} className={`flex flex-col text-sm bg-white p-2 rounded border ${item.sourcedFromInventory ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-gray-800">{item.name}</span>
                          <span className="font-medium text-gray-600">{item.quantity} {item.unit}</span>
                        </div>
                        
                        {item.notes && (
                           <div className="text-xs text-gray-500 mt-1 italic">
                             Note: {item.notes}
                           </div>
                        )}

                        {/* Inventory Suggestion for Purchase Team */}
                        {match && (
                          <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                            <div>
                              <div className="flex items-center gap-1 text-green-700 text-xs font-bold">
                                <Sparkles className="w-3 h-3" />
                                <span>Available in Inventory</span>
                              </div>
                              <p className="text-[10px] text-green-600 mt-0.5">
                                Found {match.quantity} {match.unit} at <strong>{match.siteName}</strong>
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const useQty = Math.min(item.quantity, match.quantity);
                                const confirmMsg = `Use ${useQty} ${match.unit} from ${match.siteName}? This will update inventory.`;
                                if(confirm(confirmMsg)) {
                                    onConsumeInventory(req.id, item.id, match.id, useQty);
                                }
                              }}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1"
                            >
                              Use Stock <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Approval Notes Display */}
              {req.superiorNotes && (
                <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                  <span className="font-semibold">Superior Note:</span> {req.superiorNotes}
                </div>
              )}

              {/* Actions based on Role */}
              <div className="mt-4 flex justify-end gap-2">
                {role === Role.SUPERIOR && req.status === RequestStatus.PENDING && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(req.id, RequestStatus.REJECTED, "Rejected by Superior"); }}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(req.id, RequestStatus.APPROVED, "Approved by Superior"); }}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                    </button>
                  </>
                )}

                {role === Role.PURCHASE && req.status === RequestStatus.APPROVED && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(req.id, RequestStatus.ORDERED, "Ordered by purchase dept"); }}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Truck className="w-4 h-4 mr-1.5" /> Arrange / Order Remaining
                  </button>
                )}

                {role === Role.PURCHASE && req.status === RequestStatus.ORDERED && (
                   <button 
                   onClick={(e) => { e.stopPropagation(); onUpdateStatus(req.id, RequestStatus.DELIVERED, "Delivered to site"); }}
                   className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                 >
                   <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Delivered
                 </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
