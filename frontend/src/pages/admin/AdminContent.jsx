import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Save, Home as HomeIcon, Info, PhoneCall, Cpu, Plus, Trash2, ArrowUp, ArrowDown, Upload, Layers, MessageSquare, Mail, User, Clock, CheckCircle2 } from 'lucide-react';
import CategoryTechnologiesTable from '../../components/CategoryTechnologiesTable';

const DEFAULT_SLIDES = [
  { id: 1, title: 'UNLEASH HIGH-SPEED DOMINANCE', description: 'Premium RC cars, parts, and accessories built for champions.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80', cta_text: 'SHOP NOW', cta_link: '/catalog', order: 1 },
  { id: 2, title: 'NEW ARRIVALS — DRIFT MASTERS', description: 'Precision-tuned drift machines with gyro-assisted steering.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW DRIFT CARS', cta_link: '/catalog?category=rc-cars', order: 2 },
  { id: 3, title: 'MONSTER BASHING TRUCKS', description: '6S power. Steel drivetrain. Zero compromises.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80', cta_text: 'EXPLORE TRUCKS', cta_link: '/catalog', order: 3 },
  { id: 4, title: 'MEMBERSHIP REWARDS', description: 'Earn up to 2x points with Pro & Elite tiers.', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80', cta_text: 'JOIN NOW', cta_link: '/membership', order: 4 },
  { id: 5, title: 'RACE EVENTS 2026', description: 'Compete at premier RC racing events across Nepal.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW EVENTS', cta_link: '/events', order: 5 },
];

const DEFAULT_NAV_LINKS = [
  { id: 'home', to: '/', label: 'Home Page', icon: 'Home', badge: '' },
  { id: 'catalog', to: '/catalog', label: 'Vehicle Catalog', icon: 'Grid3X3', badge: 'HOT' },
  { id: 'categories', to: '/categories', label: 'Categories', icon: 'Layers', badge: '' },
  { id: 'events', to: '/events', label: 'Race Events', icon: 'Calendar', badge: 'LIVE' },
  { id: 'membership', to: '/membership', label: 'Membership Plans', icon: 'Crown', badge: 'PRO' },
  { id: 'rewards', to: '/rewards', label: 'Reward Points', icon: 'Award', badge: 'PTS' },
  { id: 'about', to: '/about', label: 'About RC Battleground', icon: 'Info', badge: '' },
  { id: 'contact', to: '/contact', label: 'Contact Us', icon: 'Mail', badge: '' },
];

export default function AdminContent() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('pit_crew_inquiries');
  const [contentMap, setContentMap] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/content/support-inquiries/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.inquiries) setInquiries(data.inquiries);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.content) {
        setContentMap(data.content);
        loadTabContent(activeTab, data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabContent = (tabKey, map = contentMap) => {
    const item = map[tabKey];
    if (item) {
      setTitle(item.title || '');
      setContent(item.content || '');
      const meta = item.metadata || {};
      setMetadata(meta);
      if (tabKey === 'home_slider') {
        setSlides(meta.slides && meta.slides.length > 0 ? meta.slides : DEFAULT_SLIDES);
      } else if (tabKey === 'explore_pages_nav') {
        setNavLinks(meta.nav_links && meta.nav_links.length > 0 ? meta.nav_links : DEFAULT_NAV_LINKS);
      }
    } else {
      setTitle(tabKey === 'home_slider' ? 'RC Battleground Hero Carousel' : tabKey === 'explore_pages_nav' ? 'Explore Pages Navigation' : '');
      setContent(tabKey === 'home_slider' ? 'Admin-managed homepage slider with 5+ promotional slides.' : tabKey === 'explore_pages_nav' ? 'Custom navigation labels for Explore Pages menu.' : '');
      setMetadata({});
      if (tabKey === 'home_slider') setSlides(DEFAULT_SLIDES);
      if (tabKey === 'explore_pages_nav') setNavLinks(DEFAULT_NAV_LINKS);
    }
  };

  useEffect(() => {
    fetchContent();
    fetchInquiries();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setMsg('');
    if (key === 'pit_crew_inquiries') {
      fetchInquiries();
    } else {
      loadTabContent(key);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
      const res = await fetch(`/api/content/support-inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pit crew message?')) return;
    try {
      const res = await fetch(`/api/content/support-inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSlideChange = (index, field, value) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: 'NEW PROMOTIONAL SLIDE',
      description: 'Highlight new RC car drops, discounts, or exclusive events.',
      image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80',
      cta_text: 'EXPLORE',
      cta_link: '/catalog',
      order: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (index) => {
    if (slides.length <= 1) {
      alert('Carousel must have at least 1 slide.');
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
  };

  const handleMoveSlide = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-assign order numbers
    updated.forEach((s, idx) => (s.order = idx + 1));
    setSlides(updated);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleSlideChange(index, 'image_url', data.url);
      } else {
        alert(data.error || 'Failed to upload image file');
      }
    } catch (err) {
      alert('Error uploading image file');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const payloadMetadata = activeTab === 'home_slider'
      ? { ...metadata, slides }
      : activeTab === 'explore_pages_nav'
        ? { ...metadata, nav_links: navLinks }
        : metadata;

    try {
      const res = await fetch(`/api/content/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, metadata: payloadMetadata })
      });

      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ Site content for '${activeTab.toUpperCase()}' saved successfully!`);
        fetchContent();
      } else {
        setMsg(`Error: ${data.error || 'Failed to save content'}`);
      }
    } catch (err) {
      setMsg('Server error saving content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
          BUYER-FACING DYNAMIC CMS
        </div>
        <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
          EDIT SITE CONTENT & HERO CAROUSEL
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 font-mono text-xs uppercase font-bold overflow-x-auto">
        <button
          onClick={() => handleTabChange('pit_crew_inquiries')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'pit_crew_inquiries' ? 'border-red-500 text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <MessageSquare className="w-4 h-4 text-red-500" />
          <span>Dispatch Pit Crew Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('explore_pages_nav')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'explore_pages_nav' ? 'border-emerald-500 text-emerald-400 bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Explore Nav Pages ({navLinks.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('home_slider')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'home_slider' ? 'border-white text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slider ({slides.length} Slides)</span>
        </button>

        <button
          onClick={() => handleTabChange('home_banner')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'home_banner' ? 'border-white text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <HomeIcon className="w-4 h-4" />
          <span>Home Banner</span>
        </button>

        <button
          onClick={() => handleTabChange('about_us')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'about_us' ? 'border-white text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Info className="w-4 h-4" />
          <span>About Us Page</span>
        </button>

        <button
          onClick={() => handleTabChange('contact_info')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'contact_info' ? 'border-white text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Details</span>
        </button>

        <button
          onClick={() => handleTabChange('category_technologies')}
          className={`flex items-center space-x-2 py-3 px-6 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'category_technologies' ? 'border-white text-white bg-zinc-950 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Cpu className="w-4 h-4" />
          <span>Category Technologies</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center font-mono text-xs text-zinc-500 uppercase">
          LOADING SITE CONTENT...
        </div>
      ) : activeTab === 'home_slider' ? (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-6">
            <div>
              <h2 className="text-base font-bold text-white uppercase">Hero Banner Sliding Carousel Editor</h2>
              <p className="text-zinc-400 text-xs mt-1">Manage minimum 5 sliding banner cards. Replace images, edit title, text, CTA link, and reorder.</p>
            </div>
            <button
              type="button"
              onClick={handleAddSlide}
              className="mono-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Slide
            </button>
          </div>

          <div className="space-y-6">
            {slides.map((slide, idx) => (
              <div key={slide.id || idx} className="bg-zinc-950 border border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-white text-black font-bold px-2 py-0.5 text-xs">
                      SLIDE #{idx + 1}
                    </span>
                    <span className="text-zinc-400 font-bold uppercase truncate max-w-xs">{slide.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Remove Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Slide Title</label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                      className="w-full mono-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">CTA Button Text & Link</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Button Text"
                        value={slide.cta_text || ''}
                        onChange={(e) => handleSlideChange(idx, 'cta_text', e.target.value)}
                        className="w-full mono-input"
                      />
                      <input
                        type="text"
                        placeholder="Link e.g. /catalog"
                        value={slide.cta_link || ''}
                        onChange={(e) => handleSlideChange(idx, 'cta_link', e.target.value)}
                        className="w-full mono-input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Slide Description</label>
                  <textarea
                    rows={2}
                    value={slide.description || ''}
                    onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                    className="w-full mono-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 uppercase">Slide Image (PNG, JPG, WEBP, etc.)</label>
                  <div className="flex items-center gap-4">
                    {slide.image_url && (
                      <img src={slide.image_url} alt="Slide preview" className="w-24 h-16 object-cover border border-zinc-800 shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload file below"
                        value={slide.image_url || ''}
                        onChange={(e) => handleSlideChange(idx, 'image_url', e.target.value)}
                        className="w-full mono-input"
                      />
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 border border-zinc-700 text-xs font-mono">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload PNG / Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-900">
            <button
              type="submit"
              disabled={saving}
              className="mono-btn-primary py-3 px-8 font-bold uppercase tracking-widest flex items-center space-x-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING CAROUSEL...' : `SAVE ALL ${slides.length} HERO CAROUSEL SLIDES`}</span>
            </button>
          </div>
        </form>
      ) : activeTab === 'explore_pages_nav' ? (
        <form onSubmit={handleSave} className="bg-zinc-950 border border-zinc-800 p-8 space-y-6 font-mono text-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">CUSTOMIZE EXPLORE PAGES NAVIGATION MENU</h2>
              <p className="text-zinc-400 text-xs mt-1 font-sans">Edit page display labels and optional badge tags shown in the Explore dropdown and side navigation.</p>
            </div>
            <button
              type="button"
              onClick={() => setNavLinks(DEFAULT_NAV_LINKS)}
              className="mono-btn-secondary py-1.5 px-3 text-[10px] font-bold"
            >
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {navLinks.map((item, idx) => (
              <div key={item.id || idx} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">{item.id || `Link #${idx+1}`}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Target Route: {item.to}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase mb-1">Page Display Name</label>
                    <input
                      type="text"
                      required
                      value={item.label || ''}
                      onChange={(e) => {
                        const updated = [...navLinks];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setNavLinks(updated);
                      }}
                      className="w-full mono-input text-xs"
                      placeholder="e.g. Vehicle Catalog"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase mb-1">Badge Tag (Optional)</label>
                    <input
                      type="text"
                      value={item.badge || ''}
                      onChange={(e) => {
                        const updated = [...navLinks];
                        updated[idx] = { ...updated[idx], badge: e.target.value };
                        setNavLinks(updated);
                      }}
                      className="w-full mono-input text-xs"
                      placeholder="e.g. HOT, LIVE, PRO"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-900">
            <button
              type="submit"
              disabled={saving}
              className="mono-btn-primary py-3 px-8 font-bold uppercase tracking-widest flex items-center space-x-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING CHANGES...' : 'SAVE EXPLORE NAVIGATION PAGE NAMES'}</span>
            </button>
          </div>
        </form>
      ) : activeTab === 'pit_crew_inquiries' || activeTab === 'category_technologies' ? null : (
        <form onSubmit={handleSave} className="bg-zinc-950 border border-zinc-800 p-8 space-y-6 font-mono text-xs max-w-3xl">
          <div>
            <label className="block text-zinc-400 uppercase mb-1">Section Title / Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mono-input"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Body Text Content</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full mono-input"
            />
          </div>

          {/* Metadata parameters based on tab */}
          {activeTab === 'home_banner' && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="text-zinc-500 uppercase text-[10px] font-bold">Banner Metadata</div>
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Tagline Badge Text</label>
                <input
                  type="text"
                  value={metadata.tagline || ''}
                  onChange={(e) => setMetadata({ ...metadata, tagline: e.target.value })}
                  className="w-full mono-input"
                />
              </div>
              <div>
                <label className="block text-zinc-400 uppercase mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={metadata.button_text || ''}
                  onChange={(e) => setMetadata({ ...metadata, button_text: e.target.value })}
                  className="w-full mono-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'about_us' && (
            <div className="space-y-6 pt-4 border-t border-zinc-900">
              <div className="text-zinc-400 uppercase text-xs font-bold border-b border-zinc-800 pb-2">
                1. Quick Statistics Counters (e.g. 12,500+, 450+, 8,200+)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(metadata.stats || [
                  { value: '12,500+', label: 'RC VEHICLES DELIVERED' },
                  { value: '450+', label: 'TRACK RECORDS BROKEN' },
                  { value: '8,200+', label: 'ACTIVE DRIVERS' }
                ]).map((stat, idx) => (
                  <div key={idx} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">Stat #{idx + 1}</div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase mb-1">Counter Number / Value</label>
                      <input
                        type="text"
                        value={stat.value || ''}
                        onChange={(e) => {
                          const currentStats = [...(metadata.stats || [
                            { value: '12,500+', label: 'RC VEHICLES DELIVERED' },
                            { value: '450+', label: 'TRACK RECORDS BROKEN' },
                            { value: '8,200+', label: 'ACTIVE DRIVERS' }
                          ])];
                          currentStats[idx] = { ...currentStats[idx], value: e.target.value };
                          setMetadata({ ...metadata, stats: currentStats });
                        }}
                        className="w-full mono-input text-xs font-bold"
                        placeholder="e.g. 12,500+"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase mb-1">Description Label</label>
                      <input
                        type="text"
                        value={stat.label || ''}
                        onChange={(e) => {
                          const currentStats = [...(metadata.stats || [
                            { value: '12,500+', label: 'RC VEHICLES DELIVERED' },
                            { value: '450+', label: 'TRACK RECORDS BROKEN' },
                            { value: '8,200+', label: 'ACTIVE DRIVERS' }
                          ])];
                          currentStats[idx] = { ...currentStats[idx], label: e.target.value };
                          setMetadata({ ...metadata, stats: currentStats });
                        }}
                        className="w-full mono-input text-xs"
                        placeholder="e.g. RC VEHICLES DELIVERED"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Side Arena Banner Image & Info */}
              <div className="text-zinc-400 uppercase text-xs font-bold border-b border-zinc-800 pb-2 pt-4">
                2. Side Arena Banner Photography & Info (Right Column Image)
              </div>
              <div className="space-y-4 bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Banner Image URL / Upload</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={metadata.hero_image || '/rc_arena_vision_hero.jpg'}
                      onChange={(e) => setMetadata({ ...metadata, hero_image: e.target.value })}
                      className="w-full mono-input text-xs"
                      placeholder="/rc_arena_vision_hero.jpg or https://..."
                    />
                    <label className="mono-btn-secondary px-3 py-2 text-xs font-bold shrink-0 cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await fetch('/api/upload/image', {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setMetadata({ ...metadata, hero_image: data.url });
                            } else {
                              alert(data.error || 'Upload failed');
                            }
                          } catch (err) {
                            alert('Upload error');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Tagline Badge Text</label>
                    <input
                      type="text"
                      value={metadata.hero_badge || 'OFFICIAL RC ARENA & TELEMETRY PIT HEADQUARTERS — NEPAL'}
                      onChange={(e) => setMetadata({ ...metadata, hero_badge: e.target.value })}
                      className="w-full mono-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Arena Card Headline</label>
                    <input
                      type="text"
                      value={metadata.hero_title || 'Precision High-Speed Arena & Trackside Diagnostic Bay'}
                      onChange={(e) => setMetadata({ ...metadata, hero_title: e.target.value })}
                      className="w-full mono-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Arena Description Text</label>
                  <textarea
                    rows={3}
                    value={metadata.hero_description || 'Equipped with live lap timers, telemetry telemetry sensors, sub-millimeter gyro calibration, and 100% genuine replacement parts.'}
                    onChange={(e) => setMetadata({ ...metadata, hero_description: e.target.value })}
                    className="w-full mono-input text-xs"
                  />
                </div>
              </div>

              {/* 3. Precision Fleet & Arena Gallery (2nd Screenshot) */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 pt-4">
                <div className="text-zinc-400 uppercase text-xs font-bold">
                  3. Precision Fleet & Arena Gallery Cards (Screenshot 2)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentGallery = [...(metadata.gallery || [
                      { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                      { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                      { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                    ])];
                    const newCard = {
                      id: Date.now(),
                      tag: 'NEW CATEGORY',
                      title: 'NEW FLEET VEHICLE',
                      description: 'High-performance RC machine engineered for championship racing.',
                      image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'
                    };
                    setMetadata({ ...metadata, gallery: [...currentGallery, newCard] });
                  }}
                  className="mono-btn-primary py-1.5 px-3 text-[10px] font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Gallery Card</span>
                </button>
              </div>

              <div className="space-y-4">
                {(metadata.gallery || [
                  { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                  { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                  { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                ]).map((card, idx) => (
                  <div key={card.id || idx} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Gallery Card #{idx + 1} — {card.title || 'Untitled'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentGallery = [...(metadata.gallery || [
                            { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                            { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                            { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                          ])];
                          const updated = currentGallery.filter((_, i) => i !== idx);
                          setMetadata({ ...metadata, gallery: updated });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-mono flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-[10px] uppercase mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={card.tag || ''}
                          onChange={(e) => {
                            const current = [...(metadata.gallery || [
                              { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                              { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                              { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                            ])];
                            current[idx] = { ...current[idx], tag: e.target.value };
                            setMetadata({ ...metadata, gallery: current });
                          }}
                          className="w-full mono-input text-xs"
                          placeholder="e.g. OFF-ROAD 4WD"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px] uppercase mb-1">Card Headline Title</label>
                        <input
                          type="text"
                          value={card.title || ''}
                          onChange={(e) => {
                            const current = [...(metadata.gallery || [
                              { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                              { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                              { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                            ])];
                            current[idx] = { ...current[idx], title: e.target.value };
                            setMetadata({ ...metadata, gallery: current });
                          }}
                          className="w-full mono-input text-xs"
                          placeholder="e.g. APEX OFF-ROAD BUGGIES"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase mb-1">Card Image URL / File Upload</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={card.image_url || ''}
                          onChange={(e) => {
                            const current = [...(metadata.gallery || [
                              { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                              { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                              { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                            ])];
                            current[idx] = { ...current[idx], image_url: e.target.value };
                            setMetadata({ ...metadata, gallery: current });
                          }}
                          className="w-full mono-input text-xs"
                          placeholder="https://..."
                        />
                        <label className="mono-btn-secondary px-3 py-2 text-xs font-bold shrink-0 cursor-pointer flex items-center space-x-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('image', file);
                              try {
                                const res = await fetch('/api/upload/image', {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${token}` },
                                  body: formData,
                                });
                                const data = await res.json();
                                if (res.ok && data.url) {
                                  const current = [...(metadata.gallery || [
                                    { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                                    { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                                    { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                                  ])];
                                  current[idx] = { ...current[idx], image_url: data.url };
                                  setMetadata({ ...metadata, gallery: current });
                                } else {
                                  alert(data.error || 'Upload failed');
                                }
                              } catch (err) {
                                alert('Upload error');
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] uppercase mb-1">Card Description</label>
                      <textarea
                        rows={2}
                        value={card.description || ''}
                        onChange={(e) => {
                          const current = [...(metadata.gallery || [
                            { id: 1, tag: 'OFF-ROAD 4WD', title: 'APEX OFF-ROAD BUGGIES', description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
                            { id: 2, tag: '1/10 RWD DRIFT', title: 'TOKYO SPEC DRIFT CARS', description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                            { id: 3, tag: '6S BASHING TRUCKS', title: 'TITAN CRUSHER BASHING TRUCKS', description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' }
                          ])];
                          current[idx] = { ...current[idx], description: e.target.value };
                          setMetadata({ ...metadata, gallery: current });
                        }}
                        className="w-full mono-input text-xs"
                        placeholder="Card description text..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-900">
            <button
              type="submit"
              disabled={saving}
              className="mono-btn-primary py-3 px-8 font-bold uppercase tracking-widest flex items-center space-x-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING CHANGES...' : `SAVE ${activeTab.toUpperCase()} CONTENT`}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'pit_crew_inquiries' && (
        <div className="space-y-6 font-mono">
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" />
                <span>DISPATCH PIT CREW SUPPORT INQUIRIES ({inquiries.length})</span>
              </h2>
              <p className="text-zinc-400 text-xs mt-1 font-sans">
                Transmitted customer support inquiries, track booking requests, and technical tuning messages from drivers.
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              className="mono-btn-secondary py-2 px-4 text-xs font-bold"
            >
              Refresh Inquiries
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className={`bg-zinc-950 border p-6 rounded-2xl space-y-3 transition-all ${
                  inq.status === 'unread' ? 'border-red-600/60 shadow-lg shadow-red-950/20' : 'border-zinc-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between border-b border-zinc-900 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        inq.status === 'unread' ? 'bg-red-600 text-white font-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {inq.status.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm text-white">{inq.subject}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-zinc-500" /> {inq.name}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {inq.email}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" /> {new Date(inq.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(inq.id, inq.status)}
                      className={`text-xs px-3 py-1.5 border rounded font-mono font-bold transition-colors ${
                        inq.status === 'unread'
                          ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {inq.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                    </button>
                    <a
                      href={`mailto:${inq.email}?subject=RE: ${encodeURIComponent(inq.subject)}`}
                      className="text-xs px-3 py-1.5 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors inline-block"
                    >
                      Reply Email
                    </a>
                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 font-sans leading-relaxed">
                  "{inq.message}"
                </div>
              </div>
            ))}

            {inquiries.length === 0 && (
              <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                No pit crew support inquiries transmitted yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'category_technologies' && (
        <div className="pt-6 border-t border-zinc-800">
          <CategoryTechnologiesTable title="LIVE CATEGORY TECHNOLOGIES MATRIX" />
        </div>
      )}
    </div>
  );
}
