import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, Crown, Award, ChevronDown, ChevronUp, MapPin, Phone, Mail, CheckCircle2, ExternalLink, Download, Image as ImageIcon, X } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function BuyerProfile({ onOpenAuthModal }) {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  useEffect(() => {
    if (token) {
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          const list = data.orders || [];
          setOrders(list);
          if (list.length > 0) {
            setExpandedOrderId(list[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    } else {
      setLoadingOrders(false);
    }
  }, [token]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
        INITIALIZING DRIVER DASHBOARD TELEMETRY...
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 font-mono">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-white tracking-widest font-sans">DRIVER DASHBOARD LOCKED</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Sign in to your driver account to track vehicle bookings, inspect Fonepay QR payment receipts, view rewards points, and access your profile.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="mono-btn-primary py-3 px-8 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          >
            SIGN IN TO DRIVER DASHBOARD
          </button>
          <a
            href="/"
            className="mono-btn-secondary py-3 px-8 text-xs font-bold uppercase tracking-wider"
          >
            RETURN TO HOME PAGE
          </a>
        </div>
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
              {user.active_membership ? user.active_membership.plan_name : 'PRO DRIVER (ACTIVE)'}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px] flex items-center justify-between">
              <span>REWARD POINTS BALANCE</span>
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-black text-white">
              {user.reward_points || user.reward_points_balance || 0} PTS
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
            <p className="text-xs font-mono text-zinc-400 mt-1">Track dispatch status, payment proof, and view vehicle receipts</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-16 text-center font-mono text-xs text-zinc-500 uppercase">
            FETCHING ORDER HISTORY...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-400 uppercase space-y-3">
            <Package className="w-10 h-10 text-zinc-600 mx-auto" />
            <div>No past order bookings found in your driver profile.</div>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const itemsList = Array.isArray(order.items) ? order.items.filter(Boolean) : [];

              return (
                <div key={order.id} className="bg-zinc-950 border border-zinc-800 transition-colors">
                  {/* Order Header Row */}
                  <div 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/50"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-sm">#{order.order_number}</span>
                        <span className={`px-2.5 py-0.5 uppercase font-bold text-[10px] border ${
                          order.status === 'delivered' ? 'bg-white text-black border-white' :
                          order.status === 'shipped' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                          order.status === 'cancelled' ? 'bg-red-950 text-red-300 border-red-800' :
                          'bg-zinc-900 text-amber-400 border-zinc-700'
                        }`}>
                          {order.status === 'pending' ? 'PENDING VERIFICATION' : order.status}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] flex items-center space-x-3">
                        <span>Placed: {new Date(order.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-zinc-500">{order.payment_method || 'Fonepay QR'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">
                          {order.total_amount_npr ? `Rs. ${parseFloat(order.total_amount_npr).toLocaleString()}` : <PriceDisplay usd={order.total_amount} />}
                        </div>
                        <div className="text-emerald-400 font-bold text-[10px]">+{order.points_earned} PTS Earned</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="p-5 border-t border-zinc-900 bg-zinc-900/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                        <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">BOOKED VEHICLES & RECEIPT TELEMETRY</div>
                        {(() => {
                          const receiptUrl = (order.payment_screenshot && !order.payment_screenshot.includes('fonepay_qr'))
                            ? order.payment_screenshot
                            : '/images/sample-buyer-receipt.jpg';
                          return (
                            <div className="flex items-center space-x-2">
                              <img
                                src={receiptUrl}
                                alt="Receipt Thumbnail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReceiptOrder(order);
                                }}
                                className="w-8 h-8 object-cover bg-black border border-emerald-800 hover:border-emerald-400 cursor-pointer transition rounded-sm shrink-0"
                                title="Click to view full receipt modal"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReceiptOrder(order);
                                }}
                                className="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-800 hover:border-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                                <span>VIEW PAYMENT RECEIPT</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="space-y-3">
                        {itemsList.map((item, idx) => {
                          const itemImg = item.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80';
                          const unitPrice = parseFloat(item.unit_price || 0);

                          return (
                            <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-zinc-950 border border-zinc-850">
                              <div className="flex items-center space-x-3 min-w-0">
                                <img
                                  src={itemImg}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover bg-black border border-zinc-800 shrink-0"
                                />
                                <div className="space-y-1 min-w-0">
                                  <div className="text-white font-bold text-sm truncate">{item.name}</div>
                                  {item.description && (
                                    <p className="text-zinc-400 text-[11px] line-clamp-1 font-sans">{item.description}</p>
                                  )}
                                  <div className="text-zinc-500 text-[10px]">Quantity: <span className="text-white font-bold">{item.quantity}</span></div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-white font-bold text-sm">
                                  {item.unit_price_npr ? `Rs. ${(parseFloat(item.unit_price_npr) * item.quantity).toLocaleString()}` : <PriceDisplay usd={item.quantity * unitPrice} />}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  Unit: {item.unit_price_npr ? `Rs. ${parseFloat(item.unit_price_npr).toLocaleString()}` : <PriceDisplay usd={unitPrice} />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-zinc-400 pt-3 border-t border-zinc-850 flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>Shipping Address: <span className="text-white font-bold">{order.shipping_address}</span></div>
                        <div className="text-zinc-500">Payment Ref: <span className="text-zinc-300 font-mono">{order.payment_ref || 'FONEPAY-QR'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Vehicle Booking & Payment Receipt Modal (Matching Image 2 Layout) */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" style={{ zIndex: 999999 }}>
          <div className="fixed inset-0" onClick={() => setSelectedReceiptOrder(null)} />
          <div className="relative bg-zinc-950 border border-emerald-800 text-white w-full max-w-xl p-6 sm:p-8 shadow-2xl z-10 font-mono text-xs space-y-6">
            
            {/* Header with Green Checkmark (Image 2 style) */}
            <div className="text-center space-y-2 relative">
              <button 
                onClick={() => setSelectedReceiptOrder(null)} 
                className="absolute right-0 top-0 text-zinc-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>

              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black uppercase text-white tracking-wide font-sans">BOOKING SUBMITTED!</h2>
              <div className="text-emerald-400 font-bold text-sm">Order #{selectedReceiptOrder.order_number}</div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                Your RC vehicle booking has been logged and product stock has been reserved. Admin will review your Fonepay QR payment screenshot proof shortly.
              </p>
            </div>

            {/* Booked Vehicles Summary Box (Image 2 style) */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 space-y-3 rounded-sm">
              <div className="text-zinc-400 uppercase text-[10px] tracking-widest font-bold">BOOKED VEHICLES</div>
              {(selectedReceiptOrder.items || []).map((item, idx) => {
                const itemImg = item.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80';
                return (
                  <div key={idx} className="flex items-center space-x-3 border-b border-zinc-800/80 pb-2.5 last:border-0 last:pb-0">
                    <img src={itemImg} alt={item.name} className="w-12 h-12 object-cover bg-black border border-zinc-800 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm truncate">{item.name}</div>
                      <div className="text-zinc-400 text-[10px]">
                        Qty: {item.quantity} × {item.unit_price_npr ? `Rs. ${parseFloat(item.unit_price_npr).toLocaleString()}` : <PriceDisplay usd={item.unit_price} />}
                      </div>
                    </div>
                    <div className="text-right font-bold text-emerald-400 text-sm">
                      {item.unit_price_npr ? `Rs. ${(parseFloat(item.unit_price_npr) * item.quantity).toLocaleString()}` : <PriceDisplay usd={item.unit_price * item.quantity} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Uploaded Buyer Payment Screenshot Proof Section */}
            {(() => {
              const receiptUrl = (selectedReceiptOrder.payment_screenshot && !selectedReceiptOrder.payment_screenshot.includes('fonepay_qr'))
                ? selectedReceiptOrder.payment_screenshot
                : '/images/sample-buyer-receipt.jpg';
              return (
                <div className="bg-zinc-900/40 border border-emerald-800/60 p-4 space-y-3 rounded-sm">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> BUYER UPLOADED PAYMENT SCREENSHOT PROOF
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(`<img src="${receiptUrl}" style="max-width:100%;height:auto;margin:auto;display:block;background:#000;" />`);
                        }
                      }}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center space-x-1 underline uppercase"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>OPEN FULL TAB</span>
                    </button>
                  </div>

                  <div className="max-h-64 overflow-auto bg-black border border-zinc-900 flex items-center justify-center p-2">
                    <img src={receiptUrl} alt="Buyer Payment Receipt" className="max-h-56 object-contain" />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <a
                      href={receiptUrl}
                      download={`receipt-${selectedReceiptOrder.order_number}.png`}
                      className="mono-btn-primary py-1.5 px-3 text-[10px] uppercase font-bold flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOWNLOAD RECEIPT</span>
                    </a>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="mono-btn-secondary w-full py-2.5 text-xs text-center font-bold uppercase"
              >
                CLOSE RECEIPT
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
