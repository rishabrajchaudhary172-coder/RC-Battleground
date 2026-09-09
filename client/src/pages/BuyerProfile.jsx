import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, Crown, Award, ChevronDown, ChevronUp, MapPin, Phone, Mail } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function BuyerProfile() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (token) {
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [token]);

  if (!token || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <User className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold uppercase text-white">DRIVER DASHBOARD LOCKED</h2>
        <p className="text-xs text-zinc-400">Please sign in to view your order history and account telemetry.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      
      {/* Header Profile Summary */}
      <div className="bg-zinc-950 border border-zinc-800 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Info */}
        <div className="space-y-4 lg:col-span-2 border-b lg:border-b-0 lg:border-r border-zinc-900 lg:pr-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white text-black font-black text-2xl flex items-center justify-center font-mono">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase text-white tracking-wide font-mono">
                {user.full_name}
              </h1>
              <div className="text-xs font-mono text-zinc-400 flex items-center space-x-2 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs text-zinc-300">
            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-850 p-3">
              <Phone className="w-4 h-4 text-zinc-500" />
              <span>{user.phone || 'No phone added'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-850 p-3">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span className="truncate">{user.address || 'No shipping address set'}</span>
            </div>
          </div>
        </div>

        {/* Membership & Points summary */}
        <div className="space-y-4 font-mono text-xs flex flex-col justify-between">
          <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px] flex items-center justify-between">
              <span>ACTIVE MEMBERSHIP</span>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-bold text-white uppercase">
              {user.active_membership ? user.active_membership.plan_name : 'ROOKIE RACER (FREE)'}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px] flex items-center justify-between">
              <span>REWARD POINTS BALANCE</span>
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-black text-white">
              {user.reward_points_balance || 0} PTS
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase text-white tracking-widest font-sans">
              MY ORDERS & BOOKINGS ({orders.length})
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">Track dispatch status and view item receipts</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-16 text-center font-mono text-xs text-zinc-500 uppercase">
            FETCHING ORDER HISTORY...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-400 uppercase">
            No past orders found in your driver profile.
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className="bg-zinc-950 border border-zinc-800 transition-colors">
                  {/* Order Header Row */}
                  <div 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-sm">#{order.order_number}</span>
                        <span className={`px-2 py-0.5 uppercase font-bold text-[10px] border ${
                          order.status === 'delivered' ? 'bg-white text-black border-white' :
                          order.status === 'shipped' ? 'bg-zinc-800 text-white border-zinc-600' :
                          order.status === 'cancelled' ? 'bg-red-950 text-red-300 border-red-800' :
                          'bg-zinc-900 text-zinc-300 border-zinc-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-white font-bold text-sm"><PriceDisplay usd={order.total_amount} /></div>
                        <div className="text-[10px] text-zinc-400">+{order.points_earned} PTS Earned</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="p-5 border-t border-zinc-900 bg-zinc-900/40 space-y-4">
                      <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Order Items & Delivery Address</div>
                      
                      <div className="space-y-2">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-850">
                            <div>
                              <div className="text-white font-bold">{item.name}</div>
                              <div className="text-zinc-500 text-[10px]">Quantity: {item.quantity}</div>
                            </div>
                            <div className="text-white font-bold"><PriceDisplay usd={item.quantity * parseFloat(item.unit_price)} /></div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
                        Shipping Address: <span className="text-white">{order.shipping_address}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
