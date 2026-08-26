import React, { useState } from 'react';
import { Send, MessageCircle, Mail, Facebook, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('যোগাযোগ করার জন্য ধন্যবাদ! উপরের যেকোনো চ্যানেলে আমাদের মেসেজ দিন।');
    setSubmitted(true);
  };

  const contactButtons = [
    {
      name: 'অফিশিয়াল টেলিগ্রাম সাপোর্ট',
      handle: '@ColorTradingMastery',
      icon: Send,
      href: 'https://t.me',
      iconClass: 'bg-brass text-[#171310]',
      btnText: 'টেলিগ্রামে মেসেজ দিন',
    },
    {
      name: 'অফিশিয়াল হোয়াটসঅ্যাপ ডেস্ক',
      handle: '+১ (৮০০) ৫৫৫-কালার',
      icon: MessageCircle,
      href: 'https://whatsapp.com',
      iconClass: 'bg-emerald-600 text-white',
      btnText: 'হোয়াটসঅ্যাপে মেসেজ দিন',
    },
    {
      name: 'ফেসবুক ভিআইপি ট্রেডিং সার্কেল',
      handle: 'facebook.com/groups/colortrading',
      icon: Facebook,
      href: 'https://facebook.com',
      iconClass: 'bg-surface2 text-paper border border-line',
      btnText: 'ফেসবুক গ্রুপে যুক্ত হোন',
    },
    {
      name: 'ইমেইল সাপোর্ট',
      handle: 'support@colortradingmastery.com',
      icon: Mail,
      href: 'mailto:support@colortradingmastery.com',
      iconClass: 'bg-surface2 text-paper border border-line',
      btnText: 'ইমেইল পাঠান',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5">
      {/* ---------- heading ---------- */}
      <section className="pt-16 pb-14 md:pt-20 md:pb-16">
        <div className="eyebrow mb-5">২৪/৭ ডাইরেক্ট সাপোর্ট ডেস্ক</div>
        <h1 className="serif text-3xl sm:text-4xl lg:text-[2.75rem] leading-snug text-paper max-w-xl">
          আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন
        </h1>
        <p className="mt-5 text-muted text-[15px] leading-relaxed max-w-xl">
          USDT পেমেন্ট ভেরিফিকেশন, রিডার এক্সেস কিংবা বইয়ের বিষয়বস্তু
          সম্পর্কিত যেকোনো তথ্যের জন্য নিচের মাধ্যমগুলোতে যোগাযোগ করুন।
        </p>
      </section>

      {/* ---------- contact channels ---------- */}
      <section className="pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
          {contactButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <div key={idx} className="bg-ink p-7 flex flex-col justify-between min-h-[190px]">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${btn.iconClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="serif text-lg text-paper">{btn.name}</h3>
                    <p className="text-xs font-mono text-faint mt-1 break-all">{btn.handle}</p>
                  </div>
                </div>

                <a
                  href={btn.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost btn-sm w-full mt-6"
                >
                  {btn.btnText}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- direct message form ---------- */}
      <section className="hairline-t py-16">
        <div className="max-w-2xl">
          <div className="eyebrow mb-4">সরাসরি মেসেজ</div>
          <h2 className="serif text-2xl sm:text-3xl text-paper mb-2">মেসেজ পাঠান</h2>
          <p className="text-muted text-sm mb-8">
            আমাদের সাপোর্ট টিম সাধারণত ১৫ মিনিটের মধ্যে উত্তর দিয়ে থাকে।
          </p>

          {submitted ? (
            <div className="card p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-brass mx-auto" />
              <h4 className="serif text-xl text-paper">ধন্যবাদ!</h4>
              <p className="text-muted text-sm leading-relaxed">
                উপরের যেকোনো চ্যানেলে (Telegram, WhatsApp, Email) আমাদের সাথে যোগাযোগ করুন।
                আমাদের সাপোর্ট টিম সাধারণত ১৫ মিনিটের মধ্যে উত্তর দিয়ে থাকে।
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted block">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আব্দুল্লাহ রহমান"
                    className="w-full bg-surface border border-line focus:border-brass rounded-lg px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted block">আপনার জিমেইল</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-surface border border-line focus:border-brass rounded-lg px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted block">আপনার মেসেজ বা বার্তা</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনাকে কীভাবে সাহায্য করতে পারি বিস্তারিত লিখুন..."
                  className="w-full bg-surface border border-line focus:border-brass rounded-lg px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint resize-none"
                />
              </div>

              <button type="submit" className="btn-primary">
                মেসেজ পাঠান
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
