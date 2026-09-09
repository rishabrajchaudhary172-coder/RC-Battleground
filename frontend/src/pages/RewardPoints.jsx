import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Zap, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function RewardPoints() {
  const { user, token } = useAuth();
  const [pointsData, setPointsData] = useState({ balance: 0, total_earned: 0, total_redeemed: 0, history: [] });
  const [settings, setSettings] = useState({ points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rewards/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});

    if (token) {
      fetch('/api/rewards/my-points', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          setPointsData({
            balance: data.balance || 0,
            total_earned: data.total_earned || 0,
            total_redeemed: data.total_redeemed || 0,
            history: data.history || []
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <Award className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold uppercase text-white">REWARD POINTS PORTAL</h2>
        <p className="text-xs text-zinc-400">Sign in to check your points balance and redeem store discounts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            DRIVER REWARD TELEMETRY
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide">
            REWARD POINTS & HISTORY
          </h1>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 px-4 py-2 text-xs font-mono">
          <span className="text-zinc-400">Redemption Value: </span>
          <span className="text-white font-bold">100 Points = <PriceDisplay usd={100 * settings.dollars_per_point_redeemed} /> Off</span>
        </div>
      </div>

      {/* Balance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        <div className="bg-zinc-950 border border-white p-6 space-y-2">
          <div className="text-zinc-400 text-xs uppercase flex items-center justify-between">
            <span>AVAILABLE BALANCE</span>
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-4xl font-black text-white">{pointsData.balance} PTS</div>
          <div className="text-[11px] text-zinc-400">
            ≈ <PriceDisplay usd={pointsData.balance * settings.dollars_per_point_redeemed} /> store checkout credit
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-400 text-xs uppercase flex items-center justify-between">
            <span>TOTAL EARNED</span>
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-bold text-white">+{pointsData.total_earned} PTS</div>
          <div className="text-[11px] text-zinc-500">
            Rate: {settings.points_per_dollar_spent} pt per $1 (<PriceDisplay usd={1} />) spent
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-2">
          <div className="text-zinc-400 text-xs uppercase flex items-center justify-between">
            <span>TOTAL REDEEMED</span>
            <ArrowDownLeft className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="text-3xl font-bold text-white">-{pointsData.total_redeemed} PTS</div>
          <div className="text-[11px] text-zinc-500">Applied towards order discounts</div>
        </div>
      </div>

      {/* Points History Table */}
      <div className="space-y-4">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
          TRANSACTION HISTORY LOG ({pointsData.history.length})
        </h3>

        {pointsData.history.length === 0 ? (
          <div className="py-12 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
            No points transactions recorded yet. Make purchases to earn points!
          </div>
        ) : (
          <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Points</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {pointsData.history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/50">
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 uppercase font-bold text-[10px] border ${tx.type === 'earned' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-300 border-zinc-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {tx.type === 'earned' ? `+${tx.points}` : `-${tx.points}`} PTS
                    </td>
                    <td className="p-3.5 text-zinc-300">{tx.description}</td>
                    <td className="p-3.5 text-zinc-500">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
