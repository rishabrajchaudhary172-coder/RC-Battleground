import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { Sun, Moon, DollarSign, User, Shield, Award, Crown, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { currency, toggleCurrency, exchangeRate } = useCurrency();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Settings</h1>
        <p className="text-muted text-sm">Customize your RC Battleground experience.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Appearance</h2>
        <div className="card p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <div>
              <div className="font-semibold text-primary">Theme</div>
              <div className="text-sm text-muted">{isDark ? 'Dark mode active' : 'Light mode active'}</div>
            </div>
          </div>
          <button onClick={toggleTheme} className="mono-btn-secondary py-2 px-5 text-xs">
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Currency</h2>
        <div className="card p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <div className="font-semibold text-primary">Display Currency</div>
              <div className="text-sm text-muted">Currently showing {currency} · Rate: 1 USD = Rs. {exchangeRate}</div>
            </div>
          </div>
          <button onClick={toggleCurrency} className="mono-btn-secondary py-2 px-5 text-xs">
            Switch to {currency === 'USD' ? 'NPR' : 'USD'}
          </button>
        </div>
      </section>

      {user && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Profile</h2>
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent text-accent-fg flex items-center justify-center font-bold text-lg">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-bold text-primary">{user.full_name}</div>
                <div className="text-sm text-muted">{user.email}</div>
                <div className="text-xs text-muted capitalize mt-0.5">{user.role} account</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link to="/profile" className="flex items-center justify-between p-4 border border-border hover:border-accent transition-colors text-sm">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Profile & Orders</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
              <Link to="/rewards" className="flex items-center justify-between p-4 border border-border hover:border-accent transition-colors text-sm">
                <span className="flex items-center gap-2"><Award className="w-4 h-4" /> Reward Points</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
              <Link to="/membership" className="flex items-center justify-between p-4 border border-border hover:border-accent transition-colors text-sm">
                <span className="flex items-center gap-2"><Crown className="w-4 h-4" /> Membership</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
            </div>
            {user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 text-sm text-accent hover:underline">
                <Shield className="w-4 h-4" /> Go to Admin Dashboard
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
