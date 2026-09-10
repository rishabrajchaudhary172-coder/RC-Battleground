import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Contact Us Box matching Image 2 */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-10 space-y-8 text-center max-w-4xl mx-auto shadow-2xl">
          
          {/* Title & Story */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-widest font-sans">
              RC BATTLEGROUND
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto font-sans">
              Kids today grow up glued to screens — lazy, indoors, disconnected from real action. RC Battleground changes that. We are Nepal's first-ever RC arena, where children and adults step away from virtual games to command, control, and conquer real machines on real tracks. The roar of engines. The dust of drifting. The thrill of victory. This is not just play — it's technical tourism in action, bringing adventure, skill, and excitement to Kaudhol, Chunikhel while boosting Nepal's economy one race at a time. Wake up the driver inside you. Feel the rush. Be the solution.
            </p>
          </div>

          {/* Quick Action Circular Icons */}
          <div className="flex justify-center items-center gap-4 py-2">
            {/* Phone Call */}
            <a
              href="tel:+9779768532969"
              title="Call Us: +977 976-8532969"
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
            >
              <Phone className="w-5 h-5 text-white" />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/9779768532969"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp: +977 976-8532969"
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-emerald-400 transition-all transform hover:scale-110 shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.485 1.334 5.004L2 22l5.127-1.341a9.96 9.96 0 004.881 1.28h.004c5.507 0 9.99-4.478 9.99-9.984 0-2.667-1.039-5.174-2.929-7.063A9.923 9.923 0 0012.012 2zm5.836 14.168c-.247.697-1.229 1.282-1.996 1.348-.525.045-1.21.082-3.513-.867-2.946-1.212-4.846-4.22-4.994-4.417-.146-.197-1.196-1.593-1.196-3.038 0-1.446.757-2.157 1.026-2.451.27-.294.59-.368.788-.368.196 0 .393.002.564.01.182.008.428-.069.67.512.247.59.843 2.06.917 2.208.074.148.123.32.025.518-.099.197-.148.32-.295.492-.148.173-.311.386-.443.518-.147.148-.302.31-.13.606.173.295.769 1.27 1.65 2.056 1.134 1.01 2.09 1.323 2.385 1.471.295.148.468.123.64-.074.173-.197.739-.861.936-1.157.197-.295.394-.246.664-.148.271.098 1.723.812 2.019.96.295.148.492.221.565.344.074.123.074.714-.173 1.411z"/>
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:rcbattleground@gmail.com"
              title="Email: rcbattleground@gmail.com"
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
            >
              <Mail className="w-5 h-5 text-white" />
            </a>
          </div>

          {/* Rating Badge Box */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 max-w-sm mx-auto space-y-3">
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-zinc-400 text-xs font-mono">Give us your valuable rating....</p>
            <a
              href="https://www.google.com/search?q=RC+Battleground+Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Review us on Google
            </a>
          </div>

          {/* Social Media & Contact Logos Grid (Matching Image 2 rounded cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4">
            
            {/* WhatsApp */}
            <a
              href="https://wa.me/9779768532969"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#25D366] text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <svg className="w-10 h-10 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.485 1.334 5.004L2 22l5.127-1.341a9.96 9.96 0 004.881 1.28h.004c5.507 0 9.99-4.478 9.99-9.984 0-2.667-1.039-5.174-2.929-7.063A9.923 9.923 0 0012.012 2zm5.836 14.168c-.247.697-1.229 1.282-1.996 1.348-.525.045-1.21.082-3.513-.867-2.946-1.212-4.846-4.22-4.994-4.417-.146-.197-1.196-1.593-1.196-3.038 0-1.446.757-2.157 1.026-2.451.27-.294.59-.368.788-.368.196 0 .393.002.564.01.182.008.428-.069.67.512.247.59.843 2.06.917 2.208.074.148.123.32.025.518-.099.197-.148.32-.295.492-.148.173-.311.386-.443.518-.147.148-.302.31-.13.606.173.295.769 1.27 1.65 2.056 1.134 1.01 2.09 1.323 2.385 1.471.295.148.468.123.64-.074.173-.197.739-.861.936-1.157.197-.295.394-.246.664-.148.271.098 1.723.812 2.019.96.295.148.492.221.565.344.074.123.074.714-.173 1.411z"/>
              </svg>
              <span className="font-bold text-xs">WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1GK2PcDzDM/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1877F2] text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <svg className="w-10 h-10 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-bold text-xs">Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/rc_battleground?stkn=anVxMHd5Ym16aWYx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <svg className="w-10 h-10 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-bold text-xs">Instagram</span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@rc_battleground?_r=1&_t=ZS-99cbNwfPdNV"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black text-white border border-zinc-800 hover:border-cyan-400 transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <svg className="w-10 h-10 fill-current mb-2 transition-transform group-hover:scale-110 text-cyan-400" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.33a8.16 8.16 0 004.95 1.66V7.55a4.85 4.85 0 01-2-.86z"/>
              </svg>
              <span className="font-bold text-xs">TikTok</span>
            </a>

            {/* Phone Call */}
            <a
              href="tel:+9779768532969"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <Phone className="w-10 h-10 mb-2 transition-transform group-hover:scale-110 text-emerald-400" />
              <span className="font-bold text-xs">Phone Call</span>
            </a>

            {/* Gmail Box */}
            <a
              href="mailto:rcbattleground@gmail.com"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EA4335] text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
            >
              <Mail className="w-10 h-10 mb-2 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xs">Gmail Box</span>
            </a>

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
              Nepal's premier RC arena & online store for high-speed brushless buggies, gyro drift machines, 6S bashing trucks, and FPV racing quadcopters.
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
