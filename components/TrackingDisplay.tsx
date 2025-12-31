
import React from 'react';
import { ContainerDetails, TrackingEvent } from '../types';

interface TrackingDisplayProps {
  data: ContainerDetails;
  t: any;
  onSave: () => void;
  isSaved: boolean;
}

const EventItem: React.FC<{ event: TrackingEvent; isLast: boolean }> = ({ event, isLast }) => {
  return (
    <div className="relative pl-8 pb-8">
      {!isLast && <div className="absolute left-[11px] top-6 w-[2px] h-full bg-slate-800"></div>}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-950 ${true ? 'border-cyan-500 text-cyan-500' : 'border-slate-700 text-slate-700'}`}>
        <i className={`text-[10px] fas ${event.type === 'SEA' ? 'fa-ship' : event.type === 'LAND' ? 'fa-truck' : 'fa-anchor'}`}></i>
      </div>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-white">{event.status}</h4>
          <span className="text-xs font-mono text-slate-500">{event.timestamp}</span>
        </div>
        <p className="text-sm text-slate-400 mb-1">{event.location}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ data, t, onSave, isSaved }) => {
  return (
    <div className="space-y-6">
      {!data.isRealTime && (
        <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-2xl flex items-center gap-3 animate-pulse">
          <i className="fas fa-satellite-dish text-orange-400"></i>
          <p className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">
            Warning: Live API Connection Restricted. Displaying historical pattern simulation.
          </p>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden relative">
        <div className={`absolute top-4 right-6 z-10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${
          data.isRealTime 
          ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
          : 'bg-slate-800 border-slate-700 text-slate-500'
        }`}>
          {data.isRealTime ? '● Live FindTEU API' : '○ Offline Mode'}
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 border-b border-slate-800">
          <span className="text-cyan-400 text-[10px] font-mono mb-2 block uppercase tracking-[0.2em]">Unit Identification</span>
          <div className="flex flex-wrap items-center gap-6">
             <h3 className="text-4xl font-black text-white tracking-tighter">{data.containerId}</h3>
             <button 
              onClick={onSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSaved 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-400'
              }`}
             >
               <i className={`fas ${isSaved ? 'fa-check' : 'fa-plus'}`}></i>
               {isSaved ? t.alreadySaved : t.saveBtn}
             </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{t.carrier}</p>
            <p className="font-bold text-slate-200">{data.carrier}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{t.vesselVoyage}</p>
            <p className="font-bold text-slate-200 truncate" title={data.vessel}>{data.vessel}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{t.originPort}</p>
            <p className="font-bold text-slate-200 truncate">{data.origin}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{t.etaDestination}</p>
            <p className="font-bold text-cyan-400">{data.eta}</p>
          </div>
        </div>

        <div className="px-8 pb-6">
          <div className="flex justify-between text-[10px] text-slate-500 mb-3 uppercase font-mono">
            <span>{data.origin}</span>
            <span className="text-cyan-500 font-bold">{data.percentage}% Completed</span>
            <span>{data.destination}</span>
          </div>
          <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{ width: `${data.percentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="px-8 pb-6 flex justify-end">
           <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Master Sync: {data.lastSync}</span>
        </div>
      </div>

      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <i className="fas fa-history text-cyan-500"></i>
          </div>
          <div>
            <h3 className="font-bold text-xl">{t.lifecycle}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Chronological Logistics Events</p>
          </div>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          {data.events.length > 0 ? (
            data.events.map((event, idx) => (
              <EventItem 
                key={idx} 
                event={event} 
                isLast={idx === data.events.length - 1} 
              />
            ))
          ) : (
            <div className="py-10 text-center text-slate-600">
               <i className="fas fa-box-open text-3xl mb-4 block"></i>
               <p className="text-xs uppercase tracking-widest">Waiting for carrier event transmission...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingDisplay;
