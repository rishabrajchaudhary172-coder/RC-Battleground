import React, { useState, useEffect } from 'react';
import { CheckCircle2, Rocket, Target, Award, Zap, Trophy, ShieldCheck, Cpu, Flag, Flame, Sparkles, MapPin } from 'lucide-react';
import CategoryTechnologiesTable from '../components/CategoryTechnologiesTable';

export default function AboutUs() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/about_us')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setAboutData(data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 font-sans space-y-16">
      
      {/* --------------------------------------------------------- */}
      {/* SECTION 1: VISION STATEMENT (MATCHING REFERENCE IMAGE UI) */}
      {/* --------------------------------------------------------- */}
      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-xl rounded-2xl relative overflow-hidden transition-colors">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center space-y-4 relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-zinc-900 dark:text-white font-sans uppercase">
            <span className="font-light">VISION </span>
            <span className="font-black text-black dark:text-white">STATEMENT</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed max-w-3xl mx-auto">
            The <span className="font-bold text-zinc-900 dark:text-zinc-200">RC vehicle and telemetry industry</span> is changing constantly around us. We thrive to develop and nurture <span className="font-bold text-zinc-900 dark:text-zinc-200">RC drivers and engineering professionals</span>, equipping them with the latest and most up-to-date vehicles, precision parts, and track knowledge.
          </p>
        </div>

        {/* 4 Vision Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pt-12 relative z-10 items-stretch">
          
          {/* Column 1: Our Vision */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-sans text-zinc-900 dark:text-white">
              Our <span className="font-bold text-black dark:text-white">Vision</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed font-sans">
              To be the most recognized and prestigious RC racing arena & high-performance vehicle marketplace in Nepal.
            </p>
          </div>

          {/* Column 2: Our New Vision */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-5 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Rocket className="w-9 h-9 stroke-[2]" />
            </div>
            <h3 className="text-lg font-sans text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>Our</span>
              <span className="bg-red-600 text-white font-bold text-[11px] uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                New
              </span>
              <span className="font-bold text-black dark:text-white">Vision</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed font-sans">
              <strong className="text-zinc-900 dark:text-zinc-200 font-bold">Rocking</strong> the <strong className="text-zinc-900 dark:text-zinc-200 font-bold">World</strong> from <strong className="text-zinc-900 dark:text-zinc-200 font-bold">Nepal</strong>
            </p>
          </div>

          {/* Column 3: Our Mission */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-blue-500/15 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 shrink-0">
              <Target className="w-9 h-9 stroke-[2]" />
            </div>
            <h3 className="text-lg font-sans text-zinc-900 dark:text-white">
              Our <span className="font-bold text-black dark:text-white">Mission</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed font-sans">
              To develop Industry-Ready Drivers & Precision Telemetry Technology.
            </p>
          </div>

          {/* Column 4: Our Winning Culture */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-purple-500/15 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-5 text-purple-600 dark:text-purple-400 shrink-0">
              <Award className="w-9 h-9 stroke-[2]" />
            </div>
            <h3 className="text-lg font-sans text-zinc-900 dark:text-white">
              <span>Our</span>
              <span className="font-bold text-black dark:text-white block text-xl mt-0.5">Winning Culture</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed font-sans">
              Defines the attitudes & behaviors required of us to make our Vision a reality.
            </p>
          </div>

        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* SECTION 2: FEATURED ARENA PHOTOGRAPHY & BRAND STORY */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Brand Story Card */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 rounded-2xl flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-500/30 px-3 py-1 rounded text-xs font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>THE RC BATTLEGROUND STORY</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tight leading-snug">
              {aboutData?.title || 'ENGINEERED FOR THE DISCERNING CONTROLLER'}
            </h2>

            <div className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-sans pt-2">
              {aboutData?.content || (
                `RC Battleground was founded by motorsport veterans and RC engineering enthusiasts who demanded zero compromises in speed, durability, and chassis craftsmanship.\n\nFrom high-voltage 6S brushless bashing trucks to sub-millimeter gyro drift chassis, we curate only elite competition-grade remote control vehicles, telemetry sensors, and authentic replacement parts in Nepal.`
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-900 font-mono text-center">
            {aboutData?.metadata?.stats?.map((stat, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <div className="text-xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 uppercase">{stat.label}</div>
              </div>
            )) || (
              <>
                <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">12,500+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Vehicles Delivered</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">450+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Track Records</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">8,200+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Active Drivers</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Hero Generated Photography Banner */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative shadow-xl min-h-[380px] bg-zinc-950 group">
          <img
            src={aboutData?.metadata?.hero_image || "/rc_arena_vision_hero.jpg"}
            alt={aboutData?.metadata?.hero_title || "Official RC Battleground Arena & Pit Headquarters"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 space-y-2">
            <div className="inline-flex items-center space-x-2 bg-red-600 text-white text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded w-max">
              <MapPin className="w-3.5 h-3.5" />
              <span>{aboutData?.metadata?.hero_badge || "OFFICIAL RC ARENA & TELEMETRY PIT HEADQUARTERS — NEPAL"}</span>
            </div>
            <h3 className="text-white text-lg sm:text-xl font-bold font-sans">
              {aboutData?.metadata?.hero_title || "Precision High-Speed Arena & Trackside Diagnostic Bay"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-xl">
              {aboutData?.metadata?.hero_description || "Equipped with live lap timers, telemetry telemetry sensors, sub-millimeter gyro calibration, and 100% genuine replacement parts."}
            </p>
          </div>
        </div>

      </div>

      {/* --------------------------------------------------------- */}
      {/* SECTION 3: EDITABLE / ADDED GALLERY OF RC CATEGORY IMAGES */}
      {/* --------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-wide">
              OUR PRECISION FLEET & ARENA GALLERY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              High-performance machines tested and certified for peak telemetry output
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-zinc-900 text-white px-3 py-1.5 rounded uppercase">
            CERTIFIED 100% AUTHENTIC RC SPECS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(aboutData?.metadata?.gallery || [
            {
              id: 1,
              tag: 'OFF-ROAD 4WD',
              title: 'APEX OFF-ROAD BUGGIES',
              description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.',
              image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 2,
              tag: '1/10 RWD DRIFT',
              title: 'TOKYO SPEC DRIFT CARS',
              description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.',
              image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 3,
              tag: '6S BASHING TRUCKS',
              title: 'TITAN CRUSHER BASHING TRUCKS',
              description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.',
              image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
            }
          ]).map((card, idx) => (
            <div key={card.id || idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-lg group hover:border-red-500/50 transition-all duration-300">
              <div className="h-52 overflow-hidden relative">
                <img
                  src={card.image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                  alt={card.title || 'Fleet Image'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-3 left-3 bg-black/80 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-zinc-700">
                  {card.tag || 'CERTIFIED RC'}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase">{card.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- */}
      {/* SECTION 4: CATEGORY TECHNOLOGIES & SYSTEM SPECS TABLE */}
      {/* --------------------------------------------------------- */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900">
        <CategoryTechnologiesTable />
      </div>

    </div>
  );
}
