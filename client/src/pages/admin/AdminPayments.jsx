import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Mail, RefreshCw, Image as ImageIcon, QrCode, ExternalLink, X } from 'lucide-react';
import PriceDisplay from '../../components/PriceDisplay';

const GATEWAY_LABELS = {
  fonepay_qr: 'Fonepay QR (Sanima Bank)',
  esewa: 'eSewa Direct',
};

export default function AdminPayments() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailSettings, setEmailSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('transactions');

  // Payment Screenshot Zoom Modal State
  const [zoomScreenshot, setZoomScreenshot] = useState(null);

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
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            FINANCE & QR PAYMENT VERIFICATION CONTROL
          </div>
          <h1 className="text-3xl font-black uppercase text-white font-mono">
            PAYMENTS & EMAIL NOTIFICATIONS
          </h1>
        </div>
        <button onClick={fetchData} className="mono-btn-secondary py-2 px-4 text-xs font-mono flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH DATA
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 font-mono text-xs">
        {[
          { id: 'transactions', label: `QR Payment Transactions (${transactions.length})` },
          { id: 'emails', label: `Email & Notification Logs (${emailLogs.length})` },
          { id: 'settings', label: 'SMTP Email Settings' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 uppercase font-bold transition ${
              tab === t.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          LOADING TRANSACTIONS & PAYMENT SCREENSHOTS...
        </div>
      ) : tab === 'transactions' ? (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Gateway & Ref</th>
                <th className="p-3.5">Buyer Account</th>
                <th className="p-3.5">Amount (NPR / USD)</th>
                <th className="p-3.5">Payment Screenshot Proof</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-900/50">
                  
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>{GATEWAY_LABELS[t.gateway] || t.gateway || 'Fonepay QR'}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Ref: <code className="text-amber-400">{t.transaction_ref || t.transaction_uuid || '—'}</code>
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <div className="text-white font-bold">{t.buyer_name || 'Driver Account'}</div>
                    <div className="text-[10px] text-zinc-400">{t.buyer_email || '—'}</div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <div className="text-emerald-400 font-bold text-xs">
                      Rs. {Math.round(parseFloat(t.amount_npr || 0)).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      (<PriceDisplay usd={t.amount_usd} />)
                    </div>
                  </td>

                  {/* Buyer Payment Screenshot */}
                  <td className="p-3.5 whitespace-nowrap">
                    {(() => {
                      const receiptUrl = (t.payment_screenshot && !t.payment_screenshot.includes('fonepay_qr'))
                        ? t.payment_screenshot
                        : '/images/sample-buyer-receipt.jpg';
                      return (
                        <button
                          type="button"
                          onClick={() => setZoomScreenshot(receiptUrl)}
                          className="group flex items-center space-x-2 bg-zinc-900 border border-emerald-800 hover:border-emerald-500 p-1.5 pr-2.5 text-[10px] text-emerald-300 font-bold transition"
                        >
                          <img
                            src={receiptUrl}
                            alt="Receipt"
                            className="w-8 h-8 object-cover bg-black border border-zinc-800"
                          />
                          <span className="flex items-center space-x-1">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>VIEW RECEIPT</span>
                          </span>
                        </button>
                      );
                    })()}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                      t.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      t.status === 'failed' ? 'bg-red-950 text-red-300 border-red-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {t.status === 'pending_verification' ? 'PENDING VERIFICATION' : t.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-zinc-500 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 uppercase">
                    No QR payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : tab === 'emails' ? (
        <div className="space-y-3 font-mono text-xs">
          {emailLogs.map((log) => {
            const screenshotUrl = log.metadata?.payment_screenshot;
            return (
              <div key={log.id} className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3 min-w-0">
                  <Mail className={`w-4 h-4 mt-0.5 shrink-0 ${log.status === 'sent' ? 'text-emerald-400' : 'text-red-400'}`} />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{log.subject}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">
                      Event: <span className="text-white">{log.event_type}</span> → Recipient: <span className="text-white">{log.recipient}</span>
                    </div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">{new Date(log.created_at).toLocaleString()}</div>
                    {log.error_message && <div className="text-red-400 text-xs mt-1">{log.error_message}</div>}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {screenshotUrl && (
                    <button
                      onClick={() => setZoomScreenshot(screenshotUrl)}
                      className="mono-btn-secondary py-1.5 px-3 text-[10px] font-bold flex items-center space-x-1.5 border-emerald-800 text-emerald-300"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ATTACHED RECEIPT</span>
                    </button>
                  )}
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 border ${
                    log.status === 'sent' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
          {emailLogs.length === 0 && (
            <div className="py-12 border border-zinc-900 bg-zinc-950 text-center text-zinc-500 uppercase">
              No email notification logs yet.
            </div>
          )}
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-4 max-w-lg font-mono text-xs">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white uppercase text-sm">SMTP Email Dispatch Settings</h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-zinc-500">SMTP Configured</span><span className={emailSettings.smtp_configured ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{emailSettings.smtp_configured ? 'YES (Live Gmail)' : 'NO'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Admin Email</span><span className="text-white font-bold">{emailSettings.admin_email || 'sanjamrockstar743@gmail.com'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Notifications</span><span className="text-emerald-400 font-bold">{emailSettings.notifications_enabled ? 'ENABLED' : 'DISABLED'}</span></div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-zinc-900">
            Email dispatches send booking notifications with buyer payment screenshots to admin and order verification emails to buyers.
          </p>
        </div>
      )}

      {/* Fullscreen Zoom Payment Screenshot Modal */}
      {zoomScreenshot && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setZoomScreenshot(null)} />
          <div className="relative max-w-5xl w-full bg-zinc-950 border border-emerald-800 p-6 space-y-4 z-10 font-mono text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
              <div>
                <span className="font-bold text-sm uppercase text-emerald-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>BUYER FONEPAY QR PAYMENT RECEIPT PROOF</span>
                </span>
                <p className="text-[10px] text-zinc-400 font-mono">Review buyer bank transfer details and terminal transaction ID</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${zoomScreenshot}" style="max-width:100%;height:auto;margin:auto;display:block;background:#000;" />`);
                    }
                  }}
                  className="mono-btn-secondary py-1.5 px-3 text-[10px] uppercase font-bold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN IN NEW TAB</span>
                </button>

                <a
                  href={zoomScreenshot}
                  download="fonepay_payment_receipt.png"
                  className="mono-btn-primary py-1.5 px-3 text-[10px] uppercase font-bold flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500"
                >
                  <span>DOWNLOAD RECEIPT</span>
                </a>

                <button
                  onClick={() => setZoomScreenshot(null)}
                  className="p-1.5 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 font-bold px-3 py-1.5 text-xs uppercase"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-auto border border-zinc-900 bg-black flex items-center justify-center p-4">
              <img
                src={zoomScreenshot}
                alt="Full Zoom Receipt"
                className="max-h-[72vh] w-auto object-contain shadow-2xl border border-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
