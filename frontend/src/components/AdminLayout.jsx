import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo_rc_battleground.png';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  Crown, 
  FileText, 
  LogOut, 
  Store, 
  ShieldCheck,
  Calendar,
  MessageSquare,
  CreditCard
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Guard admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-zinc-950 border border-zinc-800 text-center font-mono space-y-4">
        <ShieldCheck className="w-12 h-12 text-white mx-auto" />
        <h2 className="text-lg font-bold text-white uppercase">ADMIN PRIVILEGES REQUIRED</h2>
        <p className="text-xs text-zinc-400">You must log in with an administrator account to access this section.</p>
        <Link to="/admin/login" className="mono-btn-primary text-xs inline-block">
          GO TO ADMIN LOGIN
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Sellers', path: '/admin/products', icon: Package },
    { label: 'Manage Race Events', path: '/admin/events', icon: Calendar },
    { label: 'Review Collection', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Buyers & Users', path: '/admin/buyers', icon: Users },
    { label: 'Orders & Bookings', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Payments & Email Logs', path: '/admin/payments', icon: CreditCard },
    { label: 'Manage Admin Accounts', path: '/admin/admins', icon: ShieldCheck },
    { label: 'Membership & Rewards', path: '/admin/settings', icon: Crown },
    { label: 'Edit Site Content', path: '/admin/content', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-zinc-900">
            <Link to="/" className="flex items-center space-x-3 mb-2" title="Logo RC-battle ground">
              <img
                src={logoImg || "/logo_rc_battleground.png"}
                alt="Logo RC-battle ground"
                className="w-8 h-8 object-contain filter drop-shadow-md brightness-110"
                onError={(e) => { e.target.onerror = null; e.target.src = '/logo_rc_battleground.png'; }}
              />
              <span className="font-black text-sm uppercase tracking-widest text-white font-mono">ADMIN PORTAL</span>
            </Link>
            <div className="text-[11px] font-mono text-zinc-400 truncate">
              {user.email}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 font-mono text-xs uppercase font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-3 transition-colors ${isActive ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-zinc-900 space-y-2 font-mono text-xs">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-white transition-colors border-t border-zinc-900 pt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
