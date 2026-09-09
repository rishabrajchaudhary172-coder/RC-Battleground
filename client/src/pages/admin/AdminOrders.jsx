import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Search, Eye, X, Check, Truck, Clock, AlertTriangle } from 'lucide-react';
import PriceDisplay from '../../components/PriceDisplay';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Selected Order Drawer Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = selectedStatus ? `/api/orders/all?status=${selectedStatus}` : '/api/orders/all';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Server error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            ORDER DISPATCH & BOOKING CONTROL
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            ORDERS & BOOKINGS ({orders.length})
          </h1>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-zinc-500 uppercase">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2 uppercase focus:outline-none"
          >
            <option value="">ALL STATUSES</option>
            <option value="pending">PENDING</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          FETCHING ORDER BOOKINGS...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No orders found matching status filter.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Order Number</th>
                <th className="p-3.5">Buyer</th>
                <th className="p-3.5">Total Paid</th>
                <th className="p-3.5">Points</th>
                <th className="p-3.5">Update Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-900/50">
                  <td className="p-3.5 font-bold text-white">#{ord.order_number}</td>
                  <td className="p-3.5">
                    <div className="text-white font-bold">{ord.buyer_name}</div>
                    <div className="text-[10px] text-zinc-400">{ord.buyer_email}</div>
                  </td>
                  <td className="p-3.5 font-bold text-white"><PriceDisplay usd={ord.total_amount} /></td>
                  <td className="p-3.5 text-zinc-400">+{ord.points_earned} PTS</td>
                  <td className="p-3.5">
                    <select
                      value={ord.status}
                      disabled={updatingId === ord.id}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border bg-zinc-900 text-white focus:outline-none ${
                        ord.status === 'delivered' ? 'border-white' :
                        ord.status === 'shipped' ? 'border-zinc-500' :
                        ord.status === 'cancelled' ? 'border-red-800 text-red-300' :
                        'border-zinc-700'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="delivered">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-3.5 text-zinc-500">{new Date(ord.created_at).toLocaleString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="mono-btn-secondary py-1 px-3 text-[10px] font-bold inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>VIEW</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Item Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-2xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-mono font-bold text-base uppercase tracking-widest">
                  ORDER #{selectedOrder.order_number}
                </h3>
                <div className="text-xs font-mono text-zinc-400">Placed: {new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 font-mono text-xs">
              
              {/* Buyer & Shipping Info */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                <div className="text-zinc-500 uppercase text-[10px] tracking-widest">Customer & Shipping Information</div>
                <div className="text-white font-bold text-sm">{selectedOrder.buyer_name} ({selectedOrder.buyer_email})</div>
                <div className="text-zinc-300">Address: <span className="text-white">{selectedOrder.shipping_address}</span></div>
                <div className="text-zinc-300">Payment Method: <span className="text-white">{selectedOrder.payment_method}</span></div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-zinc-400 font-bold uppercase text-[10px]">Purchased Items ({selectedOrder.items?.length || 0})</div>
                <div className="border border-zinc-800 divide-y divide-zinc-900 bg-zinc-950">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">{item.name}</div>
                        <div className="text-[10px] text-zinc-400">Qty: {item.quantity} × <PriceDisplay usd={item.unit_price} /></div>
                      </div>
                      <div className="text-white font-bold"><PriceDisplay usd={item.quantity * parseFloat(item.unit_price)} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1.5 text-right">
                <div className="flex justify-between text-zinc-400">
                  <span>Points Earned:</span>
                  <span className="text-white font-bold">+{selectedOrder.points_earned} PTS</span>
                </div>
                {selectedOrder.points_redeemed > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Points Redeemed:</span>
                    <span className="text-white font-bold">-{selectedOrder.points_redeemed} PTS</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
                  <span>Total Amount Paid:</span>
                  <span><PriceDisplay usd={selectedOrder.total_amount} /></span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
