import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 shadow-2xl space-y-6">
        <div>
          <Link to="/" className="inline-flex items-center space-x-1 font-mono text-xs text-zinc-500 hover:text-white uppercase mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Buyer Store</span>
          </Link>
          
          <div className="w-12 h-12 bg-white text-black font-black text-2xl flex items-center justify-center mb-3">
            RC
          </div>
          <h1 className="text-xl font-black uppercase text-white font-mono tracking-widest flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>ADMINISTRATOR PORTAL</span>
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Restricted access for system administrators & inventory managers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-zinc-400 uppercase mb-1">Admin Email</label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mono-input pl-10"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mono-btn-primary py-3 font-bold uppercase tracking-widest text-xs"
          >
            {loading ? 'AUTHENTICATING ADMIN...' : 'ENTER ADMIN DASHBOARD'}
          </button>
        </form>


      </div>
    </div>
  );
}
