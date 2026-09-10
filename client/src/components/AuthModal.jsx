import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, MapPin, AlertCircle, ShieldCheck, CheckCircle2, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+977', flag: '🇳🇵', label: 'Nepal (+977)' },
  { code: '+1', flag: '🇺🇸', label: 'USA/Canada (+1)' },
  { code: '+91', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+44', flag: '🇬🇧', label: 'UK (+44)' },
];

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'forgot' | 'reset'
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationMsg, setVerificationMsg] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Country Code State
  const [selectedCountry, setSelectedCountry] = useState('+977');
  const [phoneRaw, setPhoneRaw] = useState('');
  
  // Forgot Password State
  const [forgotInput, setForgotInput] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const getFullPhone = () => {
    if (!phoneRaw.trim()) return '';
    const cleaned = phoneRaw.trim().replace(/^\+977/, '').replace(/^\+/, '');
    return `${selectedCountry} ${cleaned}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const fullPhone = getFullPhone();
        const payload = { ...formData, phone: fullPhone };
        await register(payload);
        onClose();
        return;
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
      setError('Please enter the 6-digit verification code.');
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
      if (res.otp_code) setOtpCode(res.otp_code);
      setVerificationMsg(res.message || 'A new verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  // Forgot Password Request
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setError('Please enter your registered email address or phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let finalInput = forgotInput.trim();
      if (!finalInput.includes('@') && !finalInput.startsWith('+')) {
        finalInput = `${selectedCountry} ${finalInput.replace(/^\+977/, '')}`;
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_phone: finalInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password recovery failed');

      if (data.otp_code) setResetOtp(data.otp_code);
      setSuccessMsg(data.message || 'A 6-digit reset OTP has been dispatched.');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'User account not found');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim() || !newPassword.trim()) {
      setError('Please enter the 6-digit OTP and your new password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let finalInput = forgotInput.trim();
      if (!finalInput.includes('@') && !finalInput.startsWith('+')) {
        finalInput = `${selectedCountry} ${finalInput.replace(/^\+977/, '')}`;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_phone: finalInput,
          otp_code: resetOtp.trim(),
          new_password: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      setSuccessMsg('🎉 Password reset successfully! You can now sign in with your new password.');
      setStep('form');
      setIsRegister(false);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('form');
    setError('');
    setSuccessMsg('');
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
      <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 font-sans rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* STEP 1: VERIFY OTP (Registration Verification) */}
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
                Verification code dispatched to <span className="text-white font-bold">{verificationEmail}</span>.
              </p>
            </div>

            {verificationMsg && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-start space-x-2 rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{verificationMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  6-Digit OTP Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full text-center text-2xl tracking-[0.4em] font-mono mono-input py-3 uppercase border-zinc-700 bg-zinc-900 text-white font-bold rounded-lg"
                />
              </div>

              <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-3 border border-zinc-800/80 rounded-lg space-y-1">
                <div>📧 <span className="text-zinc-200">Personal Email:</span> Open email on device or enter the 6-digit OTP above!</div>
                <div>🇳🇵 <span className="text-zinc-200 font-bold">Quick OTP:</span> Code is automatically filled above for instant entry.</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest rounded-lg"
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
                <RefreshCw className="w-3.5 h-3.5" /> Resend Code
              </button>
            </div>
          </div>
        ) : step === 'forgot' ? (
          /* STEP 2: FORGOT PASSWORD REQUEST */
          <div className="space-y-5 font-mono">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600/20 text-red-500 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-mono font-bold text-base uppercase tracking-widest text-white">
                RECOVER ACCOUNT PASSWORD
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your registered Email Address or Phone Number to receive a 6-digit Reset OTP.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestResetOtp} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  Registered Email Address OR Phone Number
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="yourname@gmail.com or 9768532969"
                    value={forgotInput}
                    onChange={(e) => { setForgotInput(e.target.value); setError(''); }}
                    className="w-full mono-input pl-10 rounded-lg"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              {/* Country selector helper if entering phone */}
              {!forgotInput.includes('@') && (
                <div className="flex items-center space-x-2 text-[11px] text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800">
                  <span>Country Prefix:</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-black text-white px-2 py-1 border border-zinc-700 rounded font-bold"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest rounded-lg"
              >
                {loading ? 'SENDING RESET CODE...' : 'DISPATCH PASSWORD RESET OTP'}
              </button>
            </form>

            <button
              type="button"
              onClick={resetState}
              className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs transition-colors pt-2 border-t border-zinc-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>
        ) : step === 'reset' ? (
          /* STEP 3: CONFIRM RESET PASSWORD */
          <div className="space-y-5 font-mono">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600/20 text-emerald-500 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-mono font-bold text-base uppercase tracking-widest text-white">
                SET NEW PASSWORD
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter the 6-digit OTP code sent to {forgotInput} and choose a new password.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs flex items-start space-x-2 rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  6-Digit Reset OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={resetOtp}
                  onChange={(e) => { setResetOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full text-center text-xl tracking-[0.3em] mono-input py-2.5 bg-zinc-900 font-bold text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[11px] mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    className="w-full mono-input pl-10 rounded-lg"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest rounded-lg"
              >
                {loading ? 'RESETTING PASSWORD...' : 'UPDATE PASSWORD & SIGN IN'}
              </button>
            </form>

            <button
              type="button"
              onClick={resetState}
              className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs transition-colors pt-2 border-t border-zinc-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Return to Sign In
            </button>
          </div>
        ) : (
          /* STEP 4: SIGN IN / REGISTER FORM */
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-zinc-800 mb-6 font-mono text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-center transition-colors ${!isRegister ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-center transition-colors ${isRegister ? 'text-white border-b-2 border-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Create Account
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-white text-black font-black text-2xl flex items-center justify-center mx-auto mb-2 rounded-lg">
                RC
              </div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest">
                {isRegister ? 'DRIVER REGISTRATION' : 'DRIVER SIGN IN'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                {isRegister ? 'Create your driver account with personal email & phone.' : 'Access your battleground profile and saved telemetry.'}
              </p>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs flex items-center space-x-2 font-mono rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2 font-mono rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Credentials Assistant */}
            {!isRegister && (
              <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 font-mono text-[11px] space-y-2 rounded-lg">
                <div className="text-zinc-400 font-bold uppercase text-[10px]">Quick Demo Sign In:</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'buyer@rcbattleground.com', password: 'buyer123' });
                      setError('');
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition-colors uppercase text-[10px] rounded"
                  >
                    Auto-fill Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, email: 'admin@rcbattleground.com', password: 'admin123' });
                      setError('');
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition-colors uppercase text-[10px] rounded"
                  >
                    Auto-fill Admin
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {isRegister && (
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Full Name <span className="text-red-400">*</span></label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="e.g. Alex Vance"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full mono-input pl-10 rounded-lg"
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
                    className="w-full mono-input pl-10 rounded-lg"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-400 uppercase">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => { setStep('forgot'); setError(''); }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mono-input pl-10 rounded-lg"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                </div>
              </div>

              {isRegister && (
                <>
                  {/* Phone Number Input with Nepal 🇳🇵 +977 Flag Country Selector */}
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Phone Number (SMS / WhatsApp OTP)</label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-white text-xs px-2.5 py-2 rounded-lg font-bold shrink-0 cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="text"
                          placeholder="9768532969"
                          value={phoneRaw}
                          onChange={(e) => setPhoneRaw(e.target.value)}
                          className="w-full mono-input pl-10 rounded-lg"
                        />
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Shipping Address (Optional)</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="address"
                        placeholder="Kaudhol, Chunikhel, Kathmandu"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full mono-input pl-10 rounded-lg"
                      />
                      <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mono-btn-primary py-3 font-bold text-xs uppercase tracking-widest mt-2 rounded-lg"
              >
                {loading ? 'PROCESSING...' : isRegister ? 'CREATE ACCOUNT & SIGN IN' : 'SIGN IN TO PROFILE'}
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
