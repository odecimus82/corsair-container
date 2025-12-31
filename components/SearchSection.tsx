
import React, { useState } from 'react';

interface SearchSectionProps {
  onSearch: (id: string) => void;
  isLoading: boolean;
  t: any;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, isLoading, t }) => {
  const [val, setVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.length >= 4) {
      onSearch(val.toUpperCase());
    }
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <div className="relative flex items-center">
          <div className="absolute left-5 text-slate-400">
            <i className="fas fa-barcode text-xl"></i>
          </div>
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-white placeholder:text-slate-600 text-lg uppercase font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || val.length < 4}
            className="absolute right-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-slate-950 font-bold transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <i className="fas fa-spinner animate-spin"></i>
            ) : (
              <>
                <span className="hidden sm:inline">{t.track}</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </form>
      <div className="mt-3 flex justify-center gap-4 text-[10px] text-slate-600 uppercase tracking-widest font-mono">
        <span>{t.seaFreight}</span>
        <span className="w-1 h-1 bg-slate-700 rounded-full my-auto"></span>
        <span>{t.trucking}</span>
        <span className="w-1 h-1 bg-slate-700 rounded-full my-auto"></span>
        <span>{t.rail}</span>
      </div>
    </div>
  );
};

export default SearchSection;
