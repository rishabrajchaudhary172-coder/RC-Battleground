import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  Home, Grid3X3, Layers, Calendar, Crown, Settings, X,
  User, LogOut, ShieldCheck, Award, Sun, Moon, DollarSign,
  Info, Mail, ChevronRight, Sparkles
} from 'lucide-react';

export default function SideNav({ isOpen, onClose, onOpenAuthModal }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, toggleCurrency } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home Page', icon: Home, badge: null },
    { to: '/catalog', label: 'Vehicle Catalog', icon: Grid3X3, badge: 'HOT' },
    { to: '/categories', label: 'Categories', icon: Layers, badge: null },
    { to: '/events', label: 'Race Events', icon: Calendar, badge: 'LIVE' },
    { to: '/membership', label: 'Membership Plans', icon: Crown, badge: 'PRO' },
    { to: '/rewards', label: 'Reward Points', icon: Award, badge: 'PTS' },
    { to: '/about', label: 'About RC Battleground', icon: Info, badge: null },
    { to: '/contact', label: 'Contact Us', icon: Mail, badge: null },
  ];

  const handleNav = (to) => {
    onClose();
    navigate(to);
  };

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <>
      {/* Full Viewport Dimming Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity duration-300" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Full-Height Top-to-Bottom Viewport Sidebar Box */}
      <aside className={`fixed inset-y-0 left-0 h-screen min-h-screen w-80 sm:w-96 max-w-[95vw] z-50 flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 font-sans border-r ${
        isLight 
          ? 'bg-white text-zinc-900 border-zinc-200' 
          : 'bg-zinc-950 text-white border-zinc-800'
      }`}>
        
        {/* Drawer Header (Fixed at top) */}
        <div className={`shrink-0 p-5 border-b flex items-center justify-between ${
          isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900/90'
        }`}>
          <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white text-black font-black text-xl flex items-center justify-center font-mono ring-1 ring-zinc-400 group-hover:scale-105 transition-transform">
              RC
            </div>
            <div>
              <span className={`font-black text-base uppercase tracking-widest block font-sans ${
                isLight ? 'text-black' : 'text-white'
              }`}>
                BATTLEGROUND
              </span>
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PRECISION GEAR
              </span>
            </div>
          </Link>
          
          <button 
            onClick={onClose} 
            className={`p-2 rounded-md transition-colors ${
              isLight ? 'text-zinc-500 hover:text-black hover:bg-zinc-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`} 
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Navigation Body (Stretches full height between top header and bottom footer) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              NAVIGATION MENU
            </div>

            {navLinks.map(({ to, label, icon: Icon, badge }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  onClick={() => handleNav(to)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                    active 
                      ? 'bg-white text-black font-extrabold shadow-md border border-white' 
                      : isLight
                        ? 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-black' : 'text-emerald-400'}`} />
                    <span>{label}</span>
                  </div>

                  {badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider ${
                      badge === 'LIVE' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                      badge === 'PRO' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      badge === 'HOT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Control Link (If Admin User) */}
            {user && user.role === 'admin' && (
              <button
                onClick={() => handleNav('/admin')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold bg-purple-950/60 text-purple-200 border border-purple-800 hover:bg-purple-900 transition-colors mt-2"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Control Center</span>
                </div>
                <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 font-bold">ADMIN</span>
              </button>
            )}
          </div>

          {/* User Account Telemetry Card */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
              <span>DRIVER ACCOUNT TELEMETRY</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {user ? (
              <div className="space-y-2 pt-1 font-mono">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>{user.full_name}</div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">{user.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                    user.role === 'admin' ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className={`py-2 px-3 text-center text-xs font-bold uppercase tracking-wider border rounded transition-colors flex items-center justify-center space-x-1.5 ${
                      isLight ? 'bg-white border-zinc-300 text-black hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => { logout(); onClose(); navigate('/'); }}
                    className="py-2 px-3 text-center text-xs font-bold uppercase tracking-wider border border-red-900 bg-red-950/40 text-red-300 hover:bg-red-900/60 rounded transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1 font-mono">
                <p className="text-xs text-zinc-400">Sign in to track orders, access Pro passes, & earn reward points.</p>
                <button
                  onClick={() => { onClose(); onOpenAuthModal?.(); }}
                  className="w-full mono-btn-primary py-2.5 text-xs font-bold uppercase tracking-widest"
                >
                  SIGN IN / REGISTER
                </button>
              </div>
            )}
          </div>

          {/* Preferences & Controls Section */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              SYSTEM CONTROLS & PREFERENCES
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className={isLight ? 'text-zinc-700 font-bold' : 'text-zinc-300 font-bold'}>APPEARANCE THEME</span>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-md transition-all ${
                  isLight 
                    ? 'bg-white border-zinc-300 text-black hover:bg-zinc-100' 
                    : 'bg-zinc-950 border-zinc-700 text-white hover:border-white'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className={isLight ? 'text-zinc-700 font-bold' : 'text-zinc-300 font-bold'}>ACTIVE CURRENCY</span>
              <button
                onClick={toggleCurrency}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-md transition-all ${
                  isLight 
                    ? 'bg-white border-zinc-300 text-black hover:bg-zinc-100' 
                    : 'bg-zinc-950 border-zinc-700 text-white hover:border-white'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{currency === 'NPR' ? 'NPR (Rs.)' : 'USD ($)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Notice (Firmly pinned to the bottom of the viewport screen) */}
        <div className={`shrink-0 mt-auto p-4 border-t text-center font-mono text-[10px] uppercase tracking-widest ${
          isLight ? 'border-zinc-200 text-zinc-500 bg-zinc-100' : 'border-zinc-800 text-zinc-500 bg-zinc-950'
        }`}>
          <span>RC BATTLEGROUND TELEMETRY v2.4</span>
        </div>
      </aside>
    </>
  );
}
