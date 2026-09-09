import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Flag, Users, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function Events() {
  const { user, token, refreshUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId, title) => {
    if (!token) {
      alert('Please sign in to register for upcoming race events.');
      return;
    }

    setRegisteringId(eventId);
    setMsg('');

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setMsg(`🎉 ${data.message}`);
        fetchEvents();
        refreshUser();
      } else {
        setMsg(`Error: ${data.error || 'Failed to register'}`);
      }
    } catch (err) {
      setMsg('Server error registering for race event');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300 uppercase">
          <Flag className="w-3.5 h-3.5 text-white" />
          <span>UPCOMING TOURNAMENTS & TRACK DAYS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-wide">
          RC RACE EVENTS CALENDAR
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed font-sans">
          Reserve your spot on the starting grid for off-road championships, gyro drift battles, and monster bashing showdowns. Earn +20 reward points for every registered track event.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-zinc-950 border border-zinc-700 text-white font-mono text-xs text-center max-w-2xl mx-auto">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          LOADING RACE EVENTS...
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No upcoming race events scheduled currently. Check back soon for pit crew updates!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {events.map((ev) => {
            const isFull = ev.registered_count >= ev.max_participants;

            return (
              <div key={ev.id} className="mono-card group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-w-16 aspect-h-9 h-48 bg-zinc-900 overflow-hidden border-b border-zinc-800">
                    <img
                      src={ev.image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-black/90 text-white font-mono text-[10px] px-2.5 py-1 border border-zinc-800 uppercase">
                      {ev.track_type}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 font-mono">
                    <div>
                      <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>{new Date(ev.event_date).toLocaleString()}</span>
                      </div>
                      <h3 className="font-bold text-base text-white uppercase tracking-wide font-sans line-clamp-2">
                        {ev.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>

                    {/* Registration progress bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>GRID CAPACITY</span>
                        <span className="text-white font-bold">{ev.registered_count} / {ev.max_participants} DRIVERS</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${Math.min(100, (ev.registered_count / ev.max_participants) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-zinc-900/50 mt-4">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Entry Fee</div>
                    <div className="text-base font-mono font-bold text-white">
                      {ev.entry_fee == 0 ? 'FREE ENTRY' : <PriceDisplay usd={ev.entry_fee} />}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(ev.id, ev.title)}
                    disabled={isFull || registeringId === ev.id}
                    className={`mono-btn-primary py-2.5 px-4 text-xs font-bold font-mono ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFull ? 'GRID FULL' : registeringId === ev.id ? 'RESERVING...' : 'RESERVE SPOT (+20 PTS)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
