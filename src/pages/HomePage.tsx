import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BOOK_TITLE, BOOK_PRICE_USDT, TESTIMONIALS_DATA, FAQS_DATA } from '../data/bookData';
import { ColorTradingSimulator } from '../components/ColorTradingSimulator';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import heroImage from '../assets/images/hero-image.avif';

export const HomePage: React.FC = () => {
  const { navigate, bookMeta } = useStore();
  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;
  const priceBdt = bookMeta?.priceBdt ?? 999;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // what's inside the book — rendered as an editorial index list
  const contents = [
    {
      no: '০১',
      title: 'Wingo Lottery পরিচিতি',
      desc: 'গেমের কাঠামো, ৩০ সেকেন্ড থেকে ৫ মিনিটের টাইমফ্রেম, আর তিন ধরনের প্রেডিকশনের বাস্তবতা।',
    },
    {
      no: '০২',
      title: 'সংখ্যা ও প্যাটার্ন বিশ্লেষণ',
      desc: '১–৯ সংখ্যার গাণিতিক বিশ্লেষণ, কম্বিনেশন চার্ট আর প্যাটার্ন চেনার নিয়মিত পদ্ধতি।',
    },
    {
      no: '০৩',
      title: 'প্রফেশনাল চার্ট রিডিং',
      desc: 'ক্যান্ডেলস্টিকের রঙ, ভলিউম আর ট্রানজিশন দেখে এন্ট্রি–এক্সিট সিদ্ধান্ত নেওয়া।',
    },
    {
      no: '০৪',
      title: 'মানি ম্যানেজমেন্ট',
      desc: 'লট সাইজ হিসাবের সহজ সূত্র, ১–২% রিস্ক নিয়ম আর ড্রডাউন নিয়ন্ত্রণ।',
    },
    {
      no: '০৫',
      title: 'মানসিকতা ও সুশৃঙ্খলা',
      desc: 'FOMO, রিভেঞ্জ ট্রেডিং আর আবেগের বশে সিদ্ধান্ত থেকে বাঁচার করণীয়।',
    },
  ];

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          <div className="lg:col-span-7">
            <div className="eyebrow mb-6">নতুন প্রকাশনা · দ্বিতীয় সংস্করণ</div>

            <h1 className="serif text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.18] text-paper">
              কালার ট্রেডিংয়ের
              <br />
              হিসাব-নিকাশ শিখুন,
              <br />
              <span className="text-brass">আন্দাজে নয়।</span>
            </h1>

            <p className="mt-7 text-muted text-[17px] leading-relaxed max-w-xl">
              {BOOK_TITLE} — Wingo Lottery-র গঠন, সম্ভাবনা, ঝুঁকি আর
              অর্থ ব্যবস্থাপনার পূর্ণাঙ্গ বাংলা গাইড। কোনো “গোপন ট্রিক” নয়;
              যা আছে শুধু হিসাব, প্যাটার্ন আর সুশৃঙ্খলা।
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
              <button onClick={() => navigate('buy-book')} className="btn-primary">
                বইটি কিনুন — {priceUsdt}$ / {priceBdt}৳
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('contents')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost"
              >
                ভেতরে যা আছে দেখুন
              </button>
            </div>

            {/* stats */}
            <div className="mt-12 pt-8 hairline-t grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="num text-lg text-paper">১,৪২০+</div>
                <div className="text-xs text-faint mt-1">ভেরিফাইড পাঠক</div>
              </div>
              <div>
                <div className="num text-lg text-paper">৪.৯৬/৫</div>
                <div className="text-xs text-faint mt-1">পাঠক রেটিং</div>
              </div>
              <div>
                <div className="num text-lg text-paper">১৫</div>
                <div className="text-xs text-faint mt-1">পূর্ণাঙ্গ অধ্যায়</div>
              </div>
            </div>
          </div>

          {/* book cover */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative max-w-[300px] w-full">
              <div className="absolute -inset-px bg-brass/25 rounded-md translate-x-3 translate-y-3" aria-hidden="true" />
              <img
                src={heroImage}
                alt={BOOK_TITLE}
                className="relative rounded-md border border-line shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 -left-4 bg-surface border border-line rounded-md px-4 py-2.5">
                <span className="num text-sm text-paper">{BOOK_PRICE_USDT}$</span>
                <span className="text-xs text-faint mx-1">/</span>
                <span className="text-sm text-brass font-semibold">{priceBdt}৳</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CONTENTS INDEX ================= */}
      <section id="contents" className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            <div className="lg:col-span-4">
              <div className="eyebrow mb-4">০১ · সূচিপত্র</div>
              <h2 className="serif text-3xl sm:text-4xl leading-snug text-paper">
                বইয়ের ভেতরে<br />যা শিখবেন
              </h2>
              <p className="mt-5 text-muted text-sm leading-relaxed">
                ১৫টি অধ্যায়ে সাজানো — একদম শূন্য থেকে শুরু করে
                এডভান্স মানি ম্যানেজমেন্ট পর্যন্ত।
              </p>
              <button onClick={() => navigate('buy-book')} className="btn-ghost btn-sm mt-7">
                সম্পূর্ণ বই পেতে কিনুন
              </button>
            </div>

            <div className="lg:col-span-8">
              {contents.map((c) => (
                <div key={c.no} className="group flex gap-6 py-6 hairline-b first:pt-0 last:border-b-0">
                  <div className="num text-sm text-brass pt-1 w-10 shrink-0">{c.no}</div>
                  <div>
                    <h3 className="serif text-xl text-paper group-hover:text-brass transition-colors">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 text-muted text-sm leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ================= SIMULATOR ================= */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div className="eyebrow mb-4">০২ · হাতে-কলমে</div>
          <h2 className="serif text-3xl sm:text-4xl text-paper mb-10">নিজে চালিয়ে দেখুন</h2>
          <ColorTradingSimulator />
        </div>
      </section>

      {/* ================= WHY / PRINCIPLES ================= */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">

          <div className="lg:col-span-4">
            <div className="eyebrow mb-4">০৩ · পদ্ধতি</div>
            <h2 className="serif text-3xl sm:text-4xl leading-snug text-paper">
              এই বই অন্য<br />বইগুলো থেকে<br />কেন আলাদা
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-10">
            {[
              {
                t: 'গোপন ট্রিকের দাবি নেই',
                d: 'যেসব গ্রুপ “১০০% সার্ভিস” বলে বিক্রি করে, সেই প্রতারণা চেনার উপায়সহ বাস্তব গণিতটা দেখানো হয়েছে।',
              },
              {
                t: 'সংখ্যায় বিশ্বাস রাখে',
                d: 'প্রতিটি কৌশলের পেছনে স্পষ্ট গাণিতিক যুক্তি — সম্ভাবনা, রিস্ক-রিওয়ার্ড আর লস সীমার হিসাব।',
              },
              {
                t: 'বাংলায়, শুরু থেকে',
                d: 'জটিল টার্ম ছাড়াই একদম শূন্য যারা, তাদের ধরে ধরে শেখানো — চার্ট পড়া থেকে মানি ম্যানেজমেন্ট পর্যন্ত।',
              },
              {
                t: 'সুরক্ষিত রিডারে পড়া',
                d: 'আপনার নামে ওয়াটারমার্কযুক্ত নিরাপদ অনলাইন রিডার — PDF নয়, শেয়ারযোগ্যও নয়।',
              },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-5">
                <div className="w-8 h-8 rounded-full border border-brass/40 flex items-center justify-center shrink-0 mt-1">
                  <span className="num text-xs text-brass">{i + 1}</span>
                </div>
                <div>
                  <h3 className="serif text-xl text-paper">{row.t}</h3>
                  <p className="mt-1.5 text-muted text-sm leading-relaxed max-w-xl">{row.d}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div className="eyebrow mb-4">০৪ · পাঠকের কথা</div>
          <h2 className="serif text-3xl sm:text-4xl text-paper mb-12">যারা পড়েছেন, তাঁরা যা বলছেন</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
            {TESTIMONIALS_DATA.map((t) => (
              <div key={t.id} className="bg-ink p-7 flex flex-col justify-between min-h-[240px]">
                <div>
                  <div className="flex gap-0.5 text-brass mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brass" />
                    ))}
                  </div>
                  <p className="text-sm text-paper/85 leading-relaxed">{t.content}</p>
                </div>
                <div className="mt-6 pt-4 hairline-t">
                  <div className="text-sm font-semibold text-paper">{t.name}</div>
                  <div className="text-xs text-faint mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="hairline-t">
        <div className="max-w-3xl mx-auto px-5 py-20 md:py-24">
          <div className="eyebrow mb-4">০৫ · প্রশ্নোত্তর</div>
          <h2 className="serif text-3xl sm:text-4xl text-paper mb-10">সাধারণ জিজ্ঞাসা</h2>

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

      {/* ================= FINAL CTA ================= */}
      <section className="hairline-t">
        <div className="max-w-6xl mx-auto px-5 py-24 md:py-32 text-center">
          <div className="eyebrow mb-6">শুরু করার সময় এখন</div>
          <h2 className="serif text-4xl sm:text-5xl leading-tight text-paper max-w-2xl mx-auto">
            আজ থেকেই ট্রেড করুন<br />হিসাব দিয়ে, আবেগে নয়
          </h2>
          <p className="mt-6 text-muted max-w-lg mx-auto leading-relaxed">
            {BOOK_PRICE_USDT}$ ({priceBdt}৳) — এককালীন পেমেন্ট। সুরক্ষিত অনলাইন
            রিডারে আজীবন এক্সেস, ভবিষ্যতের সব আপডেট ফ্রি।
          </p>
          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3.5">
            <button onClick={() => navigate('buy-book')} className="btn-primary">
              এখনই কিনুন — {priceBdt}৳
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('contact')} className="btn-ghost">
              প্রশ্ন আছে? সাপোর্টে বলুন
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
