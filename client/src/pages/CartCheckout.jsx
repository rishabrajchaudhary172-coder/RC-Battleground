import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowRight, ShieldCheck, Award, MapPin, QrCode, Upload, CheckCircle2, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function CartCheckout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [shippingAddress, setShippingAddress] = useState('');
  
  // Reward Points States
  const [rewardSettings, setRewardSettings] = useState({ points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 });
  const [userPointsBalance, setUserPointsBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Fonepay QR & Screenshot States
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccessModal, setBookingSuccessModal] = useState(null);

  useEffect(() => {
    if (user && user.address) {
      setShippingAddress(user.address);
    }

    // Fetch reward settings & points balance
    fetch('/api/rewards/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setRewardSettings(data.settings);
      })
      .catch(() => {});

    if (token) {
      fetch('/api/rewards/my-points', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setUserPointsBalance(data.balance || 0))
        .catch(() => {});
    }
  }, [user, token]);

  const shippingCost = cartTotal > 150 ? 0 : 14.99;
  const discountFromPoints = pointsToRedeem * rewardSettings.dollars_per_point_redeemed;
  const grandTotalUsd = Math.max(0, cartTotal + shippingCost - discountFromPoints);
  const grandTotalNpr = Math.round(grandTotalUsd * 133.50);

  // Screenshot File Handler (Reads image file to Base64 Data URL)
  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Payment screenshot image size must be less than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPaymentScreenshot(uploadEvent.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Handler -> Submits Booking & Screenshot Proof
  const handleQrCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to place an order booking.');
      return;
    }
    if (cart.length === 0) return;
    if (!shippingAddress.trim()) {
      setError('Please provide a valid shipping & delivery address.');
      return;
    }
    if (!paymentScreenshot) {
      setError('Please upload your Fonepay QR payment screenshot as proof of payment before completing your booking.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          shipping_address: shippingAddress.trim(),
          payment_method: 'QR Code (Fonepay / Sanima Bank)',
          payment_screenshot: paymentScreenshot,
          payment_ref: paymentRef.trim(),
          points_to_redeem: pointsToRedeem,
          currency: 'NPR'
        })
      });

      const data = await res.json().catch(() => ({ error: 'Server error processing booking' }));

      if (!res.ok) {
        setError(data.error || 'Failed to submit payment booking');
        setLoading(false);
        return;
      }

      // Success! Clear cart and display success modal
      clearCart();
      setBookingSuccessModal(data.order);
    } catch (err) {
      console.error('QR Checkout error:', err);
      setError('Server error processing payment screenshot booking');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !bookingSuccessModal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold uppercase text-white">YOUR CART IS EMPTY</h2>
        <p className="text-xs text-zinc-400">Add RC vehicles or spare gear before checking out.</p>
        <Link to="/catalog" className="mono-btn-primary text-xs inline-block">
          EXPLORE CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8">
      
      {/* Title Bar */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
          FONEPAY QR SCAN & PAYMENT PROOF GATEWAY
        </div>
        <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
          CHECKOUT & DISPATCH BOOKING
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 font-mono text-xs flex items-center justify-between">
          <span>Error: {error}</span>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Main Checkout Grid */}
      <form onSubmit={handleQrCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Shipping, QR Code & Screenshot Upload */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>1. Shipping & Delivery Destination</span>
            </h3>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Full Delivery Address *</label>
              <textarea
                rows={3}
                required
                placeholder="Street address, Trackside sector, City, Zip code..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full mono-input"
              />
            </div>
          </div>

          {/* Reward Points Redemption */}
          {token && userPointsBalance > 0 && (
            <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>2. Redeem Reward Points Discount</span>
                </h3>
                <span className="text-zinc-400">Available: <strong className="text-white">{userPointsBalance} PTS</strong></span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Redeem Points: <strong className="text-white">{pointsToRedeem} PTS</strong></span>
                  <span className="text-emerald-400 font-bold">-<PriceDisplay usd={discountFromPoints} /> Discount</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(userPointsBalance, Math.floor((cartTotal + shippingCost) / rewardSettings.dollars_per_point_redeemed))}
                  step="10"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10))}
                  className="w-full accent-white bg-zinc-900 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Fonepay QR Code Payment Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-6 font-mono text-xs">
            <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>3. Scan Fonepay QR Code to Pay</span>
              </h3>
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                SANIMA BANK QR
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* QR Image Display */}
              <div className="bg-white p-4 rounded-lg shadow-xl text-center space-y-2 max-w-xs mx-auto md:mx-0 border-4 border-zinc-800">
                <img
                  src="/images/fonepay_qr.png"
                  alt="R.C. BATTLEGROUND PVT.LTD. Fonepay QR Code"
                  className="w-full h-auto object-contain max-h-72 mx-auto rounded"
                />
                <div className="text-[11px] font-bold text-zinc-900 font-sans tracking-wide uppercase">
                  R.C. BATTLEGROUND PVT.LTD.
                </div>
                <div className="text-[10px] text-zinc-600 font-mono">
                  Terminal: 2222110020498148
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-4 text-zinc-300 leading-relaxed text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">MERCHANT ACCOUNT DETAILS</div>
                  <div className="font-bold text-white text-sm">R.C. BATTLEGROUND PVT.LTD.</div>
                  <div className="text-emerald-400 font-bold">Sanima Bank (Chapali Ec Branch)</div>
                  <div className="text-zinc-400 text-[11px]">Terminal ID: <strong>2222110020498148</strong></div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    How to Complete Payment:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-300">
                    <li>Open <strong>Fonepay</strong>, <strong>Sanima Bank App</strong>, <strong>eSewa</strong>, or any Nepal Banking App.</li>
                    <li>Scan the QR code on the left and enter exact amount: <strong className="text-white">Rs. {grandTotalNpr.toLocaleString()} (or <PriceDisplay usd={grandTotalUsd} />)</strong></li>
                    <li>Complete the transaction and <strong>take a screenshot</strong> of the payment confirmation receipt.</li>
                    <li>Upload your receipt screenshot in the box below to complete booking.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Payment Proof Screenshot Upload Box */}
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-white font-bold uppercase text-xs">
                  4. Upload Payment Receipt Screenshot *
                </label>
                <span className="text-[10px] text-zinc-400 uppercase">PNG, JPG, WEBP (Max 8MB)</span>
              </div>

              {paymentScreenshot ? (
                <div className="bg-zinc-900 border border-emerald-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Payment Screenshot Attached</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaymentScreenshot('')}
                      className="text-zinc-400 hover:text-white text-xs font-mono flex items-center space-x-1 uppercase"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Screenshot</span>
                    </button>
                  </div>
                  <div className="relative aspect-video max-h-56 bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
                    <img src={paymentScreenshot} alt="Payment Proof Screenshot Preview" className="max-h-56 object-contain" />
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/70 bg-zinc-900/40 hover:bg-zinc-900/80 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2">
                  <Upload className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <div className="font-bold text-white uppercase text-xs">CLICK TO UPLOAD PAYMENT SCREENSHOT</div>
                  <div className="text-[11px] text-zinc-500 font-mono">Or drag & drop receipt screenshot file here</div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Transaction Reference / Remarks (Optional) */}
              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  Payment Transaction Ref / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sanima Txn # 222211... or Fonepay Ref Code"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full mono-input text-xs"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-6 font-mono text-xs h-fit">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white border-b border-zinc-800 pb-3">
            BOOKING SUMMARY ({cart.length})
          </h3>

          {/* Cart Vehicle Items List */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-zinc-900">
            {cart.map((item) => (
              <div key={item.product_id} className="pt-3 first:pt-0 flex items-center space-x-3">
                <img
                  src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=150&q=80'}
                  alt={item.name}
                  className="w-14 h-14 object-cover bg-zinc-900 border border-zinc-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold line-clamp-1 text-xs">{item.name}</div>
                  <div className="text-zinc-400 text-[10px] line-clamp-1 mt-0.5">{item.description || 'RC Vehicle'}</div>
                  <div className="text-zinc-500 text-[10px] mt-0.5">
                    Qty: {item.quantity} × <PriceDisplay usd={item.price} />
                  </div>
                </div>
                <div className="text-white font-bold text-xs shrink-0">
                  <PriceDisplay usd={item.quantity * item.price} />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-2 text-zinc-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span><PriceDisplay usd={cartTotal} /></span>
            </div>

            <div className="flex justify-between">
              <span>Trackside Express Shipping</span>
              <span className="text-white font-bold">{shippingCost === 0 ? 'FREE' : <PriceDisplay usd={shippingCost} />}</span>
            </div>

            {pointsToRedeem > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Reward Points Discount</span>
                <span>-<PriceDisplay usd={discountFromPoints} /></span>
              </div>
            )}

            <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-zinc-800">
              <span>Grand Total</span>
              <div className="text-right">
                <div className="text-emerald-400 text-lg">Rs. {grandTotalNpr.toLocaleString()}</div>
                <div className="text-zinc-500 text-[10px] font-normal">(<PriceDisplay usd={grandTotalUsd} />)</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mono-btn-primary py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500 transition-all shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SUBMITTING BOOKING...</span>
              </>
            ) : (
              <>
                <span>COMPLETE BOOKING & SUBMIT RECEIPT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Booking Success Modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => navigate('/profile')} />

          <div className="relative bg-zinc-950 border border-emerald-800 text-white w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 font-mono text-xs space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black uppercase text-white tracking-wide">BOOKING SUBMITTED!</h2>
              <div className="text-emerald-400 font-bold text-sm">Order #{bookingSuccessModal.order_number}</div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                Your RC vehicle booking has been logged and product stock has been reserved. Admin will review your Fonepay QR payment screenshot proof shortly.
              </p>
            </div>

            {/* Vehicle Summary Box */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <div className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Booked Vehicles</div>
              {(bookingSuccessModal.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 border-b border-zinc-800/80 pb-2 last:border-0 last:pb-0">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover bg-zinc-950 border border-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{item.name}</div>
                    <div className="text-zinc-400 text-[10px]">Qty: {item.quantity} × <PriceDisplay usd={item.unit_price} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="mono-btn-secondary flex-1 py-3 text-xs text-center uppercase"
              >
                CONTINUE SHOPPING
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="mono-btn-primary flex-1 py-3 text-xs text-center uppercase font-bold"
              >
                VIEW MY BOOKINGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
