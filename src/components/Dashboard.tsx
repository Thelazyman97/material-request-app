import React, { useMemo } from 'react';
import { MaterialRequest, InventoryItem, RequestStatus } from '../types';
import { BarChart3, Building2, Package, TrendingUp } from 'lucide-react';

interface DashboardProps {
  requests: MaterialRequest[];
  inventory: InventoryItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ requests, inventory }) => {
  
  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const completed = requests.filter(r => r.status === RequestStatus.DELIVERED).length;
    const totalInventoryItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
    
    // Site Wise grouping
    const siteGrouping = requests.reduce((acc, req) => {
      acc[req.siteName] = (acc[req.siteName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Material Wise grouping (Top 5)
    const materialCount = requests.flatMap(r => r.items).reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topMaterials = Object.entries(materialCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    return { totalRequests, pending, completed, totalInventoryItems, siteGrouping, topMaterials };
  }, [requests, inventory]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Completed Sites</h3>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Inventory Items</h3>
            <Package className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalInventoryItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Wise Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800">Site Activity</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.siteGrouping).map(([site, count]) => (
              <div key={site} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{site}</span>
                <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((count as number) / stats.totalRequests) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Wise Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800">Top Requested Materials</h3>
          </div>
          <div className="space-y-3">
             {stats.topMaterials.map(([name, qty]) => (
              <div key={name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{name}</span>
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{qty} units</span>
              </div>
            ))}
            {stats.topMaterials.length === 0 && <p className="text-sm text-gray-400">No material data available.</p>}
          </div>
        </div>
      </div>
      
      {/* Recent Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Activity Log</h3>
         </div>
         <div className="divide-y divide-gray-100">
            {requests.slice(0, 5).map(req => (
                <div key={req.id} className="px-6 py-3 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-900">{req.siteName}</p>
                        <p className="text-xs text-gray-500">Requested by {req.supervisorName}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs font-mono text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${req.status === RequestStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                             {req.status}
                         </span>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};