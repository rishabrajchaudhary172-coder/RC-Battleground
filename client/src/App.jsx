import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import IntroSplash from './components/IntroSplash';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import MembershipPlans from './pages/MembershipPlans';
import RewardPoints from './pages/RewardPoints';
import CartCheckout from './pages/CartCheckout';
import BuyerProfile from './pages/BuyerProfile';
import Settings from './pages/Settings';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Events from './pages/Events';
import VerifyEmail from './pages/VerifyEmail';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBuyers from './pages/admin/AdminBuyers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMembershipsRewards from './pages/admin/AdminMembershipsRewards';
import AdminContent from './pages/admin/AdminContent';
import AdminEvents from './pages/admin/AdminEvents';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Permanent Fixed Transparent Background Logo Watermark on Every Page */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
        <img
          src="/logo_rc_battleground.png"
          alt="Logo RC-battle ground"
          className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] md:w-[800px] md:h-[800px] lg:w-[950px] lg:h-[950px] opacity-[0.04] dark:opacity-[0.05] grayscale brightness-125 dark:brightness-200 pointer-events-none object-contain transition-all duration-300"
        />
      </div>

      {showIntro && <IntroSplash onComplete={handleIntroComplete} />}

      <Routes>
        {/* Admin Portal Layout (Sidebar) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="buyers" element={<AdminBuyers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminMembershipsRewards />} />
          <Route path="content" element={<AdminContent />} />
        </Route>

        {/* Buyer Storefront Layout (Top Navbar & Footer) */}
        <Route
          path="*"
          element={
            <>
              <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} onReplayIntro={handleReplayIntro} />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home onOpenAuthModal={() => setAuthModalOpen(true)} />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/membership" element={<MembershipPlans />} />
                  <Route path="/rewards" element={<RewardPoints />} />
                  <Route path="/checkout" element={<CartCheckout />} />
                  <Route path="/profile" element={<BuyerProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                </Routes>
              </div>
              <Footer />
              <CartDrawer />
              <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            </>
          }
        />
      </Routes>
    </div>
  );
}
