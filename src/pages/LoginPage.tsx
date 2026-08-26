import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import bookMockup from '../assets/images/hero-image.avif';
import { supabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, navigate, showToast, currentUser, signOut } = useStore();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('অনুগ্রহ করে জিমেইল ও পাসওয়ার্ড লিখুন।');
      return;
    }

    if (isRegister) {
      if (password.length < 8) {
        setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
        return;
      }
      if (password !== confirmPassword) {
        setError('পাসওয়ার্ড দুটি মিলছে না।');
        return;
      }
      if (!agreeTerms) {
        setError('অনুগ্রহ করে আমাদের সেবা ও প্রাইভেসির নীতিমালায় সম্মত হন।');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(email, password, name);
        setIsRegister(false);
      } else {
        await signIn(email, password);
        navigate('home');
      }
    } catch (err: any) {
      setError(err?.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">

      {/* Container Card */}
      <div className="bento-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brass/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: 3D Book Visual */}
        <div className="lg:col-span-5 bg-[#050505] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative">
          <div className="space-y-4">
            <span className="px-3.5 py-1 bg-brass/10 border border-brass/25 text-brass text-xs font-mono font-bold rounded-full">
              সুরক্ষিত ট্রেডার পোর্টাল
            </span>
            <h2 className="text-2xl font-bold text-white font-display">
              কালার ট্রেডিং মাস্টারি
            </h2>
            <p className="text-white/60 text-xs leading-relaxed">
              আপনার ই-বুক রিডার এবং এক্সক্লুসিভ স্টাডি ম্যাটেরিয়াল আনলক করতে লগইন করুন।
            </p>
          </div>

          <div className="my-8 flex justify-center">
            <div className="relative group max-w-[220px]">
              <div className="absolute -inset-2 bg-brass/15 rounded-2xl blur-xl" />
              <img
                src={bookMockup}
                alt="Book mockup preview"
                className="w-full h-auto rounded-xl border border-brass/25 relative z-10 shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="p-4 bg-[#02040a] rounded-2xl border border-white/10 text-xs text-white/70 space-y-2">
            <p className="text-brass font-semibold font-mono flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>সম্পূর্ণ সুরক্ষিত অ্যাকাউন্ট</span>
            </p>
            <p className="text-[11px] text-white/50">
              আপনার পাসওয়ার্ড এনক্রিপ্টেড থাকে। বই কেনার পর শুধুমাত্র আপনার অ্যাকাউন্ট থেকেই ই-বুক পড়া যাবে।
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">

          {currentUser ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-display">আপনি লগইন অবস্থায় আছেন</h3>
                <p className="text-white/60 text-sm">{currentUser.name} • {currentUser.email}</p>
                {currentUser.role === 'admin' && (
                  <span className="inline-block px-3 py-1 bg-brass/10 text-brass border border-brass/25 text-xs font-mono font-bold rounded-full">
                    এডমিন অ্যাকাউন্ট
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate(currentUser.role === 'admin' ? 'admin' : 'home')}
                  className="px-6 py-3 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  {currentUser.role === 'admin' ? 'এডমিন ড্যাশবোর্ডে যান' : 'হোমে যান'}
                </button>
                <button
                  onClick={signOut}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  লগআউট করুন
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toggle Tabs */}
              <div className="flex bg-[#050505] p-1 rounded-xl border border-white/10 max-w-xs">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    !isRegister ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white shadow-md' : 'text-white/60 hover:text-white'
                  }`}
                >
                  লগইন
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isRegister ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white shadow-md' : 'text-white/60 hover:text-white'
                  }`}
                >
                  সাইন আপ
                </button>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {isRegister ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'স্বাগতম!'}
                </h3>
                <p className="text-white/50 text-xs mt-1">
                  {isRegister
                    ? 'অর্ডার পরিচালনা এবং অনলাইন রিডারের জন্য নিবন্ধিত হন।'
                    : 'আপনার নিবন্ধিত জিমেইল ও পাসওয়ার্ড লিখুন।'}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/60 block font-mono">আপনার নাম</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="আব্দুল্লাহ ট্রেডার"
                        className="w-full bg-[#050505] border border-white/10 focus:border-brass rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/60 block font-mono">জিমেইল অ্যাড্রেস</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-[#050505] border border-white/10 focus:border-brass rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/60 block font-mono">পাসওয়ার্ড</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#050505] border border-white/10 focus:border-brass rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/60 block font-mono">পাসওয়ার্ড পুনরায় লিখুন</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#050505] border border-white/10 focus:border-brass rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {!isRegister ? (
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-brass rounded"
                      />
                      <span>মনে রাখুন</span>
                    </label>
                    <a href="#forgot" onClick={async (e) => { e.preventDefault(); if (!email.trim()) { showToast('আগে আপনার ইমেইল লিখুন।'); return; } try { await supabase.auth.resetPasswordForEmail(email.trim()); showToast('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'); } catch { showToast('পাসওয়ার্ড রিসেট করা যায়নি। আবার চেষ্টা করুন।'); } }} className="text-brass hover:underline">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-white/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="accent-brass rounded"
                      />
                      <span>আমি সেবার শর্তাবলি ও গোপনীয়তা নীতিমালায় সম্মত</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs uppercase tracking-wider rounded-xl  hover:scale-[1.01] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{isRegister ? 'অ্যাকাউন্ট তৈরি করুন' : 'পোর্টাল লগইন করুন'}</span>
                  )}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
