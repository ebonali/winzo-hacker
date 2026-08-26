import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LogOut, Menu, X } from 'lucide-react';
import { PageRoute } from '../types';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate, currentUser, signOut, hasAccess, authLoading, bookMeta } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const priceBdt = bookMeta?.priceBdt ?? 999;

  const allNavItems: { label: string; route: PageRoute }[] = [
    { label: 'হোম', route: 'home' },
    { label: 'বই', route: 'buy-book' },
    { label: 'সাপোর্ট', route: 'contact' },
    { label: 'কমিউনিটি', route: 'join' },
  ];

  const hasBookAccess = !!currentUser && hasAccess;
  const navItems = hasBookAccess ? allNavItems.filter((i) => i.route !== 'buy-book') : allNavItems;

  const handleNav = (route: PageRoute) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0a08]/95 backdrop-blur-sm hairline-b">
      <div className="max-w-6xl mx-auto px-5 h-[72px] flex items-center justify-between gap-4">

        {/* Wordmark */}
        <div onClick={() => handleNav('home')} className="cursor-pointer select-none">
          <div className="serif text-xl leading-none text-paper">কালার ট্রেডিং <span className="text-brass">মাস্টারি</span></div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.24em] uppercase text-faint">Wingo Hacker · বাংলা ই-বুক</div>
        </div>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`text-[15px] transition cursor-pointer pb-0.5 border-b ${
                currentRoute === item.route
                  ? 'text-paper border-brass'
                  : 'text-muted hover:text-paper border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}

          {hasBookAccess && (
            <button
              onClick={() => handleNav('reader')}
              className={`text-[15px] transition cursor-pointer pb-0.5 border-b ${
                currentRoute === 'reader'
                  ? 'text-brass border-brass'
                  : 'text-brass/80 hover:text-brass border-transparent'
              }`}
            >
              ই-বুক পড়ুন
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className={`text-[15px] transition cursor-pointer pb-0.5 border-b ${
                currentRoute === 'admin'
                  ? 'text-paper border-brass'
                  : 'text-muted hover:text-paper border-transparent'
              }`}
            >
              এডমিন
            </button>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          {authLoading ? null : currentUser ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-muted hidden lg:inline">{currentUser.name}</span>
              <button
                onClick={() => signOut()}
                className="p-2 text-faint hover:text-paper transition cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="hidden sm:block text-sm text-muted hover:text-paper transition cursor-pointer"
            >
              লগইন
            </button>
          )}

          {!hasBookAccess && (
            <button onClick={() => handleNav('buy-book')} className="btn-primary btn-sm">
              বই কিনুন · {priceBdt}৳
            </button>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-paper"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b0a08] hairline-t px-5 py-6 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`w-full text-left py-3 text-[15px] transition ${
                currentRoute === item.route ? 'text-brass' : 'text-muted'
              }`}
            >
              {item.label}
            </button>
          ))}

          {hasBookAccess && (
            <button onClick={() => handleNav('reader')} className="w-full text-left py-3 text-[15px] text-brass">
              ই-বুক পড়ুন
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button onClick={() => handleNav('admin')} className="w-full text-left py-3 text-[15px] text-muted">
              এডমিন ড্যাশবোর্ড
            </button>
          )}

          <div className="pt-4 hairline-t flex items-center justify-between">
            {!currentUser ? (
              <button onClick={() => handleNav('login')} className="text-sm text-muted py-2">
                লগইন / রেজিস্টার
              </button>
            ) : (
              <button onClick={() => signOut()} className="text-sm text-muted py-2">
                লগআউট ({currentUser.email})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
