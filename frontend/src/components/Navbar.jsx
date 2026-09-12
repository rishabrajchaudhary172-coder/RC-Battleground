import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  Award, 
  Crown, 
  Menu, 
  X, 
  Search,
  Zap,
  Flag,
  Flame,
  Home,
  Layers,
  Calendar,
  Info,
  Mail,
  Grid3X3
} from 'lucide-react';
import SideNav from './SideNav';
import logoImg from '../assets/logo_rc_battleground.png';

export default function Navbar({ onOpenAuthModal, onReplayIntro }) {
  const { user, logout } = useAuth();
  const { cartItemCount, wishlistCount, setCartOpen } = useCart();
  const [categories, setCategories] = useState([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide header when scrolling down, reveal when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      if (currentScrollPos > 80 && currentScrollPos > prevScrollPos) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Close menus on route change
  useEffect(() => {
    setCatMenuOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setSideNavOpen(false);
    setNavDropdownOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const exploreLinks = [
    { to: '/', label: 'Home Page', icon: Home },
    { to: '/catalog', label: 'Vehicle Catalog', icon: Grid3X3, badge: 'HOT' },
    { to: '/categories', label: 'Categories', icon: Layers },
    { to: '/events', label: 'Race Events', icon: Calendar, badge: 'LIVE' },
    { to: '/membership', label: 'Membership Plans', icon: Crown, badge: 'PRO' },
    { to: '/rewards', label: 'Reward Points', icon: Award, badge: 'PTS' },
    { to: '/about', label: 'About RC Battleground', icon: Info },
    { to: '/contact', label: 'Contact Us', icon: Mail },
  ];

  const showNav = isVisible || sideNavOpen || mobileMenuOpen || userMenuOpen || navDropdownOpen;

  return (
    <header className={`sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 font-sans transition-transform duration-300 ease-in-out ${
      showNav ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <SideNav isOpen={sideNavOpen} onClose={() => setSideNavOpen(false)} onOpenAuthModal={onOpenAuthModal} />

      {/* Top Banner Notice */}
      <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-1.5 text-center text-xs text-zinc-400 font-mono flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-2 text-[11px] text-zinc-500">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>EXPRESS TRACKSIDE SHIPPING</span>
        </div>

        <div className="flex items-center space-x-2 text-white font-bold mx-auto md:mx-0 text-xs">
          <span>EARN UP TO 2X REWARD POINTS WITH PRO & APEX PASSES</span>
        </div>

        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="hidden sm:flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors text-[11px] uppercase tracking-wider font-mono border border-zinc-800 px-2 py-0.5 bg-zinc-900"
            title="Replay GT3 RS Intro Experience"
          >
            <Flame className="w-3 h-3 text-white" />
            <span>INTRO SPECTACLE</span>
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Top-Left Hamburger Menu, Brand Logo & Explore Dropdown */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={() => setSideNavOpen(true)}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-1.5 font-mono text-xs font-bold uppercase"
              aria-label="Open Primary Navigation Side Menu"
              title="Primary Navigation Side Menu"
            >
              <Menu className="w-6 h-6" />
              <span className="hidden sm:inline">MENU</span>
            </button>

            <Link to="/" className="flex items-center space-x-3 group" title="Logo RC-battle ground">
              <img
                src={logoImg || "/logo_rc_battleground.png"}
                alt="Logo RC-battle ground"
                className="w-11 h-11 object-contain transition-transform group-hover:scale-105 filter drop-shadow-md brightness-110"
                onError={(e) => { e.target.onerror = null; e.target.src = '/logo_rc_battleground.png'; }}
              />
              <div className="flex flex-col">
                <span className="font-black tracking-widest text-lg text-white leading-tight uppercase font-sans">
                  RC BATTLEGROUND
                </span>
                <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                  GOTHATAR-7, KATHMANDU
                </span>
              </div>
            </Link>

            {/* Explore Pages Dropdown Menu */}
            <div className="relative font-mono hidden md:block">
              <button
                onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 px-3 py-1.5 text-xs font-bold text-white rounded transition-colors shadow-sm"
                title="Explore All Pages"
              >
                <span>EXPLORE PAGES</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${navDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {navDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 rounded-xl backdrop-blur-xl">
                  <div className="text-[10px] font-mono text-zinc-500 px-3 py-1.5 font-bold uppercase tracking-wider border-b border-zinc-900 mb-1 flex items-center justify-between">
                    <span>EXPLORE PAGES</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  </div>
                  <div className="space-y-0.5">
                    {exploreLinks.map((link) => {
                      const IconComponent = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setNavDropdownOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                            isActive
                              ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                            <span>{link.label}</span>
                          </div>
                          {link.badge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-900 text-emerald-400 border border-zinc-800 rounded uppercase">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center space-x-5">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <input
                type="text"
                placeholder="Search RC cars, parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-white focus:ring-0 w-44 lg:w-52 transition-all placeholder:text-zinc-500 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5" />
            </form>

            {/* Wishlist Button */}
            <Link to="/wishlist" className="relative p-1.5 text-zinc-400 hover:text-white transition-colors" title="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 text-zinc-400 hover:text-white transition-colors flex items-center space-x-1"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="bg-white text-black font-mono font-bold text-[10px] px-1.5 py-0.5 border border-black">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative font-mono">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white hover:border-zinc-500 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="font-mono truncate max-w-[100px]">{user.full_name}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-zinc-950 border border-zinc-800 shadow-2xl p-3 z-50">
                    <div className="border-b border-zinc-800 pb-2 mb-2">
                      <div className="font-bold text-xs text-white">{user.full_name}</div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">{user.email}</div>
                      {user.role === 'buyer' && (
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono bg-zinc-900 px-2 py-1 border border-zinc-800">
                          <span className="text-zinc-400">Points:</span>
                          <span className="text-white font-bold">{user.reward_points_balance || 0} pts</span>
                        </div>
                      )}
                    </div>

                    {user.role === 'admin' ? (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-xs text-white bg-zinc-900 font-bold mb-1 hover:bg-zinc-800 uppercase tracking-wider"
                      >
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Dashboard & Orders</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors border-t border-zinc-900 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="mono-btn-primary py-1.5 px-4 text-xs font-bold"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3 font-mono text-xs uppercase">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none"
            />
          </form>

          <div className="space-y-1 py-2 border-t border-b border-zinc-900">
            <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-2">EXPLORE PAGES</div>
            {exploreLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-zinc-300 hover:text-white"
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-zinc-400" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 text-emerald-400 border border-zinc-800 rounded">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="w-full text-left py-1.5 text-zinc-300 hover:text-white flex items-center space-x-1"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>REPLAY INTRO SPECTACLE</span>
            </button>
          )}
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px]">
            <Link to="/admin/login" className="text-zinc-500 hover:text-white underline">Admin Portal Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
