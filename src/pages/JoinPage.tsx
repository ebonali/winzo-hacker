import React from 'react';
import { Send, MessageSquare, Facebook, Youtube, Users, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const JoinPage: React.FC = () => {
  const { navigate } = useStore();

  const communityCards = [
    {
      title: "টেলিগ্রাম ভিআইপি চ্যানেল",
      members: "১৪,৮২০ সদস্য",
      activeText: "লাইব ট্রেড সেটআপ ও ডেলি নোটিফিকেশন",
      desc: "৪H এবং ১D ক্যান্ডেলস্টিক কালার এবজর্বশন সিগন্যালের নোটিফিকেশন সরাসরি আপনার ফোনে পান।",
      icon: Send,
      gradient: "bg-brass text-[#171310]",
      btnText: "টেলিগ্রামে যুক্ত হোন",
      href: "https://t.me"
    },
    {
      title: "ডিসকর্ড ইনস্টিটিউশনাল রুম",
      members: "৯,৪৫০ ট্রেডার",
      activeText: "ভয়েস চ্যানেল ও লাইভ চার্ট রিভিউ",
      desc: "ক্রিপ্টো, ফরেক্স ও স্টক মার্কেটের লাইভ চার্ট এনালাইসিস নিয়ে অভিজ্ঞতা শেয়ার করুন।",
      icon: MessageSquare,
      gradient: "bg-surface2 text-brass border border-line",
      btnText: "ডিসকর্ড সার্ভারে যুক্ত হোন",
      href: "https://discord.com"
    },
    {
      title: "ফেসবুক মাস্টারমাইন্ড গ্রুপ",
      members: "২২,১০০ সদস্য",
      activeText: "সাপ্তাহিক চার্ট বিশ্লেষণ ও কেস স্টাডি",
      desc: "আপনার সাপ্তাহিক ট্রেডিং জার্নাল ও প্রফিট স্ক্রিনশট শেয়ার করুন এবং অভিজ্ঞতা অর্জন করুন।",
      icon: Facebook,
      gradient: "bg-surface2 text-paper border border-line",
      btnText: "ফেসবুক গ্রুপে যুক্ত হোন",
      href: "https://facebook.com"
    },
    {
      title: "ইউটিউব স্ট্র্যাটেজি একাডেমি",
      members: "৪৮,৫০০ সাবস্ক্রাইবার",
      activeText: "ভিডিও গাইডলাইন ও বাংলা টিউটোরিয়াল",
      desc: "অধ্যায় ৪ এবং ৭ এর ক্যান্ডেলস্টিক কৌশলগুলোর বাস্তব লাইভ মার্কেট ভিডিও টিউটোরিয়াল দেখুন।",
      icon: Youtube,
      gradient: "bg-surface2 text-paper border border-line",
      btnText: "ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন",
      href: "https://youtube.com"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brass/10 border border-brass/25 text-brass text-xs font-bold font-mono rounded-full">
          <Users className="w-4 h-4" />
          <span>কালার ট্রেডিং কমিউনিটিতে যুক্ত হোন</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          ১২,৪০০+ সফল ট্রেডারদের সাথে সংযুক্ত হোন
        </h1>
        <p className="text-white/70 text-base leading-relaxed">
          হাজার হাজার সুশৃঙ্খল প্রাইজ অ্যাকশন ট্রেডারদের সাথে আপনার দক্ষতা বৃদ্ধি করুন, যারা প্রতিদিন চার্ট বিশ্লেষণ ও অভিজ্ঞতা শেয়ার করেন।
        </p>
      </div>

      {/* Community Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {communityCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bento-card p-8 space-y-6 flex flex-col justify-between hover:-translate-y-1 transition duration-300 relative group overflow-hidden"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${card.gradient} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#050505] text-emerald-400 font-mono text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {card.members}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white font-display mb-1">
                    {card.title}
                  </h3>
                  <span className="text-xs font-mono text-brass font-semibold block mb-2">
                    {card.activeText}
                  </span>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>

              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 group-hover:scale-[1.01] cursor-pointer shadow-md"
              >
                <span>{card.btnText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to buy book */}
      <div className="bento-card-blue p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-white font-display">
          এখনো কালার ট্রেডিং মাস্টারি ই-বুকটি কেনেননি?
        </h3>
        <p className="text-white/70 text-sm max-w-xl mx-auto">
          মাত্র **$49 USDT** দিয়ে বইটি, পজিশন সাইজিং ক্যালকুলেটর এবং ভিআইপি কমিউনিটির লাইফটাইম এক্সেস নিন।
        </p>
        <button
          onClick={() => navigate('buy-book')}
          className="px-8 py-3.5 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-sm uppercase tracking-wider rounded-xl  active:scale-95 transition cursor-pointer"
        >
          বই কিনুন ($49 USDT)
        </button>
      </div>

    </div>
  );
};
