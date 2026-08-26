import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageRoute, User, Order } from '../types';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface StoreContextType {
  currentRoute: PageRoute;
  navigate: (route: PageRoute) => void;
  currentUser: User | null;
  authLoading: boolean;
  hasAccess: boolean;
  myOrders: Order[];
  bookMeta: { title: string; subtitle: string; priceUsdt: number; priceBdt: number } | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [bookMeta, setBookMeta] = useState<StoreContextType['bookMeta']>(null);

  // public book meta (price/title — admin editable)
  useEffect(() => {
    const fetchBookMeta = () => {
      api<{ title: string; subtitle: string; priceUsdt: number; priceBdt: number }>('/api/book/meta')
        .then((data) =>
          setBookMeta({
            title: data.title,
            subtitle: data.subtitle,
            priceUsdt: Number(data.priceUsdt),
            priceBdt: Number(data.priceBdt),
          })
        )
        .catch(() => {});
    };
    fetchBookMeta();
    // refresh bookMeta with auth poll so admin price changes appear
    const metaPoll = setInterval(fetchBookMeta, 60000);
    return () => clearInterval(metaPoll);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const navigate = useCallback((route: PageRoute) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route === 'home' ? '/' : `/${route}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const data = await api<{ user: User; hasAccess: boolean; orders: Order[] }>('/api/me');
      setCurrentUser(data.user);
      setHasAccess(data.hasAccess);
      setMyOrders(data.orders || []);
    } catch {
      // not logged in
      setCurrentUser(null);
      setHasAccess(false);
      setMyOrders([]);
    }
  }, []);

  // Track Supabase auth session
  useEffect(() => {
    let mounted = true;

    // returning from ZiniPay → go straight to checkout for verification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('zini_order') || urlParams.get('zini_cancel')) {
      setCurrentRoute('checkout');
    } else {
      // sync initial URL to route
      const path = window.location.pathname.replace(/^\//, '') as PageRoute;
      const validRoutes: PageRoute[] = ['home', 'buy-book', 'checkout', 'login', 'admin', 'reader', 'contact', 'join'];
      if (path && validRoutes.includes(path)) setCurrentRoute(path);
    }

    // browser back/forward
    const onPopState = () => {
      const path = window.location.pathname.replace(/^\//, '') as PageRoute;
      const validRoutes: PageRoute[] = ['home', 'buy-book', 'checkout', 'login', 'admin', 'reader', 'contact', 'join'];
      setCurrentRoute(path && validRoutes.includes(path) ? path : 'home');
    };
    window.addEventListener('popstate', onPopState);

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        await refreshMe();
      }
      if (mounted) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setHasAccess(false);
        setMyOrders([]);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await refreshMe();
      }
    });

    // poll access status (e.g. admin approves the order while user waits)
    const poll = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) refreshMe();
      });
    }, 60000);

    return () => {
      mounted = false;
      window.removeEventListener('popstate', onPopState);
      listener.subscription.unsubscribe();
      clearInterval(poll);
    };
  }, [refreshMe]);

  const signUp = async (email: string, password: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: name || cleanEmail.split('@')[0] } },
    });
    if (error) throw new Error(error.message);
    showToast('অ্যাকাউন্ট তৈরি হয়েছে! এখন লগইন করুন।');
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw new Error(error.message);
    await refreshMe();
    showToast('সফলভাবে লগইন হয়েছে!');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setHasAccess(false);
    setMyOrders([]);
    showToast('লগআউট সম্পন্ন হয়েছে।');
    navigate('home');
  };

  return (
    <StoreContext.Provider
      value={{
        currentRoute,
        navigate,
        currentUser,
        authLoading,
        hasAccess,
        myOrders,
        bookMeta,
        signUp,
        signIn,
        signOut,
        refreshMe,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
