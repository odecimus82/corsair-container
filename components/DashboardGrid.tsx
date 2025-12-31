
import React from 'react';
import { SavedContainer } from '../types';

interface DashboardGridProps {
  saved: SavedContainer[];
  onTrack: (id: string) => void;
  onRemove: (id: string) => void;
  t: any;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ saved, onTrack, onRemove, t }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <i className="fas fa-th-large text-cyan-400"></i>
          <h3 className="text-xl font-bold">{t.savedShipments}</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{saved.length} UNITS TRACKED</span>
      </div>

      {saved.length === 0 ? (
        <div className="glass rounded-3xl p-12 border-dashed border-2 border-slate-800 flex flex-col items-center justify-center text-center opacity-60">
          <i className="fas fa-layer-group text-4xl text-slate-700 mb-4"></i>
          <p className="text-slate-500">{t.noSaved}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((container) => (
            <div 
              key={container.id} 
              className="glass rounded-2xl p-5 border-slate-800 hover:border-cyan-500/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{container.id}</h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">{container.carrier}</p>
                </div>
                <button 
                  onClick={() => onRemove(container.id)}
                  className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${container.status === 'IN_TRANSIT' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-green-500'} animate-pulse`}></span>
                <span className="text-xs text-slate-300 font-bold uppercase">{container.status.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="text-[10px] text-slate-500 font-mono">
                   UPDATED: {container.lastUpdated}
                </div>
                <button 
                  onClick={() => onTrack(container.id)}
                  className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all"
                >
                  {t.track}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
