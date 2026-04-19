
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match, AnalysisResponse, Channel } from './types';
import { getLiveMatches, getStreamingInfo, getMatchAnalysis } from './services/geminiService';
import { M3U_PLAYLIST, parseM3U } from './constants';
import MatchCard from './components/MatchCard';
import InfoPanel from './components/InfoPanel';
import VideoPlayer from './components/VideoPlayer';
import { Search, RefreshCcw, Activity, ShieldCheck, Zap, Tv, Info, PlayCircle, Github, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [streamingInfo, setStreamingInfo] = useState<AnalysisResponse | undefined>();
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisResponse | undefined>();
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const channels = useMemo(() => parseM3U(M3U_PLAYLIST), []);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // Default to first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    const data = await getLiveMatches();
    setMatches(data);
    setLoadingMatches(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleMatchSelect = async (match: Match) => {
    setSelectedMatch(match);
    setLoadingDetails(true);
    const [stream, analysis] = await Promise.all([
      getStreamingInfo(match.homeTeam, match.awayTeam),
      getMatchAnalysis(match.homeTeam, match.awayTeam)
    ]);
    setStreamingInfo(stream);
    setAnalysisInfo(analysis);
    setLoadingDetails(false);
  };

  const filteredMatches = matches.filter(m => 
    m.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      {/* Premium Navigation Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter italic leading-none">
                SWAG<span className="text-green-500">TV</span><span className="text-slate-500 opacity-50 ml-1">OFFICIAL</span>
              </h1>
              <p className="text-[10px] uppercase font-black text-green-500/60 tracking-[0.3em] mt-1">Live Sports Infrastructure</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search live fixtures, leagues, or teams..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadMatches}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95 border border-white/5"
            >
              <RefreshCcw size={20} className={loadingMatches ? 'animate-spin' : ''} />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
            >
              <Github size={16} />
              <span>SOURCE</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Experience Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
        
        {/* Dynamic Broadcast Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 flex flex-col gap-6">
                <VideoPlayer channel={selectedChannel} />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass rounded-2xl border border-white/5">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h2 className="text-2xl font-black tracking-tight uppercase italic">
                              {selectedChannel?.name.replace('★ FEATURED: ', '') || "Broadcast Standby"}
                           </h2>
                           {selectedChannel?.name.includes('FEATURED') && (
                             <span className="px-2.5 py-1 bg-green-500 text-[10px] text-black rounded-lg font-black uppercase tracking-tighter shadow-lg shadow-green-500/20">Verified Link</span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <Globe size={12} className="text-green-500" />
                            Global Node Routing Enabled • Ultra Low Latency
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5">Report Issue</button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-green-500 hover:bg-green-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-green-500/20 active:scale-95">Support SwagTV</button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col">
                <div className="glass h-full rounded-2xl overflow-hidden border border-white/10 flex flex-col shadow-2xl">
                    <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Tv size={18} className="text-green-500" />
                            </div>
                            <h2 className="font-black text-sm tracking-[0.2em] uppercase italic">Signal Feed</h2>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-green-500 tracking-tighter">SECURE</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[580px] p-5 space-y-3 custom-scrollbar">
                        {channels.map((channel, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedChannel(channel)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                                    selectedChannel?.url === channel.url 
                                    ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-400'
                                }`}
                            >
                                <div className="flex items-center gap-4 truncate relative z-10">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedChannel?.url === channel.url ? 'bg-green-500 text-black' : 'bg-white/10'}`}>
                                       <PlayCircle size={16} fill={selectedChannel?.url === channel.url ? 'currentColor' : 'none'} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider truncate">{channel.name.replace('★ FEATURED: ', '')}</span>
                                </div>
                                <Activity size={14} className={`relative z-10 transition-opacity shrink-0 ${selectedChannel?.url === channel.url ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Tactical & Fixtures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Live Matches */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-black italic flex items-center gap-3 tracking-tight">
                        <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                        LIVE FIXTURES ENGINE
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           {filteredMatches.length} Matches Detected
                        </span>
                    </div>
                </div>

                {loadingMatches ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 glass animate-pulse rounded-2xl border border-white/5"></div>
                        ))}
                    </div>
                ) : filteredMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredMatches.map(match => (
                            <MatchCard 
                                key={match.id} 
                                match={match} 
                                onSelect={handleMatchSelect}
                                isSelected={selectedMatch?.id === match.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-80 glass rounded-3xl border-2 border-dashed border-white/5 text-slate-600">
                        <Search size={64} className="mb-6 opacity-10" />
                        <p className="font-black uppercase tracking-[0.2em] text-sm">No Active Match Signals</p>
                        <button onClick={() => setSearchQuery('')} className="mt-4 text-green-500 text-xs font-black uppercase tracking-widest hover:text-green-400 transition-colors">Reset Filter Engine</button>
                    </div>
                )}
            </div>

            {/* Right Column: AI Analysis */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-600/10 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap size={20} className="text-green-500" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Tactical AI Layer</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        SwagTV utilizes Gemini Flash 1.5 to aggregate real-time data, tactical formations, and probability models. Select a fixture to activate.
                    </p>
                </div>
                
                <InfoPanel 
                    streamingInfo={streamingInfo}
                    analysisInfo={analysisInfo}
                    isLoading={loadingDetails}
                />
            </div>
        </div>

        {/* Global Footer */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-md text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <ShieldCheck size={20} className="text-green-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">SwagTV Compliance Policy</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed uppercase tracking-widest">
                    SwagTV Official is a dashboard utility. We do not host, store, or transmit video files. All stream metadata is sourced from public M3U repositories for testing purposes. Engineering Excellence.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">API Status</a>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Legal Docs</a>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Match Archive</a>
                <div className="text-[10px] font-black uppercase tracking-widest text-green-500">&copy; {new Date().getFullYear()} SwagTV Laboratory</div>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
