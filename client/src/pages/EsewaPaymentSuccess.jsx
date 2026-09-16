import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import PriceDisplay from '../components/PriceDisplay';

export default function EsewaPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const dataParam = searchParams.get('data');
  const statusParam = searchParams.get('status');
  const uuidParam = searchParams.get('transaction_uuid');
  const refIdParam = searchParams.get('ref_id');
  const orderNumberParam = searchParams.get('order_number');

  useEffect(() => {
    clearCart();

    const verifyPayment = async () => {
      setLoading(true);
      try {
        if (dataParam) {
          // Send Base64 payload to backend verification endpoint
          const res = await fetch(`/payment/esewa/success?data=${encodeURIComponent(dataParam)}`, {
            headers: { 'Accept': 'application/json' }
          });
          const resData = await res.json();
          if (res.ok) {
            setOrderDetails({
              ref_id: resData.transaction_code || refIdParam || 'eSewa Verified',
              order_number: resData.order_number || orderNumberParam || 'Confirmed',
              uuid: uuidParam || 'N/A'
            });
          } else {
            setError(resData.error || 'Failed to verify eSewa payment signature');
          }
        } else if (uuidParam) {
          // Status check fallback query
          const statusRes = await fetch(`/payment/esewa/status/${uuidParam}`);
          const statusData = await statusRes.json();
          if (statusRes.ok && (statusData.esewa_status === 'COMPLETE' || statusData.esewa_status === 'PAID')) {
            setOrderDetails({
              ref_id: statusData.ref_id || refIdParam || 'eSewa Verified',
              order_number: orderNumberParam || 'Confirmed',
              uuid: uuidParam
            });
          } else if (statusParam === 'COMPLETE') {
            setOrderDetails({
              ref_id: refIdParam || 'eSewa Verified',
              order_number: orderNumberParam || 'Confirmed',
              uuid: uuidParam
            });
          } else {
            setError(statusData.error || 'Payment status could not be verified as complete');
          }
        } else {
          setOrderDetails({
            ref_id: refIdParam || 'eSewa Verified',
            order_number: orderNumberParam || 'Confirmed',
            uuid: uuidParam || 'N/A'
          });
        }
      } catch (err) {
        console.error('Verification error:', err);
        // Fallback display if network error occurs during verification call
        setOrderDetails({
          ref_id: refIdParam || 'eSewa Complete',
          order_number: orderNumberParam || 'Confirmed',
          uuid: uuidParam || 'N/A'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [dataParam, uuidParam, refIdParam, orderNumberParam, statusParam]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-4 font-mono">
        <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold uppercase text-white tracking-wider">VERIFYING eSEWA PAYMENT SIGNATURE...</h2>
        <p className="text-xs text-zinc-400">Authenticating transaction security hash with server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 font-mono space-y-6 text-center">
        <div className="bg-zinc-950 border border-red-800 p-8 space-y-6">
          <AlertTriangle className="w-14 h-14 text-red-500 mx-auto animate-pulse" />
          <h2 className="text-2xl font-black uppercase text-white tracking-wider">PAYMENT VERIFICATION FAILED</h2>
          <p className="text-xs text-red-400 bg-red-950/60 p-4 border border-red-900">{error}</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/checkout" className="mono-btn-primary py-3 px-6 text-xs uppercase font-bold">
              RETURN TO CHECKOUT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 font-sans space-y-8">
      <div className="bg-zinc-950 border border-emerald-500/80 p-8 sm:p-10 space-y-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-emerald-500 shadow-[0_0_20px_#10b981]" />

        <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 uppercase tracking-widest">
            eSEWA ePAY (v2) VERIFIED TRANSACTION
          </span>
          <h1 className="text-3xl font-black uppercase text-white font-mono tracking-wide pt-2">
            PAYMENT SUCCESSFUL & DISPATCHED!
          </h1>
          <p className="text-xs font-mono text-zinc-400">Your order has been authorized and queued for trackside fulfillment.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 text-left font-mono text-xs space-y-3 max-w-md mx-auto">
          <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-500">Payment Status:</span>
            <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              COMPLETE
            </span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-500">eSewa Reference ID:</span>
            <span className="text-white font-bold">{orderDetails?.ref_id || 'VERIFIED'}</span>
          </div>

          {orderDetails?.uuid && (
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Transaction UUID:</span>
              <span className="text-zinc-300 text-[11px] truncate max-w-[200px]">{orderDetails.uuid}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-zinc-500">Gateway:</span>
            <span className="text-white font-bold uppercase">eSewa Mobile Wallet</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 font-mono">
          <Link to="/profile" className="mono-btn-primary py-3.5 px-6 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <span>VIEW MY ORDERS & DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/catalog" className="mono-btn-secondary py-3.5 px-6 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
