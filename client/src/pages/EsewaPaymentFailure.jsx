import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function EsewaPaymentFailure() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status') || 'FAILED';
  const uuid = searchParams.get('transaction_uuid');
  const errorMsg = searchParams.get('error') || 'Payment processing was cancelled or uncompleted.';

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 font-mono space-y-8 text-center">
      <div className="bg-zinc-950 border border-red-900/80 p-8 sm:p-10 space-y-6 shadow-2xl relative">
        <XCircle className="w-16 h-16 text-red-500 mx-auto animate-bounce" />

        <div className="space-y-2">
          <span className="text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 px-3 py-1 uppercase tracking-widest">
            eSEWA PAYMENT TERMINATED
          </span>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider pt-2">
            PAYMENT CANCELLED / FAILED
          </h1>
          <p className="text-xs text-zinc-400">
            {errorMsg.includes('signature')
              ? 'Security signature mismatch detected. Transaction flagged.'
              : 'Your payment attempt was not completed by eSewa.'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span>Result Status:</span>
            <span className="text-red-400 font-bold uppercase">{status}</span>
          </div>
          {uuid && (
            <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
              <span>Transaction UUID:</span>
              <span className="text-white text-[11px] truncate max-w-[200px]">{uuid}</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-400">
            <span>Payment Method:</span>
            <span className="text-white font-bold uppercase">eSewa Mobile Wallet</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/checkout" className="mono-btn-primary py-3.5 px-6 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>RETRY eSEWA PAYMENT</span>
          </Link>
          <Link to="/catalog" className="mono-btn-secondary py-3.5 px-6 text-xs font-bold uppercase flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CATALOG</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
