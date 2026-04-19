
import React from 'react';
import { AnalysisResponse } from '../types';
import { ExternalLink, Radio, TrendingUp, AlertCircle } from 'lucide-react';

interface InfoPanelProps {
  streamingInfo?: AnalysisResponse;
  analysisInfo?: AnalysisResponse;
  isLoading: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ streamingInfo, analysisInfo, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-48 glass rounded-2xl"></div>
        <div className="h-64 glass rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Streaming Section */}
      <section className="glass rounded-2xl overflow-hidden border border-green-500/20">
        <div className="bg-green-500/10 px-6 py-4 flex items-center gap-2 border-b border-green-500/20">
          <Radio size={18} className="text-green-400" />
          <h2 className="font-bold text-green-400">OFFICIAL STREAMING SOURCES</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {streamingInfo?.summary || "Select a match to see official streaming guides."}
          </p>
          {streamingInfo?.sources && streamingInfo.sources.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {streamingInfo.sources.map((src, idx) => (
                <a 
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <span className="text-xs font-medium text-slate-200 line-clamp-1">{src.title}</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Analysis Section */}
      <section className="glass rounded-2xl overflow-hidden border border-blue-500/20">
        <div className="bg-blue-500/10 px-6 py-4 flex items-center gap-2 border-b border-blue-500/20">
          <TrendingUp size={18} className="text-blue-400" />
          <h2 className="font-bold text-blue-400">AI MATCH ANALYSIS & ODDS</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {analysisInfo?.summary || "Our AI will analyze team form and tactics once a match is selected."}
          </p>
          {analysisInfo?.sources && analysisInfo.sources.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {analysisInfo.sources.map((src, idx) => (
                <a 
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <span className="text-xs font-medium text-slate-200 line-clamp-1">{src.title}</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
        <AlertCircle size={14} />
        <span>Always use official broadcasters. Avoid clicking suspicious unofficial links.</span>
      </div>
    </div>
  );
};

export default InfoPanel;
