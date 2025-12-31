
import React from 'react';
import { ContainerDetails, TrackingEvent } from '../types';

interface TrackingDisplayProps {
  data: ContainerDetails;
  t: any;
  onSave: () => void;
  isSaved: boolean;
}

const EventItem: React.FC<{ event: TrackingEvent; isLast: boolean }> = ({ event, isLast }) => {
  const isCompleted = true;

  return (
    <div className="relative pl-8 pb-8">
      {!isLast && <div className="absolute left-[11px] top-6 w-[2px] h-full bg-slate-800"></div>}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-950 ${isCompleted ? 'border-cyan-500 text-cyan-500' : 'border-slate-700 text-slate-700'}`}>
        <i className={`text-[10px] fas ${event.type === 'SEA' ? 'fa-ship' : event.type === 'LAND' ? 'fa-truck' : 'fa-anchor'}`}></i>
      </div>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-white">{event.status}</h4>
          <span className="text-xs font-mono text-slate-500">{event.timestamp}</span>
        </div>
        <p className="text-sm text-slate-400 mb-1">{event.location}</p>
        <p className="text-xs text-slate-500">{event.description}</p>
      </div>
    </div>
  );
};

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ data, t, onSave, isSaved }) => {
  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-cyan-400 text-xs font-mono mb-1 block uppercase">LIVE CARGO IDENTITY</span>
            <div className="flex items-center gap-4">
               <h3 className="text-2xl font-bold text-white tracking-tight">{data.containerId}</h3>
               <button 
                onClick={onSave}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
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
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold uppercase border border-cyan-500/20">
              {data.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">{t.carrier}</p>
            <p className="font-medium text-slate-200">{data.carrier}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">{t.vesselVoyage}</p>
            <p className="font-medium text-slate-200">{data.vessel} / {data.voyage}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">{t.originPort}</p>
            <p className="font-medium text-slate-200">{data.origin}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase">{t.etaDestination}</p>
            <p className="font-medium text-cyan-400">{data.eta}</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex justify-between text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
            <span>{data.origin}</span>
            <span>{t.progress}: {data.percentage}%</span>
            <span>{data.destination}</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out"
              style={{ width: `${data.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-8">
          <i className="fas fa-list-ul text-cyan-500"></i>
          <h3 className="font-bold text-lg">{t.lifecycle}</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {data.events.map((event, idx) => (
            <EventItem 
              key={idx} 
              event={event} 
              isLast={idx === data.events.length - 1} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingDisplay;
