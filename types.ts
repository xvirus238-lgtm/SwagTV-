
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  score?: {
    home: number;
    away: number;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  summary: string;
  prediction?: string;
  sources: GroundingSource[];
}

export interface Channel {
  name: string;
  url: string;
}
