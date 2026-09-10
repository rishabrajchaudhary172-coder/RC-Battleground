import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Layout (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-12 border-b border-zinc-900">
          
          {/* Left Brand & Socials Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white text-black font-black text-xl flex items-center justify-center rounded">RC</div>
              <span className="font-black tracking-widest text-lg text-white uppercase font-sans">RC BATTLEGROUND</span>
            </div>
            
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md font-sans">
              Nepal's premier RC arena & online store for high-speed brushless buggies, gyro drift machines, 6S bashing trucks, and FPV racing quadcopters. Wake up the driver inside you.
            </p>

            {/* Compact Social Icons Row (Matching Screenshot 2 UI) */}
            <div className="flex items-center space-x-3 pt-2">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1GK2PcDzDM/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all transform hover:scale-105 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/rc_battleground?stkn=anVxMHd5Ym16aWYx"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-pink-400 transition-all transform hover:scale-105 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@rc_battleground?_r=1&_t=ZS-99cbNwfPdNV"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-cyan-400 transition-all transform hover:scale-105 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.33a8.16 8.16 0 004.95 1.66V7.55a4.85 4.85 0 01-2-.86z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/9779768532969"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-emerald-400 transition-all transform hover:scale-105 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.485 1.334 5.004L2 22l5.127-1.341a9.96 9.96 0 004.881 1.28h.004c5.507 0 9.99-4.478 9.99-9.984 0-2.667-1.039-5.174-2.929-7.063A9.923 9.923 0 0012.012 2zm5.836 14.168c-.247.697-1.229 1.282-1.996 1.348-.525.045-1.21.082-3.513-.867-2.946-1.212-4.846-4.22-4.994-4.417-.146-.197-1.196-1.593-1.196-3.038 0-1.446.757-2.157 1.026-2.451.27-.294.59-.368.788-.368.196 0 .393.002.564.01.182.008.428-.069.67.512.247.59.843 2.06.917 2.208.074.148.123.32.025.518-.099.197-.148.32-.295.492-.148.173-.311.386-.443.518-.147.148-.302.31-.13.606.173.295.769 1.27 1.65 2.056 1.134 1.01 2.09 1.323 2.385 1.471.295.148.468.123.64-.074.173-.197.739-.861.936-1.157.197-.295.394-.246.664-.148.271.098 1.723.812 2.019.96.295.148.492.221.565.344.074.123.074.714-.173 1.411z"/>
                </svg>
              </a>
            </div>

            {/* Direct Contact Info (Matching Screenshot 2) */}
            <div className="space-y-2 pt-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>Kaudhol, Chunikhel, Nepal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <a href="mailto:rcbattleground@gmail.com" className="hover:text-white transition-colors">rcbattleground@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                <a href="tel:+9779768532969" className="hover:text-white transition-colors">+977 9768532969 · WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 font-mono text-xs">Categories</h4>
            <ul className="space-y-2.5 font-mono text-xs text-zinc-400">
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
            <ul className="space-y-2.5 font-mono text-xs text-zinc-400">
              <li><Link to="/membership" className="hover:text-white transition-colors">VIP Memberships</Link></li>
              <li><Link to="/rewards" className="hover:text-white transition-colors">Reward Points</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Pit Crew Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-zinc-600 space-y-4 sm:space-y-0">
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
