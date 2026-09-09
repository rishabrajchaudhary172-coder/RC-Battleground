import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  { id: 1, title: 'UNLEASH HIGH-SPEED DOMINANCE', description: 'Premium RC cars, parts, and accessories built for champions.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80', cta_text: 'SHOP NOW', cta_link: '/catalog' },
  { id: 2, title: 'NEW ARRIVALS — DRIFT MASTERS', description: 'Precision-tuned drift machines with gyro-assisted steering.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW DRIFT CARS', cta_link: '/catalog?category=rc-cars' },
  { id: 3, title: 'MONSTER BASHING TRUCKS', description: '6S power. Steel drivetrain. Zero compromises.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80', cta_text: 'EXPLORE TRUCKS', cta_link: '/catalog' },
  { id: 4, title: 'MEMBERSHIP REWARDS', description: 'Earn up to 2x points with Pro & Elite tiers.', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80', cta_text: 'JOIN NOW', cta_link: '/membership' },
  { id: 5, title: 'RACE EVENTS 2026', description: 'Compete at premier RC racing events across Nepal.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW EVENTS', cta_link: '/events' },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/content/home_slider')
      .then((r) => r.json())
      .then((d) => {
        const s = d.content?.metadata?.slides;
        if (s && s.length >= 1) {
          setSlides([...s].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current] || slides[0];

  return (
    <section className="relative w-full h-[420px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-surface">
      {slides.map((s, i) => (
        <div
          key={s.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex items-center keep-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
          <div className="max-w-xl space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-lg">
              {slide.description}
            </p>
            {slide.cta_link && (
              <Link to={slide.cta_link} className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                {slide.cta_text || 'Learn More'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors" aria-label="Previous slide">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors" aria-label="Next slide">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/70'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
