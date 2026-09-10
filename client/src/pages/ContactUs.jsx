import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Star } from 'lucide-react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300 uppercase">
          <Mail className="w-3.5 h-3.5 text-white" />
          <span>PIT CREW SUPPORT & ARENA CONTACT</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
          CONNECT WITH RC BATTLEGROUND
        </h1>
        <p className="text-zinc-300 text-sm font-sans leading-relaxed">
          Kids today grow up glued to screens — lazy, indoors, disconnected from real action. RC Battleground changes that. We are Nepal's first-ever RC arena, where children and adults step away from virtual games to command, control, and conquer real machines on real tracks. The roar of engines. The dust of drifting. The thrill of victory. Wake up the driver inside you. Feel the rush. Be the solution.
        </p>
      </div>

      {/* Social & Direct Contact Buttons Grid (Matching Image 2) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-white border-b border-zinc-900 pb-3">
          DIRECT SOCIAL & TELEMETRY CHANNELS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          
          {/* WhatsApp */}
          <a
            href="https://wa.me/9779768532969"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#25D366] text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
          >
            <svg className="w-9 h-9 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
            <svg className="w-9 h-9 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
            <svg className="w-9 h-9 fill-current mb-2 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
            <svg className="w-9 h-9 fill-current mb-2 transition-transform group-hover:scale-110 text-cyan-400" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.33a8.16 8.16 0 004.95 1.66V7.55a4.85 4.85 0 01-2-.86z"/>
            </svg>
            <span className="font-bold text-xs">TikTok</span>
          </a>

          {/* Phone Call */}
          <a
            href="tel:+9779768532969"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all transform hover:-translate-y-1 shadow-lg group"
          >
            <Phone className="w-9 h-9 mb-2 transition-transform group-hover:scale-110 text-emerald-400" />
            <span className="font-bold text-xs">Phone Call</span>
          </a>

          {/* Gmail Box */}
          <a
            href="mailto:rcbattleground@gmail.com"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EA4335] text-white hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg group"
          >
            <Mail className="w-9 h-9 mb-2 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xs">Gmail Box</span>
          </a>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 font-mono text-xs">
          <a
            href="mailto:rcbattleground@gmail.com"
            className="block bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-6 space-y-2 transition-colors group"
          >
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Mail className="w-4 h-4 text-white group-hover:text-red-400 transition-colors" />
              <span>SUPPORT EMAIL</span>
            </div>
            <div className="text-white font-bold text-sm">rcbattleground@gmail.com</div>
          </a>

          <a
            href="tel:+9779768532969"
            className="block bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-6 space-y-2 transition-colors group"
          >
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Phone className="w-4 h-4 text-white group-hover:text-emerald-400 transition-colors" />
              <span>WHATSAPP & HOTLINE</span>
            </div>
            <div className="text-white font-bold text-sm">+977 9768532969</div>
          </a>

          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-white" />
              <span>ARENA LOCATION</span>
            </div>
            <div className="text-white font-bold text-sm leading-relaxed">Kaudhol, Chunikhel, Nepal</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span>ARENA & SUPPORT HOURS</span>
            </div>
            <div className="text-white font-bold text-sm">Mon - Sun: 8:00 AM - 9:00 PM NPT</div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 p-8 space-y-6">
          <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-white border-b border-zinc-900 pb-4">
            DISPATCH TECHNICAL SUPPORT MESSAGE
          </h3>

          {submitted ? (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 space-y-4 font-mono">
              <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
              <h4 className="text-base font-bold text-white uppercase">MESSAGE TRANSMITTED</h4>
              <p className="text-xs text-zinc-400">Our pit crew will respond to {formData.email} within 2 hours.</p>
              <button onClick={() => setSubmitted(false)} className="mono-btn-secondary text-xs">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Your Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="driver@rcbattleground.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Subject / Inquiry Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Track Booking, ESC Tuning, Part Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Detailed Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <button
                type="submit"
                className="w-full mono-btn-primary py-3 font-bold uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <span>TRANSMIT SUPPORT INQUIRY</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
