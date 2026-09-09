import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Save, Home as HomeIcon, Info, PhoneCall, Cpu, Plus, Trash2, ArrowUp, ArrowDown, Upload, Layers } from 'lucide-react';
import CategoryTechnologiesTable from '../../components/CategoryTechnologiesTable';

const DEFAULT_SLIDES = [
  { id: 1, title: 'UNLEASH HIGH-SPEED DOMINANCE', description: 'Premium RC cars, parts, and accessories built for champions.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80', cta_text: 'SHOP NOW', cta_link: '/catalog', order: 1 },
  { id: 2, title: 'NEW ARRIVALS — DRIFT MASTERS', description: 'Precision-tuned drift machines with gyro-assisted steering.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW DRIFT CARS', cta_link: '/catalog?category=rc-cars', order: 2 },
  { id: 3, title: 'MONSTER BASHING TRUCKS', description: '6S power. Steel drivetrain. Zero compromises.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80', cta_text: 'EXPLORE TRUCKS', cta_link: '/catalog', order: 3 },
  { id: 4, title: 'MEMBERSHIP REWARDS', description: 'Earn up to 2x points with Pro & Elite tiers.', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80', cta_text: 'JOIN NOW', cta_link: '/membership', order: 4 },
  { id: 5, title: 'RACE EVENTS 2026', description: 'Compete at premier RC racing events across Nepal.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW EVENTS', cta_link: '/events', order: 5 },
];

export default function AdminContent() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('home_slider');
  const [contentMap, setContentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

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
      }
    } else {
      setTitle(tabKey === 'home_slider' ? 'RC Battleground Hero Carousel' : '');
      setContent(tabKey === 'home_slider' ? 'Admin-managed homepage slider with 5+ promotional slides.' : '');
      setMetadata({});
      if (tabKey === 'home_slider') setSlides(DEFAULT_SLIDES);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setMsg('');
    loadTabContent(key);
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

    const payloadMetadata = activeTab === 'home_slider' ? { ...metadata, slides } : metadata;

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
      ) : (
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

          {activeTab === 'contact_info' && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="text-zinc-500 uppercase text-[10px] font-bold">Contact Metadata</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Support Email</label>
                  <input
                    type="email"
                    value={metadata.email || ''}
                    onChange={(e) => setMetadata({ ...metadata, email: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Phone Hotline</label>
                  <input
                    type="text"
                    value={metadata.phone || ''}
                    onChange={(e) => setMetadata({ ...metadata, phone: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Physical Address</label>
                <input
                  type="text"
                  value={metadata.address || ''}
                  onChange={(e) => setMetadata({ ...metadata, address: e.target.value })}
                  className="w-full mono-input"
                />
              </div>
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={metadata.hours || ''}
                  onChange={(e) => setMetadata({ ...metadata, hours: e.target.value })}
                  className="w-full mono-input"
                />
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

      {activeTab === 'category_technologies' && (
        <div className="pt-6 border-t border-zinc-800">
          <CategoryTechnologiesTable title="LIVE CATEGORY TECHNOLOGIES MATRIX" />
        </div>
      )}
    </div>
  );
}
