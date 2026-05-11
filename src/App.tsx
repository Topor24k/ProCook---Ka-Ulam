import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import HomeView from './views/HomeView';
import AboutView from './views/AboutView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import DashboardView from './views/DashboardView';
import { View } from './types';

const STORAGE_KEY = 'activeView';

export default function App() {
  // Restore saved view on refresh
  const [activeView, setActiveView] = useState<View>(() => {
    const savedView = localStorage.getItem(STORAGE_KEY) as View | null;

    // Fallback to home if nothing saved
    return savedView || 'home';
  });

  // Save current view whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeView);
  }, [activeView]);

  const changeView = (view: View) => {
    setActiveView(view);

    // Optional: Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToSection = (id: string) => {
    // If not currently on home, go home first
    if (activeView !== 'home') {
      changeView('home');

      // Wait for HomeView to render
      setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 150);

      return;
    }

    // Already on home
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const isFullView =
    activeView === 'login' ||
    activeView === 'signup' ||
    activeView === 'dashboard';

  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      {/* Header */}
      {!isFullView && (
        <Header
          activeView={activeView}
          setActiveView={changeView}
          scrollToSection={scrollToSection}
        />
      )}

      {/* Main Content */}
      <main className={`main-content flex-1 ${isFullView ? '' : 'pt-[93px]'}`}>
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <HomeView setActiveView={changeView} />
          )}

          {activeView === 'about' && (
            <AboutView />
          )}

          {activeView === 'login' && (
            <LoginView setActiveView={changeView} />
          )}

          {activeView === 'signup' && (
            <SignupView setActiveView={changeView} />
          )}

          {activeView === 'dashboard' && (
            <DashboardView setActiveView={changeView} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!isFullView && (
        <Footer
          activeView={activeView}
          setActiveView={changeView}
          scrollToSection={scrollToSection}
        />
      )}

      {/* Kaulam Chatbot Widget - hide on dashboard because DashboardView provides an integrated chat */}
      {activeView !== 'dashboard' && (
        <ChatbotWidget />
      )}
    </div>
  );
}