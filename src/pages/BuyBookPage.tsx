import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BOOK_TITLE, BOOK_SUBTITLE, BOOK_PRICE_USDT, BOOK_PRICE_BDT, FAQS_DATA } from '../data/bookData';
import bookMockup from '../assets/images/hero-image.avif';
import {
  CheckCircle2, Star, ArrowRight,
  Lock, ChevronDown, Check, X
} from 'lucide-react';

export const BuyBookPage: React.FC = () => {
  const { navigate, bookMeta } = useStore();
  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;
  const priceBdt = bookMeta?.priceBdt ?? BOOK_PRICE_BDT;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  

  const includedPerks = [
    'অনলাইন সুরক্ষিত ই-বুক রিডারে আজীবন এক্সেস',
    'ভবিষ্যতের সকল অধ্যায় ও কেস স্টাডি আপডেট — ফ্রি',
    'এক্সক্লুসিভ মেম্বারশিপ টেলিগ্রাম চ্যানেল',
    'ইন্টারঅ্যাক্টিভ রিস্ক ম্যানেজমেন্ট ক্যালকুলেটর',
    'আপনার নামে ওয়াটারমার্কযুক্ত সুরক্ষিত রিডার',
    'মাল্টি-ডিভাইস রেসপন্সিভ — ফোন/ট্যাব/কম্পিউটার',
  ];

  const comparisonRows = [
    { feature: 'সিগন্যাল সোর্স', free: 'ল্যাগিং MACD/RSI (বিলম্বিত)', book: 'ক্যান্ডেলস্টিক কালার এবজর্ভেশন (লাইভ)' },
    { feature: 'রিস্ক ম্যানেজমেন্ট', free: 'আনুমানিক সাইজিং, ছাড়াছাড়া', book: 'সর্বোচ্চ ১–২% রিস্কের সুনির্দিষ্ট সূত্র' },
    { feature: 'টার্গেট পে-আউট', free: 'নেগেটিভ বা ১:১ R:R', book: 'নূন্যতম ১:৩+ রিস্ক-টু-রিওয়ার্ড' },
    { feature: 'ট্রেডিং রুটিন', free: '১০ ঘণ্টার স্ক্রিন ফ্যাটিগ', book: 'দৈনিক ৩০ মিনিটের সুনির্দিষ্ট রুটিন' },
    { feature: 'কমিউনিটি', free: 'সোশ্যাল মিডিয়ার হাইপ', book: 'ভেরিফাইড ট্রেডারদের গ্রুপ' },
  ];

  return (
    <div>
      {/* ---------- product section ---------- */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20">
        <div className="eyebrow mb-5">সীমিত সময়ের মূল্য</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* cover */}
          <div className="lg:col-span-5">
            <div className="relative max-w-[320px] mx-auto lg:mx-0">
              <div className="absolute -inset-px bg-brass/25 rounded-md translate-x-3 translate-y-3" aria-hidden="true" />
              <img
                src={bookMockup}
                alt={BOOK_TITLE}
                className="relative rounded-md border border-line shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-7 flex items-center gap-2 text-xs text-faint justify-center lg:justify-start">
              <Lock className="w-3.5 h-3.5 text-brass" />
              <span>তাৎক্ষণিক ডিজিটাল এক্সেস · ওয়াটারমার্ক সুরক্ষিত</span>
            </div>
          </div>

          {/* details */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5 text-brass">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brass" />
                ))}
              </div>
              <span className="num text-sm text-paper">৪.৯৬/৫</span>
              <span className="text-xs text-faint">· ১,৪২০+ পাঠক</span>
            </div>

            <h1 className="serif text-3xl sm:text-4xl leading-snug text-paper">{BOOK_TITLE}</h1>
            <p className="mt-3 text-muted text-[15px] leading-relaxed">{BOOK_SUBTITLE}</p>

            {/* price */}
            <div className="mt-8 card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
              <div>
                <div className="font-mono text-xs tracking-widest uppercase text-faint mb-2">লাইফটাইম এক্সেস · এককালীন</div>
                <div className="flex items-baseline gap-3">
                  <span className="serif text-4xl text-brass">{priceBdt}৳</span>
                  <span className="num text-lg text-faint line-through">৪৩৯৬৳</span>
                  <span className="num text-xs text-brass border border-brass/30 rounded px-2 py-0.5">
                    ${priceUsdt}
                  </span>
                </div>
                <span className="text-xs text-faint block mt-1.5">
                  ZiniPay (bKash/Nagad/Card) অথবা USDT TRC20
                </span>
              </div>
              <button onClick={() => navigate('checkout')} className="btn-primary shrink-0">
                এখনই কিনুন
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* perks */}
            <div className="mt-9">
              <div className="eyebrow mb-4">অর্ডারের সাথে যা পাচ্ছেন</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {includedPerks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-paper/85">
                    <CheckCircle2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ---------- comparison ---------- */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="eyebrow mb-4">তুলনা</div>
          <h2 className="serif text-3xl text-paper mb-10 max-w-xl leading-snug">
            আন্দাজের ট্রেডিং বনাম হিসাবের ট্রেডিং
          </h2>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                  <tr className="hairline-b bg-surface2 text-faint text-xs">
                    <th className="p-4 font-medium">দিক</th>
                    <th className="p-4 font-medium">সাধারণ ট্রেডিং</th>
                    <th className="p-4 font-medium text-brass">এই বইয়ের পদ্ধতি</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hairline-b last:border-b-0 hover:bg-white/[0.02] transition">
                      <td className="p-4 font-semibold text-paper">{row.feature}</td>
                      <td className="p-4 text-faint">
                        <span className="flex items-center gap-2">
                          <X className="w-3.5 h-3.5 shrink-0" />
                          {row.free}
                        </span>
                      </td>
                      <td className="p-4 text-paper/90">
                        <span className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-brass shrink-0" />
                          {row.book}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- faq ---------- */}
      <section className="hairline-t">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <div className="eyebrow mb-4">চেকআউট সংক্রান্ত</div>
          <h2 className="serif text-3xl text-paper mb-8">সাধারণ জিজ্ঞাসা</h2>

          <div>
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="hairline-b last:border-b-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <span className={`serif text-lg transition-colors ${isOpen ? 'text-brass' : 'text-paper group-hover:text-brass'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-faint shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="pb-6 pr-8 text-muted text-sm leading-relaxed animate-fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- cta ---------- */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-20 text-center">
          <h2 className="serif text-3xl sm:text-4xl text-paper">প্রস্তুত?</h2>
          <p className="mt-4 text-muted max-w-md mx-auto text-sm leading-relaxed">
            {priceBdt}৳ এককালীন — পেমেন্ট শেষ হলেই সুরক্ষিত রিডারে বইটি পড়া শুরু করুন।
          </p>
          <button onClick={() => navigate('checkout')} className="btn-primary mt-8">
            চেকআউট করুন — {priceBdt}৳
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
