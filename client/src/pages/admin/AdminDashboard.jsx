import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Users, ShoppingBag, Crown, Package, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import CategoryTechnologiesTable from '../../components/CategoryTechnologiesTable';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentActivity(data.recent_activity || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
        LOADING DASHBOARD ANALYTICS...
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans">
      
      {/* Dashboard Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            RC BATTLEGROUND CONTROL CENTER
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            ADMINISTRATOR DASHBOARD
          </h1>
        </div>

        <div className="flex space-x-3 font-mono text-xs">
          <button
            onClick={fetchDashboardData}
            className="mono-btn-secondary py-2 px-3 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH STATS</span>
          </button>
          <Link to="/admin/products" className="mono-btn-primary py-2 px-4 flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>ADD PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        
        {/* Total Revenue */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-500 text-xs uppercase flex items-center justify-between">
            <span>TOTAL REVENUE</span>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            ${stats ? parseFloat(stats.total_revenue || 0).toFixed(2) : '0.00'}
          </div>
          <div className="text-[11px] text-zinc-500">Gross sales from processed orders</div>
        </div>

        {/* Total Registered Users */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-500 text-xs uppercase flex items-center justify-between">
            <span>TOTAL BUYERS</span>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.total_users : 0}
          </div>
          <div className="text-[11px] text-zinc-500">Registered driver accounts</div>
        </div>

        {/* Total Orders/Bookings */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-500 text-xs uppercase flex items-center justify-between">
            <span>TOTAL ORDERS</span>
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.total_orders : 0}
          </div>
          <div className="text-[11px] text-zinc-500">Placed vehicle & gear bookings</div>
        </div>

        {/* Active Memberships */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-500 text-xs uppercase flex items-center justify-between">
            <span>ACTIVE VIP PASSES</span>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.active_memberships : 0}
          </div>
          <div className="text-[11px] text-zinc-500">Pro & Apex membership subscriptions</div>
        </div>
      </div>

      {/* Recent Orders Activity Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
            RECENT ORDER BOOKINGS ACTIVITY
          </h2>
          <Link to="/admin/orders" className="font-mono text-xs text-zinc-400 hover:text-white uppercase underline">
            View All Orders →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-12 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
            No recent activity recorded.
          </div>
        ) : (
          <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="hover:bg-zinc-900/50">
                    <td className="p-3.5 font-bold text-white">#{act.order_number}</td>
                    <td className="p-3.5 text-zinc-300">{act.buyer_name}</td>
                    <td className="p-3.5 font-bold text-white">${parseFloat(act.total_amount).toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 uppercase font-bold text-[10px] border ${
                        act.status === 'delivered' ? 'bg-white text-black border-white' :
                        act.status === 'shipped' ? 'bg-zinc-800 text-white border-zinc-600' :
                        act.status === 'cancelled' ? 'bg-red-950 text-red-300 border-red-800' :
                        'bg-zinc-900 text-zinc-300 border-zinc-700'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-500">{new Date(act.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Architecture & Category Technologies Specs Matrix */}
      <div className="pt-6 border-t border-zinc-800">
        <CategoryTechnologiesTable title="CATEGORY TECHNOLOGIES / DECISION MATRIX" />
      </div>
    </div>
  );
}
