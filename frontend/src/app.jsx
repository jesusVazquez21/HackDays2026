import { useState } from 'react';
import { Home } from './views/Home';
import { BusinessOnboarding } from './views/BusinessOnboarding';
import Explorar from './views/Explorar';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="h-screen w-full bg-[#1e2530] text-slate-100 flex flex-col overflow-hidden relative font-sans">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat opacity-40 mix-blend-screen"
        style={{ backgroundImage: 'url(/src/assets/hero.png)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1e2530]/80 via-[#1e2530]/50 to-[#1e2530]" />

      <div className="relative z-10 size-full flex flex-col">
        {currentView === 'home' && (
          <Home onNavigate={setCurrentView} />
        )}
        {currentView === 'register' && (
          <BusinessOnboarding onBack={() => setCurrentView('home')} />
        )}
        {currentView === 'discover' && (
          <Explorar onBack={() => setCurrentView('home')} />
        )}
      </div>
    </div>
  );
}