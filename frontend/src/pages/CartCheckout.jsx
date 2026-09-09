import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Award, Crown, MapPin, CreditCard, Lock, Smartphone, Building, RefreshCw, X } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function CartCheckout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('eSewa Mobile Wallet');

  // Gateway Input States
  const [esewaPhone, setEsewaPhone] = useState('9841234567');
  const [esewaMpin, setEsewaMpin] = useState('1234');

  const [khaltiPhone, setKhaltiPhone] = useState('9801234567');
  const [khaltiPin, setKhaltiPin] = useState('5678');

  const [selectedBank, setSelectedBank] = useState('Nabil Bank Mobile Banking');
  const [bankPhone, setBankPhone] = useState('9851234567');
  const [bankMpin, setBankMpin] = useState('4321');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Modal / Verification Flow States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOtp, setPaymentOtp] = useState('');
  const [modalStep, setModalStep] = useState(1); // 1 = Review & OTP, 2 = Authorizing

  // Reward Points States
  const [rewardSettings, setRewardSettings] = useState({ points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 });
  const [userPointsBalance, setUserPointsBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.address) setShippingAddress(user.address);
      if (user.full_name && !cardName) setCardName(user.full_name);
      if (user.phone) {
        setEsewaPhone(user.phone);
        setKhaltiPhone(user.phone);
        setBankPhone(user.phone);
      }
    }

    // Fetch reward settings & points
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
  const grandTotal = Math.max(0, cartTotal + shippingCost - discountFromPoints);

  // Form Submit Handler -> Triggers Gateway Authentication Modal
  const handleInitiateCheckout = (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to place an order.');
      return;
    }
    if (cart.length === 0) return;
    if (!shippingAddress.trim()) {
      setError('Please provide a valid shipping address.');
      return;
    }

    // Validate Gateway Fields before opening modal
    if (paymentMethod === 'eSewa Mobile Wallet') {
      if (!esewaPhone || !esewaMpin) {
        setError('Please enter your eSewa Registered Phone Number and 4-digit MPIN.');
        return;
      }
    } else if (paymentMethod === 'Khalti Digital Wallet') {
      if (!khaltiPhone || !khaltiPin) {
        setError('Please enter your Khalti Phone Number and Transaction PIN.');
        return;
      }
    } else if (paymentMethod === 'Mobile Banking / Fonepay') {
      if (!bankPhone || !bankMpin) {
        setError('Please enter your Bank Registered Mobile Number and MPIN.');
        return;
      }
    } else if (paymentMethod === 'Debit & Credit Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError('Please complete all card details (Card Number, Expiry, CVV).');
        return;
      }
    }

    setError('');
    // Open gateway modal
    setShowPaymentModal(true);
    setModalStep(1);
    setPaymentOtp('');
  };

  // Final Order Execution Call to Backend API
  const handleExecutePayment = async () => {
    setLoading(true);
    setError('');
    setModalStep(2); // Show processing spinner inside modal

    try {
      let finalMethodName = paymentMethod;
      if (paymentMethod === 'eSewa Mobile Wallet') {
        finalMethodName = `eSewa Direct (${esewaPhone})`;
      } else if (paymentMethod === 'Khalti Digital Wallet') {
        finalMethodName = `Khalti Pay (${khaltiPhone})`;
      } else if (paymentMethod === 'Mobile Banking / Fonepay') {
        finalMethodName = `Fonepay - ${selectedBank} (${bankPhone})`;
      } else if (paymentMethod === 'Debit & Credit Card') {
        finalMethodName = `Card Payment (${cardNumber.slice(-4)})`;
      }

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          shipping_address: shippingAddress,
          payment_method: finalMethodName,
          points_to_redeem: pointsToRedeem
        })
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        setCompletedOrder(data.order);
        setShowPaymentModal(false);
        refreshUser();
      } else {
        setError(data.error || 'Failed to place order');
        setShowPaymentModal(false);
      }
    } catch (err) {
      setError('Server error during payment checkout');
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 font-sans space-y-8">
        <div className="bg-zinc-950 border border-white p-8 space-y-6 text-center shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-white font-mono tracking-wider">ORDER CONFIRMED & DISPATCHED!</h2>
            <div className="text-xs font-mono text-zinc-400">Order Reference: <span className="text-white font-bold">{completedOrder.order_number}</span></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 text-left font-mono text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between text-zinc-400">
              <span>Status:</span>
              <span className="text-emerald-400 uppercase font-bold">{completedOrder.status}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Payment Gateway:</span>
              <span className="text-white uppercase font-bold">{completedOrder.payment_method}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Total Paid:</span>
              <span className="text-white font-bold"><PriceDisplay usd={completedOrder.total_amount} /></span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Points Earned:</span>
              <span className="text-emerald-400 font-bold">+{completedOrder.points_earned} PTS</span>
            </div>
            {completedOrder.points_redeemed > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Points Redeemed:</span>
                <span className="text-amber-400 font-bold">-{completedOrder.points_redeemed} PTS</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center space-x-4 font-mono">
            <Link to="/profile" className="mono-btn-primary py-3 px-6 text-xs font-bold uppercase">
              VIEW MY ORDERS & DASHBOARD
            </Link>
            <Link to="/catalog" className="mono-btn-secondary py-3 px-6 text-xs font-bold uppercase">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
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
      <div className="border-b border-zinc-800 pb-6">
        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">FINAL CHECKOUT & TELEMETRY</div>
        <h1 className="text-3xl font-black uppercase text-white tracking-wide">
          CHECKOUT & DISPATCH
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 font-mono text-xs">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleInitiateCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-white" />
              <span>Shipping & Delivery Destination</span>
            </h3>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Full Delivery Address</label>
              <textarea
                rows={3}
                required
                placeholder="Street address, Trackside sector, Zip code..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full mono-input"
              />
            </div>
          </div>

          {/* Reward Points Redemption Slider */}
          {token && userPointsBalance > 0 && (
            <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-white" />
                  <span>Redeem Reward Points Discount</span>
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

          {/* Payment Method Selector */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-5 font-mono text-xs">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <CreditCard className="w-4 h-4 text-white" />
              <span>Select Payment Gateway</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* eSewa Option */}
              <label className={`p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${paymentMethod === 'eSewa Mobile Wallet' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'eSewa Mobile Wallet'}
                    onChange={() => setPaymentMethod('eSewa Mobile Wallet')}
                    className="accent-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-white uppercase flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      eSewa Direct
                    </div>
                    <div className="text-[10px] text-zinc-400">Nepali Mobile Wallet & Real-time MPIN</div>
                  </div>
                </div>
              </label>

              {/* Khalti Option */}
              <label className={`p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${paymentMethod === 'Khalti Digital Wallet' ? 'bg-purple-950/40 border-purple-500 text-purple-300 ring-1 ring-purple-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Khalti Digital Wallet'}
                    onChange={() => setPaymentMethod('Khalti Digital Wallet')}
                    className="accent-purple-500"
                  />
                  <div>
                    <div className="font-bold text-white uppercase flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                      Khalti Pay
                    </div>
                    <div className="text-[10px] text-zinc-400">Digital Wallet & Web Authorization</div>
                  </div>
                </div>
              </label>

              {/* Mobile Banking / Fonepay Option */}
              <label className={`p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${paymentMethod === 'Mobile Banking / Fonepay' ? 'bg-blue-950/40 border-blue-500 text-blue-300 ring-1 ring-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Mobile Banking / Fonepay'}
                    onChange={() => setPaymentMethod('Mobile Banking / Fonepay')}
                    className="accent-blue-500"
                  />
                  <div>
                    <div className="font-bold text-white uppercase flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                      Mobile Banking
                    </div>
                    <div className="text-[10px] text-zinc-400">Fonepay & Nepali Bank MPIN</div>
                  </div>
                </div>
              </label>

              {/* Debit / Credit Card Option */}
              <label className={`p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${paymentMethod === 'Debit & Credit Card' ? 'bg-zinc-900 border-white text-white ring-1 ring-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Debit & Credit Card'}
                    onChange={() => setPaymentMethod('Debit & Credit Card')}
                    className="accent-white"
                  />
                  <div>
                    <div className="font-bold text-white uppercase flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                      Debit / Credit Card
                    </div>
                    <div className="text-[10px] text-zinc-400">Visa, MasterCard, SCT & 3D Secure</div>
                  </div>
                </div>
              </label>

            </div>

            {/* Dynamic Interactive Gateway Input Fields */}
            
            {/* eSewa Inputs */}
            {paymentMethod === 'eSewa Mobile Wallet' && (
              <div className="p-5 bg-emerald-950/30 border border-emerald-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                  <div className="text-emerald-300 font-bold uppercase text-[11px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    eSewa Direct Payment Credentials
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 font-bold">REAL-TIME MERCH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">eSewa ID / Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="98XXXXXXXX"
                        value={esewaPhone}
                        onChange={(e) => setEsewaPhone(e.target.value)}
                        className="w-full mono-input pl-9 bg-zinc-950 border-emerald-900 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">eSewa MPIN (4 Digits)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="****"
                        value={esewaMpin}
                        onChange={(e) => setEsewaMpin(e.target.value)}
                        className="w-full mono-input pl-9 bg-zinc-950 border-emerald-900 text-white font-bold tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-400/80 italic flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Interactive OTP SMS step will execute upon clicking Place Order.</span>
                </div>
              </div>
            )}

            {/* Khalti Inputs */}
            {paymentMethod === 'Khalti Digital Wallet' && (
              <div className="p-5 bg-purple-950/30 border border-purple-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                  <div className="text-purple-300 font-bold uppercase text-[11px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                    Khalti Wallet Credentials
                  </div>
                  <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 border border-purple-800 font-bold">KHALTI GATEWAY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">Khalti Registered ID</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="98XXXXXXXX"
                        value={khaltiPhone}
                        onChange={(e) => setKhaltiPhone(e.target.value)}
                        className="w-full mono-input pl-9 bg-zinc-950 border-purple-900 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">Khalti Transaction PIN</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="****"
                        value={khaltiPin}
                        onChange={(e) => setKhaltiPin(e.target.value)}
                        className="w-full mono-input pl-9 bg-zinc-950 border-purple-900 text-white font-bold tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fonepay Mobile Banking Inputs */}
            {paymentMethod === 'Mobile Banking / Fonepay' && (
              <div className="p-5 bg-blue-950/30 border border-blue-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                  <div className="text-blue-300 font-bold uppercase text-[11px] flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    Mobile Banking / Fonepay Direct Portal
                  </div>
                  <span className="text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 border border-blue-800 font-bold">FONEPAY VERIFIED</span>
                </div>

                <div>
                  <label className="block text-zinc-300 text-[10px] uppercase mb-1">Select Bank Mobile App</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full mono-input bg-zinc-950 border-blue-900 text-white font-bold"
                  >
                    <option>Nabil Bank Mobile Banking</option>
                    <option>Global IME Bank Mobile App</option>
                    <option>NIC Asia MoBank</option>
                    <option>Everest Bank Mobile App</option>
                    <option>Nepal Investment Mega Bank</option>
                    <option>Standard Chartered Nepal</option>
                    <option>Prabhu Bank Mobile App</option>
                    <option>Sanima Bank Mobile App</option>
                    <option>NMB Bank Mobile Banking</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">Bank Mobile Number</label>
                    <input
                      type="text"
                      required
                      placeholder="98XXXXXXXX"
                      value={bankPhone}
                      onChange={(e) => setBankPhone(e.target.value)}
                      className="w-full mono-input bg-zinc-950 border-blue-900 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-[10px] uppercase mb-1">Bank App MPIN (4 Digits)</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="****"
                      value={bankMpin}
                      onChange={(e) => setBankMpin(e.target.value)}
                      className="w-full mono-input bg-zinc-950 border-blue-900 text-white font-bold tracking-widest"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Debit & Credit Card Inputs */}
            {paymentMethod === 'Debit & Credit Card' && (
              <div className="p-5 bg-zinc-900 border border-zinc-700 space-y-4">
                <div className="text-white font-bold uppercase text-[11px] flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span>Card Authorization & 3D Secure</span>
                  <span className="text-[10px] text-zinc-400 font-mono">VISA / MASTERCARD</span>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="FULL NAME ON CARD"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full mono-input bg-zinc-950 border-zinc-800 text-white uppercase"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Card Number (16 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full mono-input bg-zinc-950 border-zinc-800 text-white font-bold tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase mb-1">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full mono-input bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase mb-1">CVV Security Code</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="***"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full mono-input bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-6 font-mono text-xs h-fit">
          <h3 className="font-bold text-sm uppercase tracking-widest text-white border-b border-zinc-800 pb-3">
            ORDER SUMMARY ({cart.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product_id} className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                <div>
                  <div className="text-white font-bold line-clamp-1">{item.name}</div>
                  <div className="text-zinc-500 text-[10px]">Qty: {item.quantity} × <PriceDisplay usd={item.price} /></div>
                </div>
                <div className="text-white font-bold"><PriceDisplay usd={item.quantity * item.price} /></div>
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
              <span>Final Total</span>
              <span><PriceDisplay usd={grandTotal} /></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mono-btn-primary py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2"
          >
            <span>PROCEED TO GATEWAY VERIFICATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* REAL-TIME INTERACTIVE PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => !loading && setShowPaymentModal(false)} />

          <div className="relative bg-zinc-950 border border-zinc-700 text-white w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 font-mono text-xs space-y-6">
            
            {/* Modal Header per Gateway */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                {paymentMethod === 'eSewa Mobile Wallet' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center text-xs">
                    eS
                  </div>
                )}
                {paymentMethod === 'Khalti Digital Wallet' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                    KP
                  </div>
                )}
                {paymentMethod === 'Mobile Banking / Fonepay' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                    FP
                  </div>
                )}
                {paymentMethod === 'Debit & Credit Card' && (
                  <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
                    3D
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    {paymentMethod === 'eSewa Mobile Wallet' && 'eSewa Merchant Gateway'}
                    {paymentMethod === 'Khalti Digital Wallet' && 'Khalti Authorization Portal'}
                    {paymentMethod === 'Mobile Banking / Fonepay' && `${selectedBank} - Fonepay`}
                    {paymentMethod === 'Debit & Credit Card' && 'Visa / Mastercard 3D Secure'}
                  </h3>
                  <div className="text-[10px] text-zinc-400">Merchant: RC BATTLEGROUND NEPAL</div>
                </div>
              </div>

              <button 
                onClick={() => !loading && setShowPaymentModal(false)} 
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalStep === 1 ? (
              <div className="space-y-5">
                {/* Transaction Summary Box */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>Target Account:</span>
                    <span className="text-white font-bold">
                      {paymentMethod === 'eSewa Mobile Wallet' && `eSewa ID: ${esewaPhone}`}
                      {paymentMethod === 'Khalti Digital Wallet' && `Khalti ID: ${khaltiPhone}`}
                      {paymentMethod === 'Mobile Banking / Fonepay' && `Mobile: ${bankPhone}`}
                      {paymentMethod === 'Debit & Credit Card' && `Card: **** **** **** ${cardNumber.slice(-4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Payable Total:</span>
                    <span className="text-emerald-400 font-black text-sm"><PriceDisplay usd={grandTotal} /></span>
                  </div>
                </div>

                {/* OTP Input & Auto-fill Action */}
                <div className="space-y-3">
                  <div className="text-zinc-300 text-xs">
                    Enter the 6-Digit SMS Verification Security Code (OTP) sent to your registered mobile number:
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="684291"
                      value={paymentOtp}
                      onChange={(e) => setPaymentOtp(e.target.value)}
                      className="w-full mono-input bg-black border-zinc-700 text-white font-bold text-center tracking-[0.5em] text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setPaymentOtp('684291')}
                      className="shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-3 py-2 text-[10px] uppercase font-bold"
                    >
                      AUTO-FILL OTP
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="mono-btn-secondary py-2.5 px-4 text-xs font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    className="mono-btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>CONFIRM & EXECUTE PAYMENT</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Processing Spinner */
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                <div className="font-bold text-sm text-white uppercase tracking-widest">
                  AUTHORIZING & PROCCESSING PAYMENT...
                </div>
                <div className="text-zinc-500 text-xs">Communicating with payment gateway server...</div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
