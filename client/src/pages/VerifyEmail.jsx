import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, refreshUser } = useAuth();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email address from this device...');
  const [manualCode, setManualCode] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email && token) {
      verifyWithToken(email, token);
    } else if (email) {
      setStatus('error');
      setMessage('Please enter the 6-digit verification code sent to your email.');
    } else {
      setStatus('error');
      setMessage('No verification details found in URL. Please check your verification link or log in.');
    }
  }, [email, token]);

  const verifyWithToken = async (userEmail, verifyToken) => {
    try {
      const res = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(userEmail)}&token=${encodeURIComponent(verifyToken)}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem('rc_token', data.token);
        refreshUser();
        setStatus('success');
        setMessage(data.message || 'Email verified successfully! Your account is active.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification link expired or invalid. You can enter your 6-digit OTP code manually below.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Could not connect to verification service. You can enter your 6-digit code manually below.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim() || manualCode.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(email, manualCode);
      if (data && data.token) {
        setStatus('success');
        setMessage('Email verified successfully! Welcome to RC Battleground.');
      }
    } catch (err) {
      setMessage(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const res = await resendOtp(email);
      setResendMsg(res.message || 'A new verification code has been dispatched.');
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 p-8 max-w-md w-full text-center shadow-2xl space-y-6 font-mono">
        <div className="w-16 h-16 bg-red-600/20 text-red-500 border border-red-500/40 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-red-500" />
        </div>

        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">DEVICE EMAIL VERIFICATION</h2>
          <p className="text-xs text-zinc-400 mt-1">RC Battleground Driver Authentication System</p>
        </div>

        {status === 'verifying' && (
          <div className="py-6 space-y-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-300">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>

            <p className="text-xs text-zinc-400">
              Your device has been verified and logged in. You now have full access to high-performance RC vehicles, telemetry tracking, and reward points.
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              ENTER BATTLEGROUND <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>

            {resendMsg && (
              <div className="p-3 bg-zinc-800 border border-zinc-700 text-emerald-400 text-xs">
                {resendMsg}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-zinc-400 text-xs uppercase mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-xl tracking-[0.5em] font-mono mono-input py-3 uppercase border-zinc-700 bg-zinc-950 text-white font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest"
              >
                {loading ? 'VERIFYING...' : 'VERIFY CODE MANUAL ENTRY'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-4 border-t border-zinc-800">
              <Link to="/" className="text-zinc-400 hover:text-white transition-colors">
                Return to Shop
              </Link>
              {email && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
