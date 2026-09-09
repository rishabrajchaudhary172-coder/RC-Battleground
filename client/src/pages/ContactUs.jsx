import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const [contactData, setContactData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    fetch('/api/content/contact_info')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setContactData(data.content);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const meta = contactData?.metadata || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300 uppercase">
          <Mail className="w-3.5 h-3.5 text-white" />
          <span>PIT CREW SUPPORT & CONTACT</span>
        </div>

        <h1 className="text-4xl font-black uppercase text-white tracking-wide">
          {contactData?.title || 'GET IN TOUCH WITH THE PIT CREW'}
        </h1>
        <p className="text-zinc-400 text-sm font-sans leading-relaxed">
          {contactData?.content || 'Have technical questions about gear ratios, ESC programming, or order status? Our pit crew is standing by 24/7.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Mail className="w-4 h-4 text-white" />
              <span>SUPPORT EMAIL</span>
            </div>
            <div className="text-white font-bold text-sm">{meta.email || 'support@rcbattleground.com'}</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Phone className="w-4 h-4 text-white" />
              <span>PIT CREW HOTLINE</span>
            </div>
            <div className="text-white font-bold text-sm">{meta.phone || '+1 (800) 555-RCBG'}</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-white" />
              <span>ARENA LOCATION</span>
            </div>
            <div className="text-white font-bold text-sm leading-relaxed">{meta.address || '100 Speed Arena Way, Sector 7, RC Valley'}</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
            <div className="text-zinc-500 uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span>SUPPORT HOURS</span>
            </div>
            <div className="text-white font-bold text-sm">{meta.hours || 'Mon - Sun: 8:00 AM - 10:00 PM EST'}</div>
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
                  placeholder="e.g., ESC Tuning, Part Compatibility, Order inquiry"
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
                  placeholder="Describe your technical inquiry..."
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
