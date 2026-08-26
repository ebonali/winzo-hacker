import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../context/StoreContext';
import { BOOK_TITLE } from '../data/bookData';
import { ChapterMeta, Chapter, WatermarkInfo } from '../types';
import { api } from '../lib/api';
import { ColorTradingSimulator } from '../components/ColorTradingSimulator';
import { WatermarkOverlay, watermarkSvgUrl, useReaderProtection } from '../components/ReaderProtection';
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Lock,
  Moon, Type, Sparkles, ArrowLeft, Loader2, ShieldAlert
} from 'lucide-react';

export const BookReaderPage: React.FC = () => {
  const { currentUser, hasAccess, navigate, showToast, bookMeta } = useStore();
  const [chaptersMeta, setChaptersMeta] = useState<ChapterMeta[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [watermark, setWatermark] = useState<WatermarkInfo | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [themeMode, setThemeMode] = useState<'dark' | 'obsidian' | 'sepia'>('dark');
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const activeNumberRef = useRef<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const onWarning = useCallback((msg: string) => showToast(msg), [showToast]);
  const { contentHidden } = useReaderProtection(onWarning);

  // load completed chapters progress (local only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ctm_completed_chapters');
      if (saved) setCompletedChapters(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('ctm_completed_chapters', JSON.stringify(completedChapters));
  }, [completedChapters]);

  // fetch chapter list (titles only — no content)
  useEffect(() => {
    if (!currentUser) return;
    api<{ chapters: ChapterMeta[] }>('/api/book/meta')
      .then((data) => setChaptersMeta(data.chapters))
      .catch(() => showToast('বইয়ের তথ্য লোড করা যায়নি।'))
      .finally(() => setMetaLoading(false));
  }, [currentUser, showToast]);

  // fetch current chapter content (server verifies purchase on every request)
  useEffect(() => {
    if (!currentUser || !hasAccess || chaptersMeta.length === 0) return;
    const meta = chaptersMeta[activeChapterIndex];
    if (!meta) return;
    activeNumberRef.current = meta.number;

    setChapterLoading(true);
    setChapterError(null);
    api<{ chapter: Chapter; watermark: WatermarkInfo }>(`/api/book/chapter/${meta.number}`)
      .then((data) => {
        setCurrentChapter(data.chapter);
        setWatermark(data.watermark);
      })
      .catch((err: any) => {
        setChapterError(err?.message || 'অধ্যায় লোড করা যায়নি।');
      })
      .finally(() => setChapterLoading(false));
  }, [activeChapterIndex, chaptersMeta, currentUser, hasAccess, reloadKey, showToast]);

  // ---------- NOT LOGGED IN ----------
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brass/15 border border-brass/25 flex items-center justify-center text-brass shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">লগইন করুন</h2>
        <p className="text-white/70 text-sm">
          ই-বুক রিডার ব্যবহার করতে আপনার অ্যাকাউন্টে লগইন করুন।
        </p>
        <button
          onClick={() => navigate('login')}
          className="px-6 py-3 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded-xl text-xs  cursor-pointer"
        >
          লগইন / সাইন আপ
        </button>
      </div>
    );
  }

  // ---------- NO ACCESS ----------
  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brass/15 border border-brass/25 flex items-center justify-center text-brass shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white font-display">
            ই-বুক রিডার এক্সেস সংরক্ষিত
          </h2>
          <p className="text-white/70 text-sm">
            পড়া চালিয়ে যেতে {BOOK_TITLE} বইটির অনুমোদিত পাঠক হওয়া আবশ্যক। আপনি যদি সম্প্রতি USDT পেমেন্ট করে থাকেন তবে এডমিন ভেরিফিকেশন চেক করুন।
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('buy-book')}
            className="px-6 py-3 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded-xl text-xs  cursor-pointer"
          >
            বই কিনুন (${bookMeta?.priceUsdt ?? 49} USDT / {bookMeta?.priceBdt ?? 999} টাকা)
          </button>
          <button
            onClick={() => navigate('checkout')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            পেমেন্ট স্ট্যাটাস চেক করুন
          </button>
        </div>
      </div>
    );
  }

  const totalChapters = chaptersMeta.length || 1;
  const progressPercent = Math.round(((activeChapterIndex + 1) / totalChapters) * 100);

  const toggleChapterComplete = (num: number) => {
    if (completedChapters.includes(num)) {
      setCompletedChapters(completedChapters.filter((n) => n !== num));
    } else {
      setCompletedChapters([...completedChapters, num]);
    }
  };

  const getThemeClasses = () => {
    switch (themeMode) {
      case 'obsidian':
        return 'bg-black text-slate-100 border-white/10';
      case 'sepia':
        return 'bg-[#181410] text-amber-100/90 border-amber-900/30';
      default:
        return 'bg-[#02040a] text-white/80 border-white/10';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm leading-relaxed';
      case 'lg':
        return 'text-base sm:text-lg leading-loose';
      default:
        return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <div className={`reader-protected min-h-screen ${getThemeClasses()} ${contentHidden ? 'reader-hidden' : ''} transition-colors duration-300`}>

      {watermark && <WatermarkOverlay watermark={watermark} />}

      {/* Top Header Controls Bar */}
      <div className="sticky top-20 z-40 bg-[#02040a]/90 border-b border-white/10 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('home')}
              className="p-1.5 text-white/60 hover:text-white bg-white/5 border border-white/10 rounded-lg transition cursor-pointer"
              title="হোমে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono text-brass font-bold uppercase tracking-wider block">
                {BOOK_TITLE} অনলাইন ই-বুক রিডার
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs">
                {chaptersMeta[activeChapterIndex]?.title || 'লোড হচ্ছে...'}
              </h3>
            </div>
          </div>

          {/* Reading Progress Indicator */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/50 font-bold">
                {progressPercent}% পঠিত
              </span>
              <div className="w-28 sm:w-36 h-2 bg-black rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-brass text-[#171310] hover:bg-brass-bright transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Custom Theme & Font Controls */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setFontSize(fontSize === 'sm' ? 'md' : fontSize === 'md' ? 'lg' : 'sm')}
                className="px-2 py-1 text-xs font-mono text-white/70 hover:text-brass rounded transition cursor-pointer"
                title="ফন্ট সাইজ পরিবর্তন করুন"
              >
                <Type className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setThemeMode(themeMode === 'dark' ? 'obsidian' : themeMode === 'obsidian' ? 'sepia' : 'dark')}
                className="p-1 text-white/70 hover:text-brass rounded transition cursor-pointer hidden"
                title="রিডিং থিম পরিবর্তন করুন"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Left TOC + Right Reading Panel */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left TOC Sidebar */}
        <div className="lg:col-span-4 bento-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-xs font-bold text-brass uppercase tracking-wider font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              সূচিপত্র (অধ্যায়সমূহ)
            </h4>
            <span className="text-[10px] text-white/40 font-mono">
              {totalChapters}টি অধ্যায়
            </span>
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {metaLoading ? (
              <div className="flex items-center justify-center py-8 text-white/40">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              chaptersMeta.map((chap, idx) => {
                const isActive = idx === activeChapterIndex;
                const isDone = completedChapters.includes(chap.number);
                return (
                  <button
                    key={chap.id}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-start gap-3 border ${
                      isActive
                        ? 'bg-brass/15 border-brass/40 text-brass/90 font-semibold'
                        : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                      isDone ? 'bg-emerald-500 text-black' : isActive ? 'bg-brass text-black' : 'bg-white/10 text-white/40'
                    }`}>
                      {isDone ? '✓' : chap.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold truncate">
                        {chap.title}
                      </h5>
                      <span className="text-[10px] text-white/40 block truncate">
                        {chap.readTime}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Reader Article Canvas */}
        <div className="lg:col-span-8 bento-card p-6 sm:p-10 space-y-8 relative overflow-hidden">

          {chapterLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-white/40">
              <Loader2 className="w-8 h-8 animate-spin text-brass" />
              <span className="text-xs font-mono">অধ্যায় লোড হচ্ছে...</span>
            </div>
          ) : chapterError ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
              <ShieldAlert className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-300">{chapterError}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs cursor-pointer"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : currentChapter ? (
            <>
              {/* Chapter Heading */}
              <div className="border-b border-white/10 pb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-white/5 text-brass font-mono font-bold text-xs rounded-full border border-white/10">
                    অধ্যায় {currentChapter.number} (মোট {totalChapters} অধ্যায়)
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {currentChapter.readTime}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                  {currentChapter.title}
                </h1>
                <p className="text-brass/90/80 text-sm font-medium">
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Key Takeaways Box */}
              <div className="p-5 bg-brass/10 border border-line rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-brass uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  এই অধ্যায়ের মূল বিষয়বস্তু:
                </h4>
                <ul className="space-y-1.5 text-xs text-white/80">
                  {currentChapter.keyTakeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main Article Body */}
              <div className={`reader-prose prose prose-invert max-w-none ${getFontSizeClass()} text-white/80 space-y-4 overflow-x-auto`} style={watermark ? { '--watermark-bg': watermarkSvgUrl(watermark) } as React.CSSProperties : undefined}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-6 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-brass font-display mt-5 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-white font-display mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed text-white/90">{children}</p>,
                    blockquote: ({ children }) => (
                      <blockquote className="p-4 my-4 border-l-4 border-brass bg-brass/10 rounded-r-xl italic text-brass/80 text-xs sm:text-sm">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-[#050505]">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-white/10 text-brass font-mono uppercase text-[11px] border-b border-white/10">{children}</thead>,
                    th: ({ children }) => <th className="p-3 font-bold border border-white/10">{children}</th>,
                    td: ({ children }) => <td className="p-2.5 border border-white/10 text-white/80 font-mono text-xs">{children}</td>,
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-white/80">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-white/80">{children}</ol>,
                    li: ({ children }) => <li className="text-white/80">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>
                  }}
                >
                  {currentChapter.content}
                </ReactMarkdown>
              </div>

              {/* Embedded Interactive Trade Engine if enabled */}
              {currentChapter.hasInteractiveSimulator && (
                <div className="pt-6">
                  <ColorTradingSimulator />
                </div>
              )}

              {/* Chapter Bottom Controls */}
              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">

                <button
                  onClick={() => toggleChapterComplete(currentChapter.number)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                    completedChapters.includes(currentChapter.number)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedChapters.includes(currentChapter.number)
                      ? 'অধ্যায় পড়া সম্পন্ন হয়েছে'
                      : 'পড়া সম্পন্ন হিসেবে চিহ্নিত করুন'}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    disabled={activeChapterIndex === 0}
                    onClick={() => setActiveChapterIndex(activeChapterIndex - 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    পূর্ববর্তী
                  </button>

                  <button
                    disabled={activeChapterIndex === totalChapters - 1}
                    onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                    className="px-4 py-2 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded-xl text-xs disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    পরবর্তী অধ্যায়
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </>
          ) : null}

        </div>

      </div>
    </div>
  );
};
