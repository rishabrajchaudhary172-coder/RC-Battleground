import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, MapPin, AlertCircle, ShieldCheck, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationMsg, setVerificationMsg] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(formData);
        if (res && res.requires_verification) {
          setVerificationEmail(res.email || formData.email);
          setVerificationMsg(res.message || 'A 6-digit code and verification link were sent to your personal email.');
          setStep('verify');
          setLoading(false);
          return;
        }
      } else {
        const res = await login(formData.email, formData.password);
        if (res && res.requires_verification) {
          setVerificationEmail(res.email || formData.email);
          setVerificationMsg(res.message || 'Please verify your email address to activate your account.');
          setStep('verify');
          setLoading(false);
          return;
        }
      }
      onClose();
    } catch (err) {
      if (err.requires_verification) {
        setVerificationEmail(err.email || formData.email);
        setVerificationMsg('Please verify your email address to log in.');
        setStep('verify');
      } else {
        setError(err.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(verificationEmail, otpCode);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const res = await resendOtp(verificationEmail);
      setVerificationMsg(res.message || 'A new verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  const resetState = () => {
    setStep('form');
    setError('');
    setOtpCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'verify' ? (
          <div className="space-y-5 font-mono">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-600/20 text-red-500 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-mono font-bold text-base uppercase tracking-widest text-white">
                DRIVER VERIFICATION
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Verification code dispatched to <span className="text-white font-bold">{verificationEmail}</span>
                {formData.phone && <span> / <span className="text-white font-bold">{formData.phone}</span></span>}.
              </p>
            </div>

            {verificationMsg && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{verificationMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  6-Digit OTP Verification Code (Email / Phone SMS)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full text-center text-xl tracking-[0.5em] font-mono mono-input py-3 uppercase border-zinc-700 bg-zinc-900 text-white font-bold"
                />
              </div>

              <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-2.5 border border-zinc-800/80 rounded space-y-1">
                <div>📱 <span className="text-zinc-200">Phone SMS:</span> 6-digit OTP dispatched to registered phone number.</div>
                <div>📧 <span className="text-zinc-200">Personal Email:</span> Open email on device to enter OTP or tap 1-Click Link!</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest"
              >
                {loading ? 'VERIFYING CODE...' : 'VERIFY CODE & ENTER BATTLEGROUND'}
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-900">
              <button
                type="button"
                onClick={resetState}
                className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend Code (SMS/Email)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-zinc-800 mb-6 font-mono text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 pb-3 text-center transition-colors ${!isRegister ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 pb-3 text-center transition-colors ${isRegister ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Create Account
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-white text-black font-black text-2xl flex items-center justify-center mx-auto mb-2">
                RC
              </div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest">
                {isRegister ? 'DRIVER REGISTRATION' : 'DRIVER SIGN IN'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                {isRegister ? 'Use your real personal email. Verification required to log in.' : 'Access your battleground profile and saved telemetry.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Credentials Assistant */}
            {!isRegister && (
              <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 font-mono text-[11px] space-y-2">
                <div className="text-zinc-400 font-bold uppercase text-[10px]">Quick Demo Sign In:</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'buyer@rcbattleground.com', password: 'buyer123' });
                      setError('');
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition-colors uppercase text-[10px]"
                  >
                    Auto-fill Buyer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'admin@rcbattleground.com', password: 'admin123' });
                      setError('');
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition-colors uppercase text-[10px]"
                  >
                    Auto-fill Admin Account
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {isRegister && (
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="e.g. Alex Vance"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full mono-input pl-10"
                    />
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 uppercase mb-1">
                  Personal Email Address {isRegister && <span className="text-red-400">*</span>}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mono-input pl-10"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Password</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mono-input pl-10"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Phone Number (Optional)</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full mono-input pl-10"
                      />
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Shipping Address (Optional)</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="address"
                        placeholder="123 Trackside Way"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full mono-input pl-10"
                      />
                      <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest mt-2"
              >
                {loading ? 'PROCESSING...' : isRegister ? 'CREATE ACCOUNT & VERIFY EMAIL' : 'SIGN IN TO PROFILE'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-900 text-center font-mono text-[11px] text-zinc-500">
              Administrator?{' '}
              <a href="/admin/login" className="text-white underline hover:text-zinc-300">
                Access Admin Portal
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
