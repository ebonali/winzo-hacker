import React, { useEffect, useState } from 'react';
import { WatermarkInfo } from '../types';

interface Props {
  watermark: WatermarkInfo;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === '"' ? '&quot;' : '&apos;'
  );
}

export function watermarkSvgUrl(watermark: WatermarkInfo): string {
  const text = `${watermark.name} • ${watermark.email} • #${watermark.orderId.slice(0, 8)} • Licensed`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="260"><text x="20" y="140" transform="rotate(-22 230 130)" font-size="18" fill="rgba(100,115,140,0.7)" font-family="monospace" letter-spacing="1">${escapeXml(text)}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Tiled diagonal watermark covering the reader area.
 * Shows the licensed reader's name/email/order id so that any screenshot
 * carries the identity of the account that leaked it.
 */
export const WatermarkOverlay: React.FC<Props> = ({ watermark }) => {
  const bg = watermarkSvgUrl(watermark);

  return (
    <>
      {/* Tiled diagonal watermark over the whole reading area */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none select-none"
        style={{
          backgroundImage: bg,
          backgroundRepeat: 'repeat',
          opacity: 0.25,
          mixBlendMode: 'overlay',
        }}
      />
      {/* Fixed footer identity strip */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none select-none bg-black/70 backdrop-blur-sm border-t border-white/10 px-4 py-1.5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-white/60 truncate">
          © Color Trading Mastery — {watermark.name} ({watermark.email})
        </span>
        <span className="text-[10px] font-mono text-brass/80 shrink-0">
          License #{watermark.orderId.slice(0, 8)}
        </span>
      </div>
    </>
  );
};

/**
 * Hook: reader content protection.
 * - blocks context menu, copy/cut, text selection drag
 * - blocks common shortcuts (Ctrl+C/X/S/P/U/A, F12, Cmd+Shift+3/4/5)
 * - clears clipboard when PrintScreen is pressed and flashes a warning
 * - blurs content while the tab is hidden or window loses focus
 */
export const useReaderProtection = (
  onWarning: (msg: string) => void
): { contentHidden: boolean } => {
  const [contentHidden, setContentHidden] = useState(false);

  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
      onWarning('এই কনটেন্টটি সুরক্ষিত — কপি/ডাউনলোড করা যাবে না।');
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && ['c', 'x', 's', 'p', 'u', 'a'].includes(key)) {
        e.preventDefault();
        onWarning('এই শর্টকাটটি রিডারে নিষ্ক্রিয় করা হয়েছে।');
        return;
      }
      if (key === 'f12' || (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
        e.preventDefault();
        onWarning('Developer tools ব্যবহার করা যাবে না।');
        return;
      }
      if (ctrl && e.shiftKey && key === 's') {
        e.preventDefault();
        onWarning('স্ক্রিনশট নেওয়া নিষিদ্ধ! এই কার্যক্রম রেকর্ড করা হচ্ছে।');
        return;
      }
      if (key === 'printscreen' || (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key))) {
        // try to wipe whatever was captured
        try { navigator.clipboard.writeText(''); } catch { /* ignore */ }
        onWarning('স্ক্রিনশট নেওয়া নিষিদ্ধ! এই কার্যক্রম রেকর্ড করা হচ্ছে।');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch { /* ignore */ }
        onWarning('স্ক্রিনশট নেওয়া নিষিদ্ধ! আপনার লাইসেন্স তথ্য রেকর্ড করা হয়েছে।');
      }
    };

    const onVisibility = () => {
      setContentHidden(document.hidden || !document.hasFocus());
    };
    const onBlur = () => setContentHidden(true);
    const onFocus = () => setContentHidden(false);
    const onMouseLeave = () => setContentHidden(true);
    const onMouseEnter = () => setContentHidden(false);

    // override window.print
    const origPrint = window.print;
    window.print = () => {
      onWarning('প্রিন্ট/স্ক্রিনশট নেওয়া নিষিদ্ধ!');
    };

    // block beforeprint event
    const onBeforePrint = (e: Event) => {
      e.preventDefault();
      onWarning('প্রিন্ট নিষিদ্ধ!');
      setContentHidden(true);
    };
    window.addEventListener('beforeprint', onBeforePrint);

    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // mobile: block pinch-to-zoom & multi-touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.print = origPrint;
      window.removeEventListener('beforeprint', onBeforePrint);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('dragstart', block);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, [onWarning]);

  return { contentHidden };
};
