import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { BOOK_PRICE_USDT, BOOK_PRICE_BDT } from '../data/bookData';
import { Order } from '../types';
import { api } from '../lib/api';
import {
  Check, ShieldCheck, Clock, Lock, Wallet, Loader2, CheckCircle2, RefreshCw
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { currentUser, navigate, showToast, refreshMe, myOrders, bookMeta } = useStore();
  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;
  const priceBdt = bookMeta?.priceBdt ?? BOOK_PRICE_BDT;

  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingZini, setIsCheckingZini] = useState(false);
  const [forceForm, setForceForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // handle return from ZiniPay (?zini_order=<id> / ?zini_cancel=<id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ziniOrder = params.get('zini_order');
    const ziniCancel = params.get('zini_cancel');

    if (!ziniOrder && !ziniCancel) return;
    window.history.replaceState({}, '', window.location.pathname);

    if (ziniCancel) {
      // delete the pending order so it doesn't show "verification in progress"
      const cancelOrderId = params.get('zini_cancel');
      if (cancelOrderId) {
        api(`/api/orders/${cancelOrderId}`, { method: 'DELETE' }).catch(() => {});
      }
      setForceForm(true);
      refreshMe();
      showToast('পেমেন্ট বাতিল করা হয়েছে।');
      return;
    }

    setIsCheckingZini(true);
    api<{ status: 'approved' | 'pending' | 'rejected'; transactionId?: string | null }>(
      '/api/payment/zinipay/check',
      { method: 'POST', body: JSON.stringify({ orderId: ziniOrder }) }
    )
      .then(async (result) => {
        const orderEmail = result && (await api<{ user: { email: string } }>('/api/me').catch(() => null))?.user?.email || '';
        await refreshMe();
        if (result.status === 'approved') {
          setSubmittedOrder({
            id: ziniOrder,
            email: orderEmail,
            txId: result.transactionId || '-',
            screenshotUrl: null,
            amountUsdt: BOOK_PRICE_USDT,
            status: 'approved',
            createdAt: new Date().toISOString(),
          });
          showToast('পেমেন্ট সফল! ই-বুক রিডার আনলক হয়ে গেছে। 🎉');
        } else if (result.status === 'rejected') {
          showToast('পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        } else {
          showToast('পেমেন্ট এখনো প্রসেসিং-এ আছে। কিছুক্ষণ পর আবার চেক করুন।');
        }
      })
      .catch((err) => showToast(err?.message || 'পেমেন্ট ভেরিফাই করা যায়নি।'))
      .finally(() => setIsCheckingZini(false));
  }, [refreshMe, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  // no reactive refreshMe — only called once above
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!hasLoaded && currentUser) { setHasLoaded(true); refreshMe(); }
  }, [currentUser, refreshMe, hasLoaded]);

  const startZinipayPayment = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await api<{ orderId: string; paymentUrl: string }>('/api/payment/zinipay/create', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err?.message || 'পেমেন্ট শুরু করা যায়নি।');
      setIsSubmitting(false);
    }
  };

  // ---------- NOT LOGGED IN ----------
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-xl bg-surface border border-line flex items-center justify-center text-brass">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="serif text-2xl sm:text-3xl text-paper">পেমেন্ট করতে আগে লগইন করুন</h2>
        <p className="text-muted text-sm leading-relaxed">
          আপনার অর্ডার ও ই-বুক অ্যাক্সেস অ্যাকাউন্টের সাথে যুক্ত থাকবে।
          তাই নিরাপত্তার জন্য লগইন বাধ্যতামূলক।
        </p>
        <button onClick={() => navigate('login')} className="btn-primary">
          লগইন / সাইন আপ করুন
        </button>
      </div>
    );
  }

  // ---------- verifying payment after return ----------
  if (isCheckingZini) {
    return (
      <div className="max-w-xl mx-auto px-5 py-28 text-center space-y-6">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-brass" />
        <div>
          <h2 className="serif text-2xl sm:text-3xl text-paper">পেমেন্ট যাঁচাই করা হচ্ছে...</h2>
          <p className="text-muted text-sm mt-3">
            আপনার পেমেন্টের স্ট্যাটাস ZiniPay-এর সাথে যাঁচাই করা হচ্ছে। একটু অপেক্ষা করুন।
          </p>
        </div>
      </div>
    );
  }

  const activeOrder = submittedOrder || myOrders[0] || null;

  // ---------- ORDER STATUS CARD ----------
  if (!forceForm && activeOrder && activeOrder.status !== 'rejected') {
    return (
      <div className="max-w-xl mx-auto px-5 py-20">
        <div className="card p-8 sm:p-10 text-center space-y-6">

          <div className="w-16 h-16 mx-auto rounded-xl bg-surface border border-line flex items-center justify-center">
            {activeOrder.status === 'approved' ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            ) : (
              <Clock className="w-8 h-8 text-brass" />
            )}
          </div>

          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 border text-xs font-mono font-medium rounded-full ${
              activeOrder.status === 'approved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-brass/10 text-brass border-brass/25'
            }`}>
              {activeOrder.status === 'approved' ? 'অনুমোদিত' : 'ভেরিফিকেশন চলমান'}
            </span>
            <h2 className="serif text-2xl sm:text-3xl text-paper pt-1">
              {activeOrder.status === 'approved' ? 'পেমেন্ট সম্পন্ন!' : 'অর্ডার গ্রহণ করা হয়েছে'}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {activeOrder.status === 'approved'
                ? 'অভিনন্দন! আপনার ই-বুক রিডার এখন আনলক হয়ে গেছে।'
                : 'আপনার পেমেন্ট এখনো প্রসেসিং-এ আছে অথবা এডমিন ভেরিফিকেশনে রয়েছে। নিশ্চিত হলে রিডার অটোমেটিক আনলক হবে।'}
            </p>
          </div>

          <div className="bg-[#0b0a08] p-5 rounded-lg border border-line text-left space-y-3 num text-xs text-muted">
            <div className="flex justify-between gap-4 hairline-b pb-2">
              <span>অর্ডার আইডি</span>
              <span className="text-brass truncate">{activeOrder.id.slice(0, 13)}…</span>
            </div>
            <div className="flex justify-between gap-4 hairline-b pb-2">
              <span>জিমেইল</span>
              <span className="text-paper truncate">{currentUser.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>পরিমাণ</span>
              <span className="text-emerald-400">{priceBdt}৳ / ${activeOrder.amountUsdt}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
            {activeOrder.status === 'approved' ? (
              <button onClick={() => navigate('reader')} className="btn-primary w-full sm:w-auto">
                ই-বুক পড়ুন
              </button>
            ) : (
              <button
                onClick={async () => { await refreshMe(); showToast('স্ট্যাটাস রিফ্রেশ হয়েছে।'); }}
                className="btn-primary w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                স্ট্যাটাস চেক করুন
              </button>
            )}
            <button onClick={() => navigate('home')} className="btn-ghost w-full sm:w-auto">
              হোমে ফিরুন
            </button>
          </div>

          {activeOrder.status !== 'approved' && (
            <button
              onClick={() => setForceForm(true)}
              className="text-xs text-faint hover:text-brass transition cursor-pointer"
            >
              নতুন করে পেমেন্ট করতে চান?
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- PAYMENT PANEL (ZiniPay only) ----------
  return (
    <div className="max-w-md mx-auto px-5 py-16 md:py-20">

      {/* heading */}
      <div className="text-center mb-10">
        <div className="eyebrow mb-4">চেকআউট</div>
        <h1 className="serif text-3xl sm:text-4xl leading-snug text-paper">আপনার অর্ডার সম্পন্ন করুন</h1>
        <p className="mt-4 text-muted text-sm leading-relaxed">
          {priceBdt}৳ (${priceUsdt}) — bKash, Nagad, Rocket বা Card দিয়ে
          ZiniPay-এর নিরাপদ পেজে পেমেন্ট করুন।
        </p>
      </div>

      <div className="card p-7 space-y-7">

        {/* account */}
        <div className="flex items-center justify-between hairline-b pb-5">
          <div>
            <div className="eyebrow !text-faint mb-1" style={{ fontSize: '10px' }}>অ্যাকাউন্ট</div>
            <div className="text-sm text-paper truncate max-w-[220px]">{currentUser.email}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-brass shrink-0" />
        </div>

        {/* price row */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-faint mb-1">মোট মূল্য · লাইফটাইম এক্সেস</div>
            <div className="flex items-baseline gap-2">
              <span className="serif text-3xl text-paper">{priceBdt}৳</span>
              <span className="num text-sm text-faint">${priceUsdt}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-brass flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-[#171310]" />
          </div>
        </div>

        {/* benefits */}
        <ul className="space-y-2.5 hairline-t pt-5">
          <li className="flex items-start gap-2.5 text-sm text-paper/85">
            <CheckCircle2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />
            <span>পেমেন্ট সফল হলে রিডার <strong>সাথে সাথেই আনলক</strong></span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-paper/85">
            <CheckCircle2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />
            <span>bKash · Nagad · Rocket · Card — সব চলবে</span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-paper/85">
            <CheckCircle2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />
            <span>ZiniPay-এর সুরক্ষিত হোস্টেড পেজে লেনদেন</span>
          </li>
        </ul>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* pay button */}
        <button
          onClick={startZinipayPayment}
          disabled={isSubmitting}
          className="btn-primary w-full !py-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ইনভয়েস তৈরি হচ্ছে...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              পেমেন্ট করুন — {priceBdt}৳
            </>
          )}
        </button>

        <p className="text-[11px] text-faint text-center leading-relaxed -mt-3">
          ক্লিক করলে ZiniPay-এর নিরাপদ পেজে যাবেন।<br />
          পেমেন্ট শেষে এখানেই ফিরে আসবেন।
        </p>
      </div>

    </div>
  );
};
