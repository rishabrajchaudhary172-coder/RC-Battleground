import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Plus, Edit2, Trash2, X, Users, DollarSign, Flag } from 'lucide-react';

export default function AdminEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    track_type: 'Off-Road Clay & Dirt Circuit',
    description: '',
    image_url: '',
    entry_fee: '20.00',
    max_participants: '30'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
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

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      location: 'Sector 7 Dirt Arena, RC Valley',
      track_type: 'Off-Road Clay & Dirt Circuit',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
      entry_fee: '20.00',
      max_participants: '30'
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (ev) => {
    setEditingEvent(ev);
    const dateFormatted = ev.event_date ? new Date(ev.event_date).toISOString().slice(0, 16) : '';
    setFormData({
      title: ev.title,
      event_date: dateFormatted,
      location: ev.location,
      track_type: ev.track_type,
      description: ev.description,
      image_url: ev.image_url || '',
      entry_fee: ev.entry_fee,
      max_participants: ev.max_participants
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEvents();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete event');
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      title: formData.title,
      event_date: formData.event_date,
      location: formData.location,
      track_type: formData.track_type,
      description: formData.description,
      image_url: formData.image_url,
      entry_fee: parseFloat(formData.entry_fee),
      max_participants: parseInt(formData.max_participants, 10)
    };

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchEvents();
      } else {
        setErrorMsg(data.error || 'Failed to save event');
      }
    } catch (err) {
      setErrorMsg('Server error saving race event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            RACE TOURNAMENTS & TRACK DAYS
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            UPCOMING RACE EVENTS ({events.length})
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="mono-btn-primary py-2.5 px-4 font-mono text-xs font-bold flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW RACE EVENT</span>
        </button>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          LOADING UPCOMING EVENTS...
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No upcoming race events scheduled. Click "Create New Race Event" to schedule a tournament.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Event Title</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Track & Location</th>
                <th className="p-3.5">Entry Fee</th>
                <th className="p-3.5">Registered Drivers</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-zinc-900/50">
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    {ev.title}
                  </td>
                  <td className="p-3.5 text-zinc-300">
                    {new Date(ev.event_date).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <div className="text-white font-bold">{ev.track_type}</div>
                    <div className="text-[10px] text-zinc-500">{ev.location}</div>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {ev.entry_fee === 0 ? 'FREE ENTRY' : `$${parseFloat(ev.entry_fee).toFixed(2)}`}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 font-bold border ${ev.registered_count >= ev.max_participants ? 'bg-red-950 text-red-300 border-red-800' : 'bg-zinc-900 text-white border-zinc-700'}`}>
                      {ev.registered_count} / {ev.max_participants} DRIVERS
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(ev)}
                      className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-1.5 text-red-400 hover:text-white border border-zinc-800 bg-zinc-900"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="font-mono font-bold text-base uppercase tracking-widest">
                {editingEvent ? 'EDIT RACE EVENT DETAILS' : 'SCHEDULE UPCOMING RACE EVENT'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 font-mono text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Battleground 4WD Dirt Championship"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Track Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="Off-Road Dirt, Gyro Drift, etc."
                    value={formData.track_type}
                    onChange={(e) => setFormData({ ...formData, track_type: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sector 7 Arena"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Entry Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Max Drivers</label>
                  <input
                    type="number"
                    required
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Event Description & Rules *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe track heats, rules, prize pool..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Event Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mono-btn-secondary py-2.5 px-5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mono-btn-primary py-2.5 px-6 font-bold"
                >
                  {submitting ? 'SAVING...' : 'SAVE RACE EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
