import React, { useState } from 'react';
import { Mail, Phone, MapPin, ExternalLink, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-16">
      
      {/* Contact Header & Cards Section (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center space-x-2 text-red-500 font-mono text-xs font-bold uppercase tracking-widest">
            <span className="w-4 h-[2px] bg-red-500 inline-block"></span>
            <span>CONTACT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-none font-sans">
            Contact<br />information
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base font-sans leading-relaxed max-w-lg">
            Reach the RC Battleground team for arena bookings, track racing events, technical tuning, and general enquiries.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#contact-form"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-900/30"
            >
              <span>Contact Form</span>
              <div className="w-6 h-6 rounded-full bg-white text-red-600 flex items-center justify-center">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>

            <a
              href="https://www.google.com/search?q=RC+Battleground+Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all"
            >
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>Send Feedback</span>
            </a>
          </div>
        </div>

        {/* Right Stacked Contact Cards (Matching Screenshot 1) */}
        <div className="lg:col-span-6 space-y-4 font-sans">
          
          {/* Card 1: Location */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-zinc-700 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-500 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base font-sans">Visit Arena & Track</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">Kaudhol, Chunikhel, Kathmandu, Nepal</p>
            </div>
          </div>

          {/* Card 2: Email */}
          <a
            href="mailto:rcbattleground@gmail.com"
            className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-zinc-700 transition-all shadow-xl block group"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base font-sans group-hover:text-red-400 transition-colors">Email Us</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">rcbattleground@gmail.com</p>
            </div>
          </a>

          {/* Card 3: Hotline */}
          <a
            href="tel:+9779768532969"
            className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-zinc-700 transition-all shadow-xl block group"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base font-sans group-hover:text-red-400 transition-colors">Call & WhatsApp</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">+977 976-8532969</p>
            </div>
          </a>

        </div>

      </div>

      {/* Map & Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
        
        {/* Left Embedded Map (Matching Screenshot 1) */}
        <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl h-[380px]">
          <iframe
            title="RC Battleground Nepal Arena Map"
            src="https://maps.google.com/maps?q=Chunikhel,Kathmandu,Nepal&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80 hover:opacity-100 transition-opacity"
            loading="lazy"
          ></iframe>
          <div className="absolute bottom-4 right-4 z-10">
            <a
              href="https://maps.google.com/?q=Chunikhel,Kathmandu,Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-full shadow-lg transition-all"
            >
              Open Larger Map
            </a>
          </div>
        </div>

        {/* Right Contact Form */}
        <div id="contact-form" className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-white border-b border-zinc-900 pb-3">
            DISPATCH PIT CREW MESSAGE
          </h3>

          {submitted ? (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 font-mono">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white uppercase">MESSAGE TRANSMITTED</h4>
              <p className="text-xs text-zinc-400">Our pit crew will respond to {formData.email} shortly.</p>
              <button onClick={() => setSubmitted(false)} className="mono-btn-secondary text-xs">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mono-input rounded-lg"
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
                    className="w-full mono-input rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Subject / Inquiry</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Track Booking, Race Registration, Parts"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full mono-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full mono-input rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200 py-3.5 font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center space-x-2"
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
