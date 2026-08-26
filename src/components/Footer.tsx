import React from 'react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate } = useStore();

  return (
    <footer className="hairline-t bg-[#0b0a08]">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 hairline-b">

          {/* Brand */}
          <div className="md:col-span-6 space-y-4">
            <div className="serif text-xl text-paper">
              কালার ট্রেডিং <span className="text-brass">মাস্টারি</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              Wingo Lottery ও কালার ট্রেডিং নিয়ে পূর্ণাঙ্গ বাংলা গাইড —
              ১৫টি অধ্যায়, সুরক্ষিত অনলাইন রিডার এবং আজীবন এক্সেস।
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="eyebrow">সাইট</div>
            <ul className="space-y-2 text-sm text-muted">
              <li><button onClick={() => navigate('home')} className="hover:text-paper transition cursor-pointer">হোম</button></li>
              <li><button onClick={() => navigate('buy-book')} className="hover:text-paper transition cursor-pointer">বই</button></li>
              <li><button onClick={() => navigate('checkout')} className="hover:text-paper transition cursor-pointer">চেকআউট</button></li>
              <li><button onClick={() => navigate('contact')} className="hover:text-paper transition cursor-pointer">সাপোর্ট</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="eyebrow">অ্যাকাউন্ট</div>
            <ul className="space-y-2 text-sm text-muted">
              <li><button onClick={() => navigate('login')} className="hover:text-paper transition cursor-pointer">লগইন / রেজিস্টার</button></li>
              <li><button onClick={() => navigate('reader')} className="hover:text-paper transition cursor-pointer">ই-বুক রিডার</button></li>
              <li><button onClick={() => navigate('join')} className="hover:text-paper transition cursor-pointer">কমিউনিটি</button></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-faint">
          <p>© ২০২৬ কালার ট্রেডিং মাস্টারি · সর্বস্বত্ব সংরক্ষিত</p>
          <p className="max-w-lg md:text-right leading-relaxed">
            ট্রেডিং ও অনলাইন গেমিং ঝুঁকিপূর্ণ। এই বইয়ের তথ্য শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে।
          </p>
        </div>
      </div>
    </footer>
  );
};
