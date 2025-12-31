
import React from 'react';
import { Language } from '../translations';

interface HeaderProps {
  lang: Language;
  toggleLanguage: () => void;
  t: any;
}

const Header: React.FC<HeaderProps> = ({ lang, toggleLanguage, t }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center glow-cyan cursor-pointer" onClick={() => window.location.reload()}>
            <i className="fas fa-crosshairs text-slate-950 text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white">CORSAIR</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.2em] uppercase leading-none">Global Operations</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="text-cyan-400 border-b-2 border-cyan-400 pb-1">{t.dashboard}</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">{t.fleetMap}</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">{t.analytics}</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">{t.reports}</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 glass rounded-lg text-xs font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center gap-2"
          >
            <i className="fas fa-globe"></i>
            {t.langBtn}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-slate-400 border-slate-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {t.systemLive}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
