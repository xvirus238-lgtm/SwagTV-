
import React from 'react';
import { Match } from '../types';
import { Play, Calendar, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  isSelected: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect, isSelected }) => {
  const isLive = match.status === 'LIVE';

  return (
    <div 
      onClick={() => onSelect(match)}
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl p-5 border-2 ${
        isSelected 
          ? 'border-green-500 bg-green-500/10' 
          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Trophy size={12} />
          {match.league}
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            LIVE
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">
            {match.homeTeam.charAt(0)}
          </div>
          <h3 className="font-bold text-sm md:text-base line-clamp-1">{match.homeTeam}</h3>
        </div>

        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {isLive && match.score ? (
            <div className="text-2xl font-black text-white">
              {match.score.home} - {match.score.away}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 uppercase">VS</span>
              <span className="text-sm font-semibold mt-1">{match.startTime}</span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">
            {match.awayTeam.charAt(0)}
          </div>
          <h3 className="font-bold text-sm md:text-base line-clamp-1">{match.awayTeam}</h3>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <button className="text-xs font-bold flex items-center gap-1 text-green-400 group-hover:text-green-300 transition-colors">
          <Play size={14} fill="currentColor" />
          WATCH OPTIONS
        </button>
        <button className="text-xs font-bold flex items-center gap-1 text-blue-400">
          <Calendar size={14} />
          DETAILS
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
