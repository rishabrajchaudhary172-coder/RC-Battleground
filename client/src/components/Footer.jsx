import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-900 text-xs">
          <div className="flex items-start space-x-3">
            <Truck className="w-6 h-6 text-white shrink-0" />
            <div>
              <div className="text-white font-bold uppercase tracking-wider mb-1">Trackside Express</div>
              <div className="text-zinc-500">Same-day dispatch on ready-to-run RC vehicles & spare gear.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-white shrink-0" />
            <div>
              <div className="text-white font-bold uppercase tracking-wider mb-1">Factory Warranty</div>
              <div className="text-zinc-500">100% authentic vehicles with genuine manufacturer warranty.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RotateCcw className="w-6 h-6 text-white shrink-0" />
            <div>
              <div className="text-white font-bold uppercase tracking-wider mb-1">30-Day Support</div>
              <div className="text-zinc-500">Free technical tuning assistance & hassle-free return policy.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Lock className="w-6 h-6 text-white shrink-0" />
            <div>
              <div className="text-white font-bold uppercase tracking-wider mb-1">Secure Checkout</div>
              <div className="text-zinc-500">Encrypted JWT auth & multi-tier checkout protection.</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 text-xs">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white text-black font-black text-lg flex items-center justify-center">RC</div>
              <span className="font-black tracking-widest text-base text-white uppercase">RC BATTLEGROUND</span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed">
              The ultimate online destination for high-speed brushless buggies, gyro drift machines, 6S bashing trucks, and FPV racing quadcopters. Built for speed, precision, and raw performance.
            </p>
            <div className="text-[11px] font-mono text-zinc-600">
              STRICT MONOCHROME HIGH-CONTRAST INTERFACE • VERSION 1.0.0
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 font-mono text-xs">Categories</h4>
            <ul className="space-y-2.5 font-mono text-zinc-400">
              <li><Link to="/catalog?category=off-road-buggies" className="hover:text-white transition-colors">Off-Road Buggies</Link></li>
              <li><Link to="/catalog?category=drift-cars" className="hover:text-white transition-colors">Drift Cars</Link></li>
              <li><Link to="/catalog?category=monster-trucks" className="hover:text-white transition-colors">Monster Trucks</Link></li>
              <li><Link to="/catalog?category=rock-crawlers" className="hover:text-white transition-colors">Rock Crawlers</Link></li>
              <li><Link to="/catalog?category=speed-on-road" className="hover:text-white transition-colors">Speed On-Road</Link></li>
              <li><Link to="/catalog?category=racing-drones" className="hover:text-white transition-colors">Racing Drones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 font-mono text-xs">Customer Service</h4>
            <ul className="space-y-2.5 font-mono text-zinc-400">
              <li><Link to="/membership" className="hover:text-white transition-colors">VIP Memberships</Link></li>
              <li><Link to="/rewards" className="hover:text-white transition-colors">Reward Points</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Pit Crew Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 font-mono text-xs">Portals</h4>
            <ul className="space-y-2.5 font-mono text-zinc-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">Buyer Profile</Link></li>
              <li><Link to="/admin/login" className="text-zinc-300 font-bold hover:text-white transition-colors underline">Admin Login Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-zinc-600 space-y-4 sm:space-y-0">
          <div>© 2026 RC BATTLEGROUND INC. ALL RIGHTS RESERVED.</div>
          <div className="flex space-x-6 text-[11px]">
            <span className="hover:text-zinc-400 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-zinc-400 cursor-pointer">TERMS OF SERVICE</span>
            <span className="hover:text-zinc-400 cursor-pointer">RACE TRACK RULES</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
