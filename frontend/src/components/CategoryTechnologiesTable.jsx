import React from 'react';
import { ShieldCheck, Zap, Cpu, Wrench, BatteryCharging, Radio, Disc, Layout } from 'lucide-react';

export const DEFAULT_RC_CAR_TECHNOLOGIES = [
  {
    category: 'RC Chassis & Structural Frame',
    technology: 'Aircraft-Grade 6061-T6 Aluminum & Carbon Fiber Double-Deck Chassis',
    description: 'Ultra-rigid, low center of gravity chassis engineered for extreme impact resistance during high-speed off-road jumps and high-g track cornering.',
    icon: ShieldCheck
  },
  {
    category: 'Powertrain & Brushless Motors',
    technology: '4-Pole High-Torque Brushless Motors (3660-4274 KV) with Waterproof 120A/160A ESC',
    description: 'Delivers instantaneous wheel torque and top speeds up to 70+ MPH with active thermal protection and programmable throttle profiles.',
    icon: Zap
  },
  {
    category: 'Drivetrain & Differentials',
    technology: 'Heavy-Duty 4WD Shaft Drive with Hardened Steel Bevel Gears & Heavy-Duty CVD Driveshafts',
    description: 'Provides maximum power transfer to all four wheels for seamless traction across gravel, dirt, track asphalt, and polished drift surfaces.',
    icon: Cpu
  },
  {
    category: 'Suspension & Shock Absorbers',
    technology: 'Full Aluminum Oil-Filled Threaded Coilovers with Dual-Rate Springs & Anti-Roll Sway Bars',
    description: 'Absorbs heavy obstacle impacts, dampens high-g landings, and maintains maximum tire contact patch during aggressive cornering.',
    icon: Wrench
  },
  {
    category: 'Power & LiPo Battery Technology',
    technology: 'High-Discharge 3S-6S LiPo Packs (50C-100C Rating) with Gold-Plated High-Current Connectors',
    description: 'Sustained peak voltage delivery for intense bashing sessions, drift endurance, and championship sprint racing.',
    icon: BatteryCharging
  },
  {
    category: 'Radio Frequency & Gyro Assist',
    technology: '2.4GHz FHSS 4-Channel Pistol Transmitter with Integrated AVC Gyro Stability Control',
    description: 'Zero-latency telemetry feedback with real-time steering gyro adjustment for precision counter-steer drifting and straight-line tracking.',
    icon: Radio
  },
  {
    category: 'Tires & Compound Engineering',
    technology: 'Reinforced Belted All-Terrain Rubber Treaded Tires & Polished Hard Drift Compound Slicks',
    description: 'Belted tire technology prevents high-RPM tire ballooning at top speeds while slick compounds ensure controlled sliding friction.',
    icon: Disc
  },
  {
    category: 'Scale Realism & Aerodynamics',
    technology: 'Officially Licensed Polycarbonate Scale Bodies with Modular LED Headlight & Tail Light Kits',
    description: 'High-impact lexan shells featuring functional downforce rear wings, scale roll cages, side mirrors, and realistic detailing.',
    icon: Layout
  }
];

export default function CategoryTechnologiesTable({ customData, title = "RC CARS CATEGORY & PERFORMANCE MATRIX" }) {
  const techList = customData && customData.length > 0 ? customData : DEFAULT_RC_CAR_TECHNOLOGIES;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
            PRECISION RC VEHICLE ENGINEERING
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-mono tracking-wider">
            {title}
          </h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 font-bold uppercase w-fit">
          ● COMPETITION READY SPECIFICATIONS
        </span>
      </div>

      {/* Description Overview Card */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
        <div className="font-mono font-bold text-white uppercase text-xs tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>ABOUT RC CAR CATEGORIES & POWER SYSTEMS</span>
        </div>
        <p>
          Remote control vehicles are categorized by scale size (ranging from 1/8 to 1/16 scale), terrain specialization (Off-Road Buggies, Drift Machines, Monster Bashing Trucks, and Scale Rock Crawlers), and drivetrain configuration. Equipped with high-output brushless motors, 4WD planetary gear differentials, and 2.4GHz gyro-assisted transmitters, RC Battleground vehicles deliver authentic motorsport performance for enthusiasts and professional track drivers.
        </p>
      </div>

      {/* Tech Specifications Matrix Table */}
      <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/90 text-white font-bold uppercase tracking-wider text-xs">
              <th className="p-4 border-r border-zinc-800 w-1/3">RC Component Category</th>
              <th className="p-4">Selected Technology & Performance Engineering</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-200">
            {techList.map((item, idx) => {
              const IconComp = item.icon || ShieldCheck;
              return (
                <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="p-4 border-r border-zinc-800 font-bold text-white flex items-start space-x-3 bg-zinc-950/60">
                    <IconComp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-bold">{item.category}</div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300 font-sans space-y-1">
                    <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 text-white font-bold font-mono inline-block text-xs">
                      {item.technology}
                    </div>
                    {item.description && (
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-1">
                        {item.description}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
