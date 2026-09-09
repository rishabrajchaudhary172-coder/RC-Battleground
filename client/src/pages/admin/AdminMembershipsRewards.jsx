import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import PriceDisplay from '../../components/PriceDisplay';
import { Crown, Award, Edit2, Check, Save, RefreshCw } from 'lucide-react';

export default function AdminMembershipsRewards() {
  const { token } = useAuth();
  
  // Reward settings
  const [rewardSettings, setRewardSettings] = useState({
    points_per_dollar_spent: 1.00,
    dollars_per_point_redeemed: 0.05
  });
  const [savingReward, setSavingReward] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  // Membership plans
  const [plans, setPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planFormData, setPlanFormData] = useState({ plan_name: '', price: '', duration_days: '', description: '', perksText: '' });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMsg, setPlanMsg] = useState('');

  const fetchRewardSettings = async () => {
    try {
      const res = await fetch('/api/rewards/settings');
      const data = await res.json();
      if (data.settings) setRewardSettings(data.settings);
    } catch (err) {}
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/memberships/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchRewardSettings();
    fetchPlans();
  }, []);

  const handleSaveRewardSettings = async (e) => {
    e.preventDefault();
    setSavingReward(true);
    setRewardMsg('');

    try {
      const res = await fetch('/api/rewards/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rewardSettings)
      });
      const data = await res.json();
      if (res.ok) {
        setRewardMsg('✅ Reward points rate settings saved successfully!');
      } else {
        setRewardMsg(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch (err) {
      setRewardMsg('Server error saving settings');
    } finally {
      setSavingReward(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setPlanFormData({
      plan_name: plan.plan_name,
      price: plan.price,
      duration_days: plan.duration_days,
      description: plan.description,
      perksText: plan.perks ? plan.perks.join('\n') : ''
    });
    setPlanMsg('');
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setSavingPlan(true);
    setPlanMsg('');

    const perksArray = planFormData.perksText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      const res = await fetch(`/api/memberships/plans/${editingPlanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_name: planFormData.plan_name,
          price: parseFloat(planFormData.price),
          duration_days: parseInt(planFormData.duration_days, 10),
          description: planFormData.description,
          perks: perksArray
        })
      });

      if (res.ok) {
        setEditingPlanId(null);
        setPlanMsg('✅ Membership plan updated successfully!');
        fetchPlans();
      } else {
        const data = await res.json();
        setPlanMsg(`Error: ${data.error || 'Failed to save plan'}`);
      }
    } catch (err) {
      setPlanMsg('Server error saving membership plan');
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="space-y-12 font-sans">
      
      {/* Title Bar */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
          LOYALTY PROGRAM & VIP TIER CONFIGURATION
        </div>
        <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
          MEMBERSHIP & REWARD SETTINGS
        </h1>
      </div>

      {/* Reward Points Earning & Redemption Rates Configuration */}
      <div className="bg-zinc-950 border border-zinc-800 p-8 space-y-6 max-w-3xl">
        <div className="flex items-center space-x-3 border-b border-zinc-900 pb-4">
          <Award className="w-6 h-6 text-white" />
          <div>
            <h2 className="font-mono font-bold text-base uppercase text-white tracking-wider">
              REWARD POINTS SYSTEM CONFIGURATION
            </h2>
            <p className="text-xs font-mono text-zinc-400">Set buyer earning rates per dollar spent and point redemption value</p>
          </div>
        </div>

        {rewardMsg && (
          <div className="p-3 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs">
            {rewardMsg}
          </div>
        )}

        <form onSubmit={handleSaveRewardSettings} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-zinc-400 uppercase mb-1">Earning Rate (Points Per $1 Spent)</label>
              <input
                type="number"
                step="0.1"
                required
                value={rewardSettings.points_per_dollar_spent}
                onChange={(e) => setRewardSettings({ ...rewardSettings, points_per_dollar_spent: parseFloat(e.target.value) })}
                className="w-full mono-input"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block flex items-center justify-between">
                <span>e.g., 1.0 = 1 pt per $1 spent</span>
                <span className="text-zinc-400 font-bold">(≈ <PriceDisplay usd={1} /> spent)</span>
              </span>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">Redemption Value ($ Discount Per Point)</label>
              <input
                type="number"
                step="0.001"
                required
                value={rewardSettings.dollars_per_point_redeemed}
                onChange={(e) => setRewardSettings({ ...rewardSettings, dollars_per_point_redeemed: parseFloat(e.target.value) })}
                className="w-full mono-input"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block flex items-center justify-between">
                <span>e.g., 100 points = $5.00 off</span>
                <span className="text-zinc-400 font-bold">(≈ <PriceDisplay usd={100 * (rewardSettings.dollars_per_point_redeemed || 0.05)} /> discount)</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingReward}
            className="mono-btn-primary py-2.5 px-6 font-bold uppercase tracking-widest"
          >
            {savingReward ? 'SAVING SETTINGS...' : 'SAVE REWARD SYSTEM RATES'}
          </button>
        </form>
      </div>

      {/* Membership Plan Tier Pricing & Duration Editor */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-white" />
            <span>MEMBERSHIP PLAN TIERS & PRICING</span>
          </h2>
        </div>

        {planMsg && (
          <div className="p-3 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs">
            {planMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isEditing = editingPlanId === plan.id;

            return (
              <div key={plan.id} className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs flex flex-col justify-between">
                {isEditing ? (
                  <form onSubmit={handleSavePlan} className="space-y-3">
                    <div className="font-bold text-sm text-white uppercase border-b border-zinc-900 pb-2">
                      EDIT {plan.plan_name}
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px]">Plan Name</label>
                      <input
                        type="text"
                        required
                        value={planFormData.plan_name}
                        onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                        className="w-full mono-input"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px]">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={planFormData.price}
                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                        className="w-full mono-input"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px]">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        value={planFormData.duration_days}
                        onChange={(e) => setPlanFormData({ ...planFormData, duration_days: e.target.value })}
                        className="w-full mono-input"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase text-[10px]">Perks (One per line)</label>
                      <textarea
                        rows={3}
                        value={planFormData.perksText}
                        onChange={(e) => setPlanFormData({ ...planFormData, perksText: e.target.value })}
                        className="w-full mono-input"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={savingPlan}
                        className="flex-1 mono-btn-primary py-2 font-bold"
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="mono-btn-secondary py-2 px-3"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                        <div>
                          <h3 className="font-bold text-sm text-white uppercase">{plan.plan_name}</h3>
                          <div className="text-zinc-400 text-[10px] mt-0.5">{plan.description}</div>
                        </div>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xl font-bold text-white flex items-baseline space-x-1.5">
                        <PriceDisplay usd={parseFloat(plan.price)} size="lg" />
                        <span className="text-xs text-zinc-500 font-normal">/ {plan.duration_days} days</span>
                      </div>

                      <div className="space-y-1 text-zinc-300 text-[11px] pt-2">
                        <div className="text-zinc-500 font-bold uppercase text-[10px]">Perks:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                          {plan.perks && plan.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
