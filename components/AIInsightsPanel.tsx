
import React from 'react';
import { AIInsight } from '../types';

interface AIInsightsPanelProps {
  insights: AIInsight | null;
  isLoading: boolean;
  t: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, isLoading, t }) => {
  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-6 h-full space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center animate-pulse">
            <i className="fas fa-brain text-purple-400"></i>
          </div>
          <h3 className="font-bold text-slate-300">Cognitive Analysis...</h3>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
          <div className="h-20 bg-slate-800 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="glass rounded-3xl p-6 border-slate-800 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
          <i className="fas fa-microchip text-slate-700 text-2xl"></i>
        </div>
        <h3 className="font-bold text-slate-500 mb-2">{t.aiAdvisor}</h3>
        <p className="text-xs text-slate-600">{t.aiWaiting}</p>
      </div>
    );
  }

  const riskColors = {
    LOW: 'text-green-400 bg-green-400/10 border-green-500/20',
    MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
    HIGH: 'text-red-400 bg-red-400/10 border-red-500/20',
  };

  return (
    <div className="glass rounded-3xl p-6 space-y-6 border-purple-500/20 sticky top-24">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <i className="fas fa-brain text-purple-400"></i>
          </div>
          <h3 className="font-bold">{t.geminiIntel}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColors[insights.riskLevel]}`}>
          {insights.riskLevel} {t.risk}
        </span>
      </div>

      <div className="space-y-4">
        <section>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{t.currentSituation}</h4>
          <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-purple-500/30 pl-3">
            "{insights.summary}"
          </p>
        </section>

        <section>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{t.etaPrediction}</h4>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <p className="text-sm text-cyan-400 font-medium">
              <i className="fas fa-clock mr-2"></i>
              {insights.prediction}
            </p>
          </div>
        </section>

        <section>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{t.strategicActions}</h4>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-xs text-slate-400">
                <i className="fas fa-chevron-right text-purple-500 mt-0.5 shrink-0"></i>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-2">
        <button className="w-full py-2.5 glass border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
          <i className="fas fa-file-pdf"></i>
          {t.exportReport}
        </button>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
