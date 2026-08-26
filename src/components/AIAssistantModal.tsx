import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Loader2, User } from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "হ্যালো! আমি **কালার ট্রেডিং মাস্টারি AI মেন্টর**। ক্যান্ডেলস্টিক কালার বার ট্রেডিং সেটআপ, মানি ম্যানেজমেন্ট, রিস্ক ক্যালকুলেশন বা বই কেনা নিয়ে যেকোনো প্রশ্ন জিজ্ঞাসা করুন!"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: "কালার ট্রেডিং মাস্টারি মূল নীতি: সর্বদাই ক্যান্ডেলস্টিক ক্লোজিং নিশ্চিত হওয়ার পর এন্ট্রি নিন, অ্যাকাউন্টের ১-২% এর বেশি রিস্ক নেবেন না এবং ন্যূনতম ১:৩ রিস্ক-টু-রিওয়ার্ড মানুন!" }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "কালার ট্রেডিং কৌশল: সবসময় টাইট স্টপ লস ব্যবহার করুন এবং সবুজ ক্যান্ডেল ক্লোজের মাধ্যমে বায়িং কনফার্মেশন অর্জনের পর বাই অর্ডার খুলুন।"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brass text-[#171310] hover:bg-brass-bright font-semibold rounded-xl shadow-2xl shadow-blue-500/40 flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer group"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
        </div>
        <span className="hidden sm:inline font-display text-sm font-extrabold tracking-wide">
          ট্রেডিং AI অ্যাসিস্ট্যান্ট
        </span>
      </button>

      {/* Drawer Dialog */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md bg-[#02040a] border border-line rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[520px] animate-fade-in">
          
          {/* Header */}
          <div className="p-4 bg-[#14120e] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brass/15 border border-brass/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brass" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-display">
                  কালার ট্রেডিং AI মেন্টর
                </h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Gemini AI অনলাইন
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/60 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-brass/15 border border-brass/25 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-brass" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white font-medium rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-white/60 text-xs">
                <div className="w-7 h-7 rounded-lg bg-brass/15 border border-brass/25 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-brass animate-spin" />
                </div>
                <span>ক্যান্ডেলস্টিক কৌশল বিশ্লেষণ করা হচ্ছে...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white/[0.03] border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="কালার ট্রেডিং বা বই সম্পর্কে প্রশ্ন করুন..."
              className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-brass outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-brass text-[#171310] hover:bg-brass-bright text-white font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
