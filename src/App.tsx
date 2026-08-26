import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { BuyBookPage } from './pages/BuyBookPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BookReaderPage } from './pages/BookReaderPage';
import { ContactPage } from './pages/ContactPage';
import { JoinPage } from './pages/JoinPage';

const ToastNotification: React.FC = () => {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  return (
    <div className="fixed top-24 right-6 z-50 bg-[#14120e] border border-line text-paper px-5 py-3 rounded-lg shadow-xl font-sans text-xs flex items-center gap-3 animate-fade-in border-l-2 border-l-brass">
      <span className="w-1.5 h-1.5 rounded-full bg-brass" />
      <span>{toastMessage}</span>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentRoute, currentUser, authLoading } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0a08] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'buy-book':
        return <BuyBookPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'login':
        return <LoginPage />;
      case 'admin':
        return currentUser?.role === 'admin' ? <AdminDashboardPage /> : <LoginPage />;
      case 'reader':
        return <BookReaderPage />;
      case 'contact':
        return <ContactPage />;
      case 'join':
        return <JoinPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#ece7db] flex flex-col font-sans">
      <Navbar />
      <ToastNotification />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
