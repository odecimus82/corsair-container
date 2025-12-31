
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import TrackingDisplay from './components/TrackingDisplay';
import AIInsightsPanel from './components/AIInsightsPanel';
import DashboardGrid from './components/DashboardGrid';
import { ContainerDetails, AIInsight, SavedContainer } from './types';
import { translations, Language } from './translations';
import { fetchTrackingData } from './services/trackingService';
import { getLogisticsInsights } from './services/geminiService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ContainerDetails | null>(null);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [savedContainers, setSavedContainers] = useState<SavedContainer[]>([]);

  const t = translations[lang];

  // Load saved containers from local storage
  useEffect(() => {
    const saved = localStorage.getItem('corsair_saved_containers');
    if (saved) {
      setSavedContainers(JSON.parse(saved));
    }
  }, []);

  const handleSearch = useCallback(async (containerId: string) => {
    if (!containerId.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setInsights(null);

    try {
      const trackingResult = await fetchTrackingData(containerId);
      setData(trackingResult);
      const aiResponse = await getLogisticsInsights(trackingResult);
      setInsights(aiResponse);
    } catch (err: any) {
      setError(err.message || 'Error occurred during tracking.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleSave = (container: ContainerDetails) => {
    const isAlreadySaved = savedContainers.find(c => c.id === container.containerId);
    if (isAlreadySaved) {
      const filtered = savedContainers.filter(c => c.id !== container.containerId);
      setSavedContainers(filtered);
      localStorage.setItem('corsair_saved_containers', JSON.stringify(filtered));
    } else {
      const newItem: SavedContainer = {
        id: container.containerId,
        carrier: container.carrier,
        status: container.status,
        lastUpdated: new Date().toLocaleDateString()
      };
      const updated = [newItem, ...savedContainers];
      setSavedContainers(updated);
      localStorage.setItem('corsair_saved_containers', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-tech">
      <Header lang={lang} toggleLanguage={toggleLanguage} t={t} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
          <section className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              {t.title}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              {t.subtitle}
            </p>
            <SearchSection onSearch={handleSearch} isLoading={loading} t={t} />
          </section>

          {/* User Dashboard Section */}
          {!data && !loading && (
             <DashboardGrid 
              saved={savedContainers} 
              onTrack={handleSearch} 
              t={t}
              onRemove={(id) => {
                const updated = savedContainers.filter(c => c.id !== id);
                setSavedContainers(updated);
                localStorage.setItem('corsair_saved_containers', JSON.stringify(updated));
              }}
            />
          )}

          {error && (
            <div className="glass border-red-500/50 p-4 rounded-xl flex items-center gap-4 text-red-400">
              <i className="fas fa-exclamation-triangle text-xl"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Results Area */}
          {(data || loading) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {data ? (
                  <TrackingDisplay 
                    data={data} 
                    t={t} 
                    onSave={() => handleSave(data)}
                    isSaved={!!savedContainers.find(c => c.id === data.containerId)}
                  />
                ) : (
                  <div className="h-[400px] glass rounded-3xl flex flex-col items-center justify-center animate-pulse-slow">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-cyan-400">{t.initializing}</p>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-1">
                <AIInsightsPanel insights={insights} isLoading={loading} t={t} />
              </aside>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 border-t border-slate-900 glass mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2024 Corsair Logistics. Powered by FindTEU & Gemini AI Intelligence.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">{t.reports}</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
