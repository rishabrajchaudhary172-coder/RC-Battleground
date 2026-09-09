import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, Zap, Users, Trophy } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-16">
      
      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300 uppercase">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>ABOUT RC BATTLEGROUND</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
          {aboutData?.title || 'ENGINEERED FOR THE DISCERNING CONTROLLER'}
        </h1>
      </div>

      {/* Main Content & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed font-sans whitespace-pre-line bg-zinc-950 border border-zinc-800 p-8">
          {aboutData?.content || (
            `RC Battleground was founded by motorsport veterans and RC enthusiasts who demanded zero compromises in speed, durability, and craftsmanship.\n\nFrom high-voltage 6S bashing trucks to sub-millimeter gyro drift chassis, we curate only elite competition-grade remote control vehicles and accessories.`
          )}
        </div>

        <div className="space-y-6">
          <div className="aspect-w-16 aspect-h-9 h-80 bg-zinc-900 border border-zinc-800 overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80"
              alt="Pit Crew Trackside"
              className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <span className="font-mono text-xs text-white font-bold uppercase tracking-widest">
                OFFICIAL RC BATTLEGROUND TRACKSIDE HEADQUARTERS
              </span>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-4 font-mono text-center">
            {aboutData?.metadata?.stats?.map((stat, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 uppercase">{stat.label}</div>
              </div>
            )) || (
              <>
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                  <div className="text-2xl font-black text-white">12,500+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Vehicles Delivered</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                  <div className="text-2xl font-black text-white">450+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Track Records</div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                  <div className="text-2xl font-black text-white">8,200+</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Active Drivers</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Technologies & System Specs Table Section */}
      <div className="pt-8 border-t border-zinc-900">
        <CategoryTechnologiesTable />
      </div>
    </div>
  );
}
