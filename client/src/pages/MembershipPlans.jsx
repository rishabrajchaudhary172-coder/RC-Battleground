import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, Check, ShieldCheck, Zap, Award, Star } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function MembershipPlans() {
  const { user, token, refreshUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activeMembership, setActiveMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/memberships/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {}
  };

  const fetchMyStatus = async () => {
    if (!token) {
      setActiveMembership(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/memberships/my-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveMembership(data.membership);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMyStatus();
  }, [token]);

  const handleSubscribe = async (planId) => {
    if (!token) {
      alert('Please sign in to purchase a membership plan.');
      return;
    }

    setSubscribingId(planId);
    setMsg('');

    try {
      const res = await fetch('/api/memberships/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan_id: planId })
      });
      const data = await res.json();

      if (res.ok) {
        setMsg(`🎉 ${data.message}! +50 Bonus Reward Points added to your balance.`);
        fetchMyStatus();
        refreshUser();
      } else {
        setMsg(`Error: ${data.error || 'Failed to update membership'}`);
      }
    } catch (err) {
      setMsg('Server error subscribing to plan');
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300 uppercase">
          <Crown className="w-3.5 h-3.5 text-white" />
          <span>VIP CIRCUIT PASSES & REWARDS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-wide">
          SELECT YOUR DRIVER MEMBERSHIP
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed font-sans">
          Elevate your racing experience with point multipliers, free trackside express shipping, and exclusive early access to limited edition RC vehicles.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-zinc-950 border border-zinc-700 text-white font-mono text-xs text-center max-w-2xl mx-auto">
          {msg}
        </div>
      )}

      {/* Active Membership Status Banner */}
      {user && activeMembership && (
        <div className="bg-zinc-950 border border-white p-6 max-w-4xl mx-auto font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-white shrink-0" />
            <div>
              <div className="text-zinc-400 uppercase text-[10px]">CURRENT ACTIVE MEMBERSHIP</div>
              <div className="text-base font-bold text-white uppercase">{activeMembership.plan_name}</div>
            </div>
          </div>
          <div className="text-right text-zinc-400 text-[11px]">
            <div>Expires: {new Date(activeMembership.end_date).toLocaleDateString()}</div>
            <div className="text-white font-bold">STATUS: ACTIVE</div>
          </div>
        </div>
      )}

      {/* Pricing Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isActive = activeMembership && activeMembership.plan_name === plan.plan_name;
          const isFeatured = plan.plan_name.toLowerCase().includes('pro') || plan.plan_name.toLowerCase().includes('vip');

          return (
            <div
              key={plan.id}
              className={`bg-zinc-950 border p-8 flex flex-col justify-between relative transition-all duration-300 ${isFeatured ? 'border-white ring-1 ring-white shadow-2xl scale-[1.02]' : 'border-zinc-800'}`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black font-mono font-bold text-[10px] px-3 py-0.5 uppercase tracking-widest border border-black">
                  MOST POPULAR DRIVER PASS
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2 border-b border-zinc-900 pb-6">
                  <h3 className="font-bold text-xl uppercase tracking-wider text-white">
                    {plan.plan_name}
                  </h3>
                  <p className="text-xs text-zinc-400 min-h-[40px] font-sans leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="font-mono">
                  <div className="flex items-baseline space-x-2">
                    <PriceDisplay product={plan} size="lg" />
                    <span className="text-xs text-zinc-500 uppercase">/ {plan.duration_days} days</span>
                  </div>
                </div>

                {/* Perks list */}
                <div className="space-y-3 pt-4 font-mono text-xs">
                  <div className="text-zinc-500 uppercase font-bold text-[10px] tracking-widest">Included Benefits</div>
                  <ul className="space-y-2">
                    {plan.perks && plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start space-x-2 text-zinc-300">
                        <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        <span className="leading-tight">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isActive || subscribingId === plan.id}
                  className={`w-full py-3 text-xs font-bold font-mono uppercase tracking-widest border transition-all ${isActive ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-default' : isFeatured ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-black text-white border-zinc-700 hover:border-white'}`}
                >
                  {isActive ? 'CURRENT PLAN ACTIVE' : subscribingId === plan.id ? 'PROCESSING...' : 'ACTIVATE MEMBERSHIP'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
