
import React, { useState, useEffect } from 'react';
import { Role, MaterialRequest, RequestStatus, InventoryItem } from './types';
import { getRequests, saveRequest, updateRequestStatus, seedInitialData, getInventory, addInventoryItem, consumeInventory } from './services/sheetService';
import { RequestList } from './components/RequestList';
import { RequestForm } from './components/RequestForm';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { MOCK_USER_PRESETS } from './constants';
import { HardHat, ClipboardCheck, ShoppingCart, PlusCircle, UserCircle2, Hammer, LayoutDashboard, PackageOpen, Crown } from 'lucide-react';

type View = 'REQUESTS' | 'DASHBOARD' | 'INVENTORY';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.SUPERVISOR);
  const [currentView, setCurrentView] = useState<View>('REQUESTS');
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    seedInitialData();
    setRequests(getRequests());
    setInventory(getInventory());
  }, [refreshKey]);

  // Update view based on role change automatically if needed
  useEffect(() => {
    if (currentRole === Role.CEO) {
        setCurrentView('DASHBOARD');
    } else if (currentView === 'DASHBOARD') {
        setCurrentView('REQUESTS');
    }
  }, [currentRole]);

  const handleStatusUpdate = async (id: string, status: RequestStatus, notes?: string) => {
    await updateRequestStatus(id, status, notes);
    setRefreshKey(prev => prev + 1);
  };

  const handleSubmitRequest = async (req: MaterialRequest) => {
    await saveRequest(req);
    setIsCreatingRequest(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleAddInventory = async (item: InventoryItem) => {
    await addInventoryItem(item);
    setRefreshKey(prev => prev + 1);
  };

  const handleConsumeInventory = async (reqId: string, itemId: string, invId: string, qty: number) => {
    await consumeInventory(reqId, itemId, invId, qty);
    setRefreshKey(prev => prev + 1);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.SUPERVISOR: return <HardHat className="w-5 h-5" />;
      case Role.LABOR: return <Hammer className="w-5 h-5" />;
      case Role.SUPERIOR: return <ClipboardCheck className="w-5 h-5" />;
      case Role.PURCHASE: return <ShoppingCart className="w-5 h-5" />;
      case Role.CEO: return <Crown className="w-5 h-5" />;
    }
  };

  const canCreateRequest = currentRole === Role.SUPERVISOR || currentRole === Role.LABOR;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg shadow-sm">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-none">SiteMat</h1>
                  <p className="text-xs text-gray-500">Material Request System</p>
                </div>
              </div>

              {/* Desktop View Tabs */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {(currentRole === Role.CEO ? ['DASHBOARD', 'REQUESTS', 'INVENTORY'] : ['REQUESTS', 'INVENTORY']).map((view) => (
                    <button
                        key={view}
                        onClick={() => setCurrentView(view as View)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
                            currentView === view 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {view === 'DASHBOARD' && <LayoutDashboard className="w-4 h-4" />}
                        {view === 'REQUESTS' && <ClipboardCheck className="w-4 h-4" />}
                        {view === 'INVENTORY' && <PackageOpen className="w-4 h-4" />}
                        {view}
                    </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Role Switcher */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 overflow-x-auto">
                {(Object.values(Role) as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentRole === role 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title={role}
                  >
                    {getRoleIcon(role)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-200 pl-4">
                <UserCircle2 className="w-5 h-5" />
                <span className="hidden sm:inline truncate max-w-[150px]">{MOCK_USER_PRESETS[currentRole]}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
               {currentView === 'DASHBOARD' && "Executive Overview"}
               {currentView === 'INVENTORY' && "Site Inventory"}
               {currentView === 'REQUESTS' && (
                  <>
                    {(currentRole === Role.SUPERVISOR || currentRole === Role.LABOR) && "My Site Requests"}
                    {currentRole === Role.SUPERIOR && "Approvals Pending"}
                    {currentRole === Role.PURCHASE && "Procurement Queue"}
                    {currentRole === Role.CEO && "All Material Requests"}
                  </>
               )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
               {currentView === 'DASHBOARD' && "Real-time analytics of site consumption and needs."}
               {currentView === 'INVENTORY' && "Track unused material available for reuse."}
               {currentView === 'REQUESTS' && "Manage site material workflow."}
            </p>
          </div>

          {/* New Request Button */}
          {canCreateRequest && currentView === 'REQUESTS' && (
            <button 
              onClick={() => setIsCreatingRequest(true)}
              className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">New Request</span>
            </button>
          )}
        </div>

        {/* View Content */}
        <div className="animate-in fade-in duration-300">
            {currentView === 'DASHBOARD' && <Dashboard requests={requests} inventory={inventory} />}
            {currentView === 'INVENTORY' && <InventoryManager inventory={inventory} role={currentRole} onAddInventory={handleAddInventory} />}
            {currentView === 'REQUESTS' && (
                 <RequestList 
                    requests={requests} 
                    role={currentRole}
                    inventory={inventory} 
                    onUpdateStatus={handleStatusUpdate}
                    onConsumeInventory={handleConsumeInventory}
                 />
            )}
        </div>
      </main>

      {/* Create Request Modal */}
      {isCreatingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <RequestForm 
              currentUserRole={currentRole}
              currentUserName={MOCK_USER_PRESETS[currentRole]}
              onSubmit={handleSubmitRequest}
              onCancel={() => setIsCreatingRequest(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 p-2 flex justify-around z-40 pb-safe">
          {/* Mobile View Switcher */}
          <button onClick={() => setCurrentView('REQUESTS')} className={`p-2 rounded flex flex-col items-center ${currentView === 'REQUESTS' ? 'text-orange-600' : 'text-gray-400'}`}>
             <ClipboardCheck className="w-5 h-5" />
             <span className="text-[10px] font-medium">Requests</span>
          </button>
          <button onClick={() => setCurrentView('INVENTORY')} className={`p-2 rounded flex flex-col items-center ${currentView === 'INVENTORY' ? 'text-orange-600' : 'text-gray-400'}`}>
             <PackageOpen className="w-5 h-5" />
             <span className="text-[10px] font-medium">Inventory</span>
          </button>
          {currentRole === Role.CEO && (
             <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded flex flex-col items-center ${currentView === 'DASHBOARD' ? 'text-orange-600' : 'text-gray-400'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Dashboard</span>
             </button>
          )}
      </div>

       {/* Mobile Role Switcher (Floating above nav) */}
       <div className="md:hidden fixed bottom-16 right-4 bg-white rounded-full shadow-xl border border-gray-200 p-1.5 flex flex-col gap-1 z-40">
        {(Object.values(Role) as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(role)}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              currentRole === role 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            {getRoleIcon(role)}
          </button>
        ))}
      </div>

    </div>
  );
};

export default App;
