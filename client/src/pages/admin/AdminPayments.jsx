import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Mail, RefreshCw } from 'lucide-react';

const GATEWAY_LABELS = {
  esewa: 'eSewa', khalti: 'Khalti', mobile_banking: 'Mobile Banking',
  debit_card: 'Debit Card', credit_card: 'Credit Card',
};

export default function AdminPayments() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailSettings, setEmailSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('transactions');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txnRes, logRes, emailRes] = await Promise.all([
        fetch('/api/payments/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/payments/email-logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/settings/email', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [txnData, logData, emailData] = await Promise.all([txnRes.json(), logRes.json(), emailRes.json()]);
      setTransactions(txnData.transactions || []);
      setEmailLogs(logData.logs || []);
      setEmailSettings(emailData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">Finance & Notifications</div>
          <h1 className="text-3xl font-black uppercase text-white">Payments & Email Logs</h1>
        </div>
        <button onClick={fetchData} className="mono-btn-secondary py-2 px-4 text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {['transactions', 'emails', 'settings'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs uppercase font-mono ${tab === t ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-400 text-sm">Loading...</p>
      ) : tab === 'transactions' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                <th className="text-left py-3 px-2">Ref</th>
                <th className="text-left py-3 px-2">Gateway</th>
                <th className="text-left py-3 px-2">Buyer</th>
                <th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-zinc-900 hover:bg-zinc-950">
                  <td className="py-3 px-2 text-white">{t.transaction_ref}</td>
                  <td className="py-3 px-2">{GATEWAY_LABELS[t.gateway] || t.gateway}</td>
                  <td className="py-3 px-2">{t.buyer_name || '—'}</td>
                  <td className="py-3 px-2">${parseFloat(t.amount_usd).toFixed(2)} / Rs.{parseFloat(t.amount_npr).toFixed(0)}</td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 ${t.status === 'completed' ? 'bg-emerald-900 text-emerald-300' : 'bg-zinc-800'}`}>{t.status}</span></td>
                  <td className="py-3 px-2 text-zinc-500">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      ) : tab === 'emails' ? (
        <div className="space-y-3">
          {emailLogs.map((log) => (
            <div key={log.id} className="border border-zinc-800 p-4 flex items-start gap-4">
              <Mail className={`w-4 h-4 mt-0.5 shrink-0 ${log.status === 'sent' ? 'text-emerald-400' : 'text-red-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">{log.subject}</div>
                <div className="text-xs text-zinc-500">{log.event_type} → {log.recipient} · {new Date(log.created_at).toLocaleString()}</div>
                {log.error_message && <div className="text-xs text-red-400 mt-1">{log.error_message}</div>}
              </div>
              <span className={`text-[10px] uppercase px-2 py-0.5 ${log.status === 'sent' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>{log.status}</span>
            </div>
          ))}
          {emailLogs.length === 0 && <p className="text-zinc-500 text-sm">No email logs yet. Configure SMTP in .env to enable live notifications.</p>}
        </div>
      ) : (
        <div className="border border-zinc-800 p-6 space-y-4 max-w-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white uppercase text-sm">Email Notification Settings</h3>
          </div>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between"><span className="text-zinc-500">SMTP Configured</span><span className={emailSettings.smtp_configured ? 'text-emerald-400' : 'text-red-400'}>{emailSettings.smtp_configured ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Admin Email</span><span className="text-white">{emailSettings.admin_email || 'Not set'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Notifications</span><span className="text-white">{emailSettings.notifications_enabled ? 'Enabled' : 'Disabled'}</span></div>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">Set SMTP_HOST, SMTP_USER, SMTP_PASS, and ADMIN_EMAIL in server/.env for live email delivery on orders and membership signups.</p>
        </div>
      )}
    </div>
  );
}
