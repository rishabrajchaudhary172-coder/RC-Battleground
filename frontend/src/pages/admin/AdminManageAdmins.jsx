import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  Crown,
  X,
  Shield,
  Layers
} from 'lucide-react';

export default function AdminManageAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [maxAdminLimit, setMaxAdminLimit] = useState(5);
  const [currentCount, setCurrentCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '', password: '' });
  const [limitInput, setLimitInput] = useState(5);

  const token = localStorage.getItem('rc_token');
  const isMasterAdmin = Boolean(user?.is_master_admin || user?.id === 1);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/admins-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins || []);
        setMaxAdminLimit(data.max_admin_limit || 5);
        setLimitInput(data.max_admin_limit || 5);
        setCurrentCount(data.current_admin_count || (data.admins ? data.admins.length : 1));
      } else {
        setError(data.error || 'Failed to load admin accounts list');
      }
    } catch (err) {
      setError('Network error connecting to admin telemetry server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'New Admin created successfully!');
        setShowAddModal(false);
        setFormData({ full_name: '', email: '', password: '' });
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to create new admin account');
      }
    } catch (err) {
      setError('Error submitting admin account creation request');
    }
  };

  const handleEditAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingAdmin) return;

    try {
      const res = await fetch(`/api/admin/edit-admin/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Admin account credentials updated!');
        setShowEditModal(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to update admin account credentials');
      }
    } catch (err) {
      setError('Error submitting admin credentials update');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete the admin account '${adminName}'? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/delete-admin/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Admin account deleted successfully!');
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to delete admin account');
      }
    } catch (err) {
      setError('Error deleting admin account');
    }
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/update-admin-limit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ max_admin_limit: limitInput })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Max admin limit updated!');
        setMaxAdminLimit(data.max_admin_limit);
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to update max admin limit');
      }
    } catch (err) {
      setError('Error updating max admin limit setting');
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      full_name: admin.full_name,
      email: admin.email,
      password: '' // empty means keep existing password
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-950/80 border border-purple-800 text-purple-300 text-xs px-3 py-1 font-mono font-bold uppercase rounded mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>MASTER COMMAND • SECOND LIEUTENANT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-mono tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white shrink-0" />
            <span>ADMINISTRATOR ACCOUNTS & PERMISSIONS</span>
          </h1>

          <p className="text-xs font-mono text-zinc-400 mt-1 max-w-2xl">
            Configure system administrator accounts, manage login IDs and passwords, and set max admin limits.
          </p>
        </div>

        {/* Action Button */}
        {isMasterAdmin && (
          <button
            onClick={() => {
              setFormData({ full_name: '', email: '', password: '' });
              setShowAddModal(true);
            }}
            disabled={currentCount >= maxAdminLimit}
            className={`mono-btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg ${
              currentCount >= maxAdminLimit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ ADD NEW ADMIN ACCOUNT</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center justify-between rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center justify-between rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Master Admin Info & Max Limit Setting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Master Admin Card */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-6 rounded-xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white text-black font-black text-xl flex items-center justify-center font-mono rounded-lg shadow-md">
                SL
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">PRIMARY MASTER ADMIN</div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>Second Lieutenant</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">MASTER</span>
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                const masterAdmin = admins.find(a => a.is_master_admin || a.id === 1) || { id: 1, full_name: 'Second Lieutenant', email: user?.email || 'admin@rcbattleground.com' };
                openEditModal(masterAdmin);
              }}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold border border-zinc-700 rounded transition-all flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>EDIT ID & PASSWORD</span>
            </button>
          </div>

          <div className="pt-3 border-t border-zinc-900 text-xs font-mono text-zinc-400 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Master Admin ID / Email:</span>
              <span className="text-white font-bold">{user?.email || 'admin@rcbattleground.com'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Privilege Tier:</span>
              <span className="text-emerald-400 font-bold">Full Master Access & Admin Creator</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Email Verification for Login:</span>
              <span className="text-zinc-300 font-bold">Bypassed (Direct Secure Access)</span>
            </div>
          </div>
        </div>

        {/* Max Admin Limit Setting Card */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 rounded-xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 font-bold uppercase">
              <Settings className="w-4 h-4 text-purple-400" />
              <span>MAX ADMIN CAPACITY CONTROL</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black text-white">{currentCount} / {maxAdminLimit}</span>
              <span className="text-xs text-zinc-500 uppercase">ACTIVE ADMIN ACCOUNTS</span>
            </div>
            
            <p className="text-xs font-mono text-zinc-400 mt-2 leading-relaxed">
              Master Admin can edit the maximum allowed number of administrator accounts.
            </p>
          </div>

          {isMasterAdmin && (
            <form onSubmit={handleUpdateLimit} className="pt-3 border-t border-zinc-900 flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Max Limit</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={limitInput}
                  onChange={(e) => setLimitInput(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-2 font-mono focus:border-white focus:outline-none rounded"
                />
              </div>

              <button
                type="submit"
                className="mt-5 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold border border-zinc-700 rounded uppercase tracking-wider transition-colors shrink-0"
              >
                UPDATE LIMIT
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Admin Accounts Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>ALL ACTIVE ADMINISTRATOR ACCOUNTS</span>
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              All admins have equal permissions to edit site content, products, orders, events, & settings.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-1 rounded">
            {admins.length} Total Registered Admin{admins.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-zinc-500 space-y-2">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
            <p>Loading Admin Telemetry Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <th className="p-4">ID</th>
                  <th className="p-4">FULL NAME</th>
                  <th className="p-4">EMAIL / LOGIN ID</th>
                  <th className="p-4">ROLE TIER</th>
                  <th className="p-4">CREATED DATE</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {admins.map((admin) => {
                  const isMaster = Boolean(admin.is_master_admin || admin.id === 1);
                  return (
                    <tr key={admin.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-4 font-bold text-zinc-500">#{admin.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{admin.full_name}</span>
                          {isMaster && (
                            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded uppercase">
                              Second Lieutenant
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-300">{admin.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          isMaster ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                        }`}>
                          {isMaster ? 'Master Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'System Seed'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold border border-zinc-800 rounded transition-colors"
                          title="Edit Admin Credentials (ID & Password)"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
                          Edit Credentials
                        </button>

                        {isMasterAdmin && !isMaster && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.full_name)}
                            className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/80 text-red-300 font-bold border border-red-900 rounded transition-colors"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1 text-red-400" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: ADD NEW ADMIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md p-6 rounded-xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>CREATE NEW ADMIN ACCOUNT</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain Alex"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Email / Admin ID <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.admin@rcbattleground.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Login Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Set strong password..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="mono-btn-primary py-2 px-6 font-bold uppercase tracking-wider"
                >
                  CREATE ADMIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: EDIT ADMIN CREDENTIALS (ID & PASSWORD) */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md p-6 rounded-xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>EDIT ADMIN CREDENTIALS ({editingAdmin.full_name})</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Email / Login ID</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">New Password (Leave blank to keep existing)</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password if changing..."
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-3 py-2 focus:border-white focus:outline-none rounded"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="mono-btn-primary py-2 px-6 font-bold uppercase tracking-wider"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
