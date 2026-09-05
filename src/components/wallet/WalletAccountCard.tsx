'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Transaction = { id: string; type: string; status: string; amount: number; currency: string; description: string; createdAt: string };
type WalletData = { id: string; walletHandle: string; qrPayload: string; currency: string; balance: number; transactions: Transaction[] };
type Modal = 'pay' | 'withdraw' | null;

export default function WalletAccountCard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState('500');
  const [destination, setDestination] = useState('');
  const [qr, setQr] = useState<{ imageUrl: string; amount: number; expiresAt: string } | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'live' | 'sandbox' | 'unknown'>('unknown');
  const [payoutsLive, setPayoutsLive] = useState(false);

  const load = async () => {
    const response = await fetch('/api/wallet/account', { cache: 'no-store' });
    if (response.ok) setWallet(await response.json());
  };
  useEffect(() => {
    load();
    fetch('/api/wallet/payment-mode').then(r => r.json()).then(d => { setMode(d.payments === 'live' ? 'live' : 'sandbox'); setPayoutsLive(d.payouts === 'live'); }).catch(() => setMode('unknown'));
  }, []);

  const createQr = async () => {
    setBusy(true); setMessage(''); setQr(null);
    try {
      const response = await fetch('/api/wallet/create-qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create payment QR');
      setQr({ imageUrl: data.imageUrl, amount: data.amount / 100, expiresAt: data.expiresAt });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to create QR.'); }
    finally { setBusy(false); }
  };

  const withdraw = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/wallet/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount), destination }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Withdrawal failed');
      setMessage(data.message || 'Withdrawal started.'); setModal(null); setDestination(''); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Withdrawal failed.'); }
    finally { setBusy(false); }
  };

  if (!wallet) return <section className="rounded-3xl bg-white p-6 shadow-soft text-sm text-ink-soft">Loading Fitplan wallet…</section>;
  const live = mode === 'live';
  const withdrawalsLive = payoutsLive;

  return <>
    <section className="rounded-3xl bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Fitplan Wallet</p><h2 className="mt-1 text-3xl font-extrabold text-ink">₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2><p className="mt-1 text-xs text-ink-soft">{wallet.walletHandle}</p></div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{live ? 'LIVE' : 'SETUP REQUIRED'}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button onClick={() => { setModal('pay'); setMessage(''); setQr(null); }} className="rounded-2xl bg-accent p-5 text-left text-white transition hover:opacity-95"><p className="text-lg font-extrabold">Pay / Add Money</p><p className="mt-1 text-sm opacity-90">Enter amount and scan one-time UPI QR.</p></button>
        <button disabled={!withdrawalsLive} onClick={() => { setModal('withdraw'); setMessage(''); }} className="rounded-2xl border border-ink/10 bg-surface-muted p-5 text-left text-ink transition hover:bg-white"><p className="text-lg font-extrabold">Withdraw</p><p className="mt-1 text-sm text-ink-soft">{withdrawalsLive ? 'Send your available balance to your UPI ID.' : 'Withdrawal will appear when the payout provider is activated.'}</p></button>
      </div>
      {message && <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-xs font-semibold text-ink-soft">{message}</p>}

      <div className="mt-5 rounded-2xl border border-ink/10 bg-surface-muted p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Your Fitplan QR</p>
        <p className="mt-1 text-[11px] text-ink-soft">Unique to your wallet — anyone can scan this to send you money.</p>
        <div className="mx-auto mt-3 flex w-fit items-center justify-center rounded-xl bg-white p-3 shadow-sm">
          <QRCodeSVG value={wallet.qrPayload} size={168} level="M" />
        </div>
        <p className="mt-2 break-all text-[10px] font-semibold text-ink-soft">{wallet.walletHandle}</p>
      </div>

      <div className="mt-5"><h3 className="text-sm font-extrabold text-ink">Recent transactions</h3><div className="mt-2 space-y-2">{wallet.transactions.length === 0 ? <p className="text-xs text-ink-soft">No transactions yet.</p> : wallet.transactions.map(tx => <div key={tx.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2"><div><p className="text-xs font-bold text-ink">{tx.description}</p><p className="text-[10px] text-ink-soft">{new Date(tx.createdAt).toLocaleString('en-IN')}</p></div><span className="text-xs font-extrabold text-ink">{tx.type === 'deposit' || tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}</span></div>)}</div></div>
    </section>

    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-ink">{modal === 'pay' ? 'Pay / Add Money' : 'Withdraw'}</h2><p className="mt-1 text-xs text-ink-soft">{modal === 'pay' ? 'Create a one-time UPI QR.' : 'Enter the UPI ID where you want the money.'}</p></div><button onClick={() => setModal(null)} className="rounded-full px-3 py-1 text-lg text-ink-soft" aria-label="Close">×</button></div>
        <label className="mt-5 block text-xs font-bold text-ink-soft">Amount (₹)<input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" step="1" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" /></label>
        {modal === 'withdraw' && <label className="mt-3 block text-xs font-bold text-ink-soft">UPI ID<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="name@upi" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" /></label>}
        {modal === 'pay' && qr && <div className="mt-4 rounded-2xl bg-surface-muted p-4 text-center"><p className="text-sm font-extrabold text-ink">Scan to pay ₹{qr.amount.toLocaleString('en-IN')}</p><img src={qr.imageUrl} alt="Fitplan UPI payment QR" className="mx-auto mt-3 h-64 w-64 rounded-xl bg-white p-2" /><p className="mt-2 text-[11px] text-ink-soft">One-time QR · expires {new Date(qr.expiresAt).toLocaleTimeString('en-IN')}</p><p className="mt-2 text-[11px] font-semibold text-amber-700">After payment, Fitplan credits the wallet only after the provider webhook confirms the payment.</p></div>}
        {modal === 'pay' && !live && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">Live payment provider is not configured yet. No real money will move.</p>}
        {modal === 'withdraw' && !withdrawalsLive && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">Withdrawal provider is not activated yet. No money will move.</p>}
        {message && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{message}</p>}
        {modal === 'pay' ? <button disabled={busy || !live} onClick={createQr} className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50">{busy ? 'Creating QR…' : qr ? 'Create New QR' : 'Create Payment QR'}</button> : <button disabled={busy || !withdrawalsLive} onClick={withdraw} className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50">{busy ? 'Processing…' : 'Withdraw'}</button>}
      </div>
    </div>}
  </>;
}
