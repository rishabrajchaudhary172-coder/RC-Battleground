import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Star, ShieldCheck, Zap, Award, Crown, ChevronRight, Calendar, Flag, MessageSquare, Edit2 } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import PriceDisplay from '../components/PriceDisplay';

export default function Home({ onOpenAuthModal }) {
  const [homeBanner, setHomeBanner] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch site content
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setHomeBanner(data.content.home_banner);
          setAboutContent(data.content.about_us);
        }
      })
      .catch(() => {});

    // Fetch Categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    // Fetch New Arrivals (Latest Products)
    fetch('/api/products?sort=newest')
      .then((res) => res.json())
      .then((data) => setNewArrivals((data.products || []).slice(0, 6)))
      .catch(() => {});

    // Fetch Upcoming Events
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setUpcomingEvents((data.events || []).slice(0, 3)))
      .catch(() => {});

    // Fetch Featured Reviews
    fetch('/api/reviews/featured')
      .then((res) => res.json())
      .then((data) => setFeaturedReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-20 font-sans">
      {/* Sliding Hero Carousel Banner */}
      <HeroCarousel />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white font-sans">
              FEATURED CATEGORIES
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">Select your discipline and dominate the circuit</p>
          </div>
          <Link to="/catalog" className="font-mono text-xs text-white hover:underline flex items-center space-x-1 uppercase">
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative bg-zinc-950 border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-white"
            >
              <div className="aspect-w-16 aspect-h-9 h-48 overflow-hidden bg-zinc-900">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="p-5 border-t border-zinc-900 flex justify-between items-center bg-zinc-950">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider group-hover:text-zinc-200">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <div className="font-mono text-xs text-zinc-400 font-bold border border-zinc-800 px-2 py-1 bg-zinc-900">
                  {cat.product_count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-900 pb-4">
          <div>
            <div className="inline-block bg-white text-black font-mono text-[10px] font-bold px-2 py-0.5 mb-1 uppercase tracking-widest">
              FRESH DROP
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white font-sans">
              NEW ARRIVALS
            </h2>
          </div>
          <Link to="/catalog" className="font-mono text-xs text-white hover:underline flex items-center space-x-1 uppercase">
            <span>View Full Inventory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newArrivals.map((prod) => (
            <div
              key={prod.id}
              className="mono-card group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-w-4 aspect-h-3 h-56 bg-zinc-900 overflow-hidden border-b border-zinc-800">
                  <img
                    src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.is_featured && (
                    <span className="absolute top-3 left-3 bg-white text-black font-mono text-[10px] font-bold px-2 py-1 uppercase">
                      FEATURED
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-zinc-950/90 text-zinc-300 font-mono text-[10px] px-2 py-1 border border-zinc-800 uppercase">
                    {prod.category_name}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Seller: {prod.seller_name}</span>
                    <div className="flex items-center space-x-1 text-white">
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{prod.avg_rating} ({prod.review_count})</span>
                    </div>
                  </div>

                  <Link to={`/product/${prod.id}`} className="block">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wide group-hover:underline line-clamp-2">
                      {prod.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-900/50 mt-4">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Price</div>
                  <PriceDisplay product={prod} size="sm" />
                </div>

                {prod.stock <= 0 ? (
                  <span className="py-2 px-3 text-[10px] font-bold font-mono text-red-400 bg-red-950/60 border border-red-800 uppercase tracking-wide">
                    OUT OF STOCK
                  </span>
                ) : user && user.role === 'admin' ? (
                  <Link
                    to={`/admin/products?edit=${prod.id}`}
                    className="mono-btn-secondary py-2 px-4 text-xs font-bold border-white text-white flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>EDIT PRODUCT</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => addToCart(prod)}
                    className="mono-btn-primary py-2 px-4 text-xs font-bold"
                  >
                    ADD TO CART
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Race Events Preview Section */}
      <section className="bg-zinc-950 border-y border-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
            <div>
              <div className="inline-block bg-white text-black font-mono text-[10px] font-bold px-2 py-0.5 mb-1 uppercase tracking-widest">
                TRACKSIDE CALENDAR
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white font-sans">
                UPCOMING RACE EVENTS
              </h2>
            </div>
            <Link to="/events" className="font-mono text-xs text-white hover:underline flex items-center space-x-1 uppercase">
              <span>View All Race Events</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="bg-black border border-zinc-800 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span>{new Date(ev.event_date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white uppercase font-sans line-clamp-1">
                    {ev.title}
                  </h3>
                  <div className="text-zinc-500 text-[10px] uppercase">{ev.track_type} • {ev.location}</div>
                  <p className="text-zinc-400 text-[11px] font-sans line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-zinc-900">
                  <div className="font-bold text-white">
                    {ev.entry_fee === 0 ? 'FREE' : <PriceDisplay usd={ev.entry_fee} size="sm" showSecondary={false} />}
                  </div>
                  <Link to="/events" className="mono-btn-secondary py-1.5 px-3 text-[10px] uppercase font-bold">
                    RESERVE SPOT (+20 PTS)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Driver Testimonials & Review Collection Showcase */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
            <div>
              <div className="inline-block bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold px-2.5 py-0.5 mb-1 uppercase tracking-widest">
                VERIFIED TELEMETRY FEEDBACK
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white font-sans">
                DRIVER REVIEWS & TESTIMONIALS
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.map((rev) => (
              <div key={rev.id} className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-white text-white' : 'text-zinc-800'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase">Verified Driver</span>
                  </div>

                  <p className="text-zinc-300 text-xs font-sans leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-3">
                  <div className="font-bold text-white">{rev.reviewer_name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase truncate">On: {rev.product_name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Us Section Snippet */}
      <section className="bg-zinc-950 border-y border-zinc-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold px-3 py-1 uppercase">
              ABOUT RC BATTLEGROUND
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white font-sans">
              {aboutContent?.title || 'ENGINEERED FOR THE DISCERNING CONTROLLER'}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line font-sans">
              {aboutContent?.content || 'RC Battleground was founded by motorsport veterans and RC enthusiasts who demanded zero compromises in speed, durability, and craftsmanship. From high-voltage 6S bashing trucks to sub-millimeter gyro drift chassis, we curate only elite competition-grade remote control vehicles and accessories.'}
            </p>
            <div className="pt-2">
              <Link to="/about" className="mono-btn-secondary py-3 px-6 text-xs font-bold inline-flex items-center space-x-2 font-mono">
                <span>READ OUR FULL STORY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-center">
            {aboutContent?.metadata?.stats?.map((stat, i) => (
              <div key={i} className="bg-black border border-zinc-800 p-6 space-y-2">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            )) || (
              <>
                <div className="bg-black border border-zinc-800 p-6 space-y-2">
                  <div className="text-3xl font-black text-white">12,500+</div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-widest">Vehicles Delivered</div>
                </div>
                <div className="bg-black border border-zinc-800 p-6 space-y-2">
                  <div className="text-3xl font-black text-white">450+</div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-widest">Track Records</div>
                </div>
                <div className="bg-black border border-zinc-800 p-6 space-y-2">
                  <div className="text-3xl font-black text-white">8,200+</div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-widest">Active Drivers</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
