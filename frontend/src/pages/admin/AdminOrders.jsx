import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Search, Eye, X, Check, Truck, Clock, AlertTriangle, Image as ImageIcon, ExternalLink, CheckCircle, Ban } from 'lucide-react';
import PriceDisplay from '../../components/PriceDisplay';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Selected Order Drawer Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Fullscreen Zoom Payment Screenshot Modal State
  const [zoomScreenshot, setZoomScreenshot] = useState(null);

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
            VEHICLE BOOKING & FONEPAY QR DISPATCH CONTROL
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            ORDERS & VEHICLE BOOKINGS ({orders.length})
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
            <option value="pending">PENDING VERIFICATION</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED / APPROVED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          FETCHING VEHICLE BOOKINGS & SCREENSHOTS...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No bookings found matching status filter.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Booked Car / Vehicle</th>
                <th className="p-3.5">Order No.</th>
                <th className="p-3.5">Buyer Details</th>
                <th className="p-3.5">Total (NPR / USD)</th>
                <th className="p-3.5">Update Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {orders.map((ord) => {
                const firstItem = ord.items?.[0] || {};
                const vehicleImage = firstItem.image || firstItem.images?.[0] || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=150&q=80';
                const vehicleName = firstItem.name || 'RC Vehicle Listing';
                const vehicleDesc = firstItem.description || '';
                const nprPrice = ord.total_amount_npr ? Math.round(parseFloat(ord.total_amount_npr)) : Math.round(parseFloat(ord.total_amount || 0) * 133.50);

                return (
                  <tr key={ord.id} className="hover:bg-zinc-900/50">
                    
                    {/* Booked Vehicle Details (Image, Name, Description, Price) */}
                    <td className="p-3.5 min-w-[260px]">
                      <div className="flex items-center space-x-3">
                        <img
                          src={vehicleImage}
                          alt={vehicleName}
                          className="w-14 h-14 object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white line-clamp-1">{vehicleName}</div>
                          {vehicleDesc && (
                            <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{vehicleDesc}</div>
                          )}
                          <div className="text-[10px] text-zinc-500 mt-1">
                            {ord.items?.length > 1 ? `+ ${ord.items.length - 1} more items` : `Qty: ${firstItem.quantity || 1}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-white whitespace-nowrap">#{ord.order_number}</td>
                    
                    <td className="p-3.5">
                      <div className="text-white font-bold">{ord.buyer_name}</div>
                      <div className="text-[10px] text-zinc-400">{ord.buyer_email}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{ord.shipping_address}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="text-emerald-400 font-bold text-xs">Rs. {nprPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">(<PriceDisplay usd={ord.total_amount} />)</div>
                    </td>

                    {/* Status Select */}
                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border bg-zinc-900 text-white focus:outline-none ${
                          ord.status === 'delivered' ? 'border-emerald-500 text-emerald-400' :
                          ord.status === 'shipped' ? 'border-blue-500 text-blue-300' :
                          ord.status === 'cancelled' ? 'border-red-800 text-red-300' :
                          'border-amber-600 text-amber-300 animate-pulse'
                        }`}
                      >
                        <option value="pending">PENDING VERIFICATION</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED / APPROVED</option>
                        <option value="cancelled">CANCELLED (RESTORE STOCK)</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="mono-btn-secondary py-1 px-3 text-[10px] font-bold inline-flex items-center space-x-1 border-zinc-700 text-zinc-200 hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>DETAILS</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Item Details & Payment Proof Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-3xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">VEHICLE BOOKING RECORD</div>
                <h3 className="font-mono font-bold text-lg uppercase tracking-widest text-white">
                  ORDER #{selectedOrder.order_number}
                </h3>
                <div className="text-xs font-mono text-zinc-400">Placed: {new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 font-mono text-xs">
              
              {/* Customer & Shipping Information */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                <div className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Customer & Delivery Information</div>
                <div className="text-white font-bold text-sm">{selectedOrder.buyer_name} ({selectedOrder.buyer_email})</div>
                <div className="text-zinc-300">Delivery Address: <span className="text-white font-bold">{selectedOrder.shipping_address}</span></div>
                <div className="text-zinc-300">Payment Gateway: <span className="text-emerald-400 font-bold">{selectedOrder.payment_method || 'QR Code (Fonepay / Sanima Bank)'}</span></div>
                {selectedOrder.payment_ref && (
                  <div className="text-zinc-300">Transaction Reference: <span className="text-amber-400 font-mono">{selectedOrder.payment_ref}</span></div>
                )}
              </div>

              {/* Booked Vehicle Cards (Image, Name, Description, Price, Quantity) */}
              <div className="space-y-3">
                <div className="text-zinc-400 font-bold uppercase text-[10px]">Booked Vehicle Items ({selectedOrder.items?.length || 0})</div>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=200&q=80'}
                          alt={item.name}
                          className="w-16 h-16 object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.name}</h4>
                          {item.description && (
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 max-w-md">{item.description}</p>
                          )}
                          <div className="text-[11px] text-zinc-500 mt-1">
                            Quantity Booked: <strong className="text-white">{item.quantity}</strong> × <PriceDisplay usd={item.unit_price} />
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:text-right shrink-0">
                        <div className="text-emerald-400 font-bold text-sm">
                          Rs. {Math.round((parseFloat(item.unit_price) * 133.50) * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-[10px]">
                          (<PriceDisplay usd={item.quantity * parseFloat(item.unit_price)} />)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Payment Proof Screenshot Section */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                {(() => {
                  const receiptUrl = (selectedOrder.payment_screenshot && !selectedOrder.payment_screenshot.includes('fonepay_qr'))
                    ? selectedOrder.payment_screenshot
                    : '/images/sample-buyer-receipt.jpg';
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-zinc-400 font-bold uppercase text-[10px]">Buyer Fonepay QR Payment Receipt Screenshot</div>
                        <button
                          onClick={() => setZoomScreenshot(receiptUrl)}
                          className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center space-x-1 uppercase"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>OPEN FULLSCREEN ZOOM</span>
                        </button>
                      </div>

                      <div className="bg-zinc-900 border border-emerald-800 p-4 text-center space-y-3">
                        <div className="max-h-80 overflow-hidden bg-black border border-zinc-800 flex items-center justify-center p-2">
                          <img
                            src={receiptUrl}
                            alt="Payment Receipt Screenshot"
                            className="max-h-72 object-contain cursor-pointer hover:scale-105 transition"
                            onClick={() => setZoomScreenshot(receiptUrl)}
                          />
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Click screenshot image above to zoom into transaction details
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Status Update Quick Action Controls */}
              <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400 uppercase text-[11px]">Current Status:</span>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase border ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-950 text-red-300 border-red-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {selectedOrder.status === 'pending' ? 'PENDING VERIFICATION' : selectedOrder.status}
                  </span>
                </div>

                <div className="flex space-x-3">
                  {selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                      className="mono-btn-primary py-2 px-4 text-xs font-bold flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>APPROVE & CONFIRM BOOKING</span>
                    </button>
                  )}
                  {selectedOrder.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                      className="mono-btn-danger py-2 px-4 text-xs font-bold flex items-center space-x-1.5 bg-red-950/40 text-red-300 border border-red-800 hover:bg-red-900/60"
                    >
                      <Ban className="w-4 h-4" />
                      <span>CANCEL BOOKING (RESTORE STOCK)</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Payment Screenshot Modal */}
      {zoomScreenshot && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setZoomScreenshot(null)} />
          <div className="relative max-w-5xl w-full bg-zinc-950 border border-emerald-800 p-6 space-y-4 z-10 font-mono text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
              <div>
                <span className="font-bold text-sm uppercase text-emerald-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>BUYER FONEPAY QR PAYMENT RECEIPT PROOF</span>
                </span>
                <p className="text-[10px] text-zinc-400">Review buyer bank transfer details and terminal transaction ID</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${zoomScreenshot}" style="max-width:100%;height:auto;margin:auto;display:block;background:#000;" />`);
                    }
                  }}
                  className="mono-btn-secondary py-1.5 px-3 text-[10px] uppercase font-bold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN IN NEW TAB</span>
                </button>

                <a
                  href={zoomScreenshot}
                  download="fonepay_payment_receipt.png"
                  className="mono-btn-primary py-1.5 px-3 text-[10px] uppercase font-bold flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500"
                >
                  <span>DOWNLOAD RECEIPT</span>
                </a>

                <button
                  onClick={() => setZoomScreenshot(null)}
                  className="p-1.5 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 font-bold px-3 py-1.5 text-xs uppercase"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-auto border border-zinc-900 bg-black flex items-center justify-center p-4">
              <img
                src={zoomScreenshot}
                alt="Full Zoom Receipt"
                className="max-h-[72vh] w-auto object-contain shadow-2xl border border-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
