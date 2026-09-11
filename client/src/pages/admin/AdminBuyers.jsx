import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Eye, X, Crown, Award, ShoppingBag, Phone, MapPin, Mail } from 'lucide-react';
import PriceDisplay from '../../components/PriceDisplay';

export default function AdminBuyers() {
  const { token } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Buyer Modal State
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [buyerDetail, setBuyerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/buyers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [token]);

  const handleInspectBuyer = async (id) => {
    setSelectedBuyerId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/buyers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBuyerDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleVerify = async (id) => {
    try {
      const res = await fetch(`/api/admin/buyers/${id}/toggle-verify`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBuyers();
        if (selectedBuyerId === id) handleInspectBuyer(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBuyers = buyers.filter(
    (b) =>
      (b.full_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (b.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (b.role || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            USER ROLE & PROFILE CONTROL
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            USER ACCOUNTS & DIRECTORY ({buyers.length})
          </h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md flex items-center">
          <input
            type="text"
            placeholder="Search by user name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mono-input pl-10 text-xs"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        </div>
      </div>

      {/* Buyers List Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          FETCHING USER DIRECTORY...
        </div>
      ) : filteredBuyers.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No users found matching search criteria.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">User Account & Role</th>
                <th className="p-3.5">Email & Verification</th>
                <th className="p-3.5">Active Membership</th>
                <th className="p-3.5">Reward Points</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredBuyers.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-900/50">
                  <td className="p-3.5">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{b.full_name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold border ${b.role === 'admin' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-300 border-zinc-800'}`}>
                        {b.role || 'BUYER'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-zinc-300">{b.email}</div>
                    <div className="text-[10px] mt-1 flex items-center gap-2">
                      {b.is_verified ? (
                        <span className="text-emerald-400 font-bold">✓ VERIFIED EMAIL</span>
                      ) : (
                        <span className="text-amber-400 font-bold">⚡ PENDING VERIFICATION</span>
                      )}
                      <button
                        onClick={() => handleToggleVerify(b.id)}
                        className={`text-[9px] px-1.5 py-0.5 border font-bold uppercase rounded transition-colors ${
                          b.is_verified
                            ? 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                            : 'border-emerald-600/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                        }`}
                        title={b.is_verified ? 'Mark unverified' : 'Approve & verify driver account'}
                      >
                        {b.is_verified ? 'Unverify' : 'Verify Driver'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-zinc-900 text-white border border-zinc-800 px-2 py-0.5 uppercase font-bold text-[10px]">
                      {b.active_membership}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white">{b.reward_points_balance} PTS</td>
                  <td className="p-3.5 text-zinc-400">{b.total_orders}</td>
                  <td className="p-3.5 font-bold text-white"><PriceDisplay usd={b.total_spent || 0} /></td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleInspectBuyer(b.id)}
                      className="mono-btn-secondary py-1 px-3 text-[10px] font-bold flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="w-3 h-3" />
                      <span>INSPECT</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Buyer Detailed Profile Modal */}
      {selectedBuyerId && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedBuyerId(null)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-3xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="font-mono font-bold text-base uppercase tracking-widest">
                FULL DRIVER PROFILE & AUDIT LOG
              </h3>
              <button onClick={() => setSelectedBuyerId(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingDetail || !buyerDetail ? (
              <div className="py-16 text-center font-mono text-xs text-zinc-500 uppercase">
                LOADING FULL BUYER DATA...
              </div>
            ) : (
              <div className="space-y-6 font-mono text-xs">
                
                {/* Profile Overview */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-base font-bold text-white uppercase">{buyerDetail.buyer.full_name}</div>
                      <div className="text-zinc-400 text-[11px]">{buyerDetail.buyer.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-[10px] uppercase">Points Balance</div>
                      <div className="text-lg font-bold text-white">{buyerDetail.buyer.reward_points_balance} PTS</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-2 border-t border-zinc-800">
                    <div>Phone: <span className="text-white">{buyerDetail.buyer.phone || 'N/A'}</span></div>
                    <div>Address: <span className="text-white">{buyerDetail.buyer.address || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Purchase History */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-400 flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Purchase & Order History ({buyerDetail.orders.length})</span>
                  </h4>

                  {buyerDetail.orders.length === 0 ? (
                    <div className="p-4 bg-zinc-900 border border-zinc-850 text-zinc-500 text-center">No orders recorded yet</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {buyerDetail.orders.map((ord) => (
                        <div key={ord.id} className="p-3 bg-zinc-900 border border-zinc-850 flex justify-between items-center">
                          <div>
                            <div className="text-white font-bold">#{ord.order_number}</div>
                            <div className="text-[10px] text-zinc-400">Date: {new Date(ord.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold"><PriceDisplay usd={ord.total_amount} /></div>
                            <span className="uppercase text-[10px] text-zinc-400">{ord.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reward Points Log */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-400 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-white" />
                    <span>Reward Points Audit Log ({buyerDetail.reward_transactions.length})</span>
                  </h4>

                  {buyerDetail.reward_transactions.length === 0 ? (
                    <div className="p-4 bg-zinc-900 border border-zinc-850 text-zinc-500 text-center">No reward transactions recorded</div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {buyerDetail.reward_transactions.map((tx) => (
                        <div key={tx.id} className="p-2.5 bg-zinc-900 border border-zinc-850 flex justify-between items-center text-[11px]">
                          <div>
                            <span className={`font-bold uppercase ${tx.type === 'earned' ? 'text-white' : 'text-zinc-400'}`}>[{tx.type}]</span>
                            <span className="ml-2 text-zinc-300">{tx.description}</span>
                          </div>
                          <div className="font-bold text-white">
                            {tx.type === 'earned' ? `+${tx.points}` : `-${tx.points}`} PTS
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
