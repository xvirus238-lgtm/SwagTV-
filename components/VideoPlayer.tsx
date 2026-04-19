import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Channel } from '../types';
import { AlertCircle, RefreshCw, ShieldAlert, Globe, Radio } from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<{ message: string; type: 'network' | 'media' | 'other'; details?: string; status?: number } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!channel || !videoRef.current) {
      setError(null);
      retryCountRef.current = 0;
      return;
    }

    const video = videoRef.current;
    let hls: Hls | null = null;
    setError(null);
    retryCountRef.current = 0;

    const initPlayer = () => {
      // 1. Mixed Content Check: HTTPS sites cannot load HTTP streams in most browsers
      const isHttps = window.location.protocol === 'https:';
      const isStreamHttp = channel.url.startsWith('http:');
      
      if (isHttps && isStreamHttp) {
        setError({
          message: "Secure Connection Block: This stream uses HTTP, but SwagTV is running on HTTPS. Browsers block this for your security. Try an HTTPS stream or use a browser extension that allows mixed content.",
          type: 'network',
          details: "Mixed Content Error"
        });
        return;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingMaxRetry: 2,
          manifestLoadingRetryDelay: 1000,
          xhrSetup: (xhr) => {
            // Essential for most public IPTV links to prevent CORS preflight failures
            xhr.withCredentials = false;
          }
        });

        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setError(null);
          retryCountRef.current = 0;
          video.play().catch(e => {
            console.warn("Autoplay blocked by browser. User interaction required.", e);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            const statusCode = data.response?.code;
            console.error(`[SwagTV] Fatal Player Error: ${data.details}`, {
              type: data.type,
              status: statusCode,
              url: channel.url,
              data: data
            });
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.details === 'manifestLoadError') {
                  let msg = `Manifest Load Error (Status ${statusCode || '0/CORS'}).`;
                  
                  if (statusCode === 0) {
                    msg = "CORS Policy Restriction: The stream provider has blocked access from this website. This is a common security setting on their server.";
                  } else if (statusCode === 404) {
                    msg = "Stream Not Found (404): The link has expired or is temporarily down.";
                  } else if (statusCode === 403) {
                    msg = "Forbidden (403): You don't have permission to access this stream, or it requires a valid token.";
                  }

                  setError({
                    message: msg,
                    type: 'network',
                    details: data.details,
                    status: statusCode
                  });
                  hls?.destroy();
                } else if (retryCountRef.current < MAX_RETRIES) {
                  console.log(`Retrying network error (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
                  retryCountRef.current++;
                  hls?.startLoad();
                } else {
                  setError({
                    message: `Connection persistent failure: ${data.details}.`,
                    type: 'network',
                    details: data.details,
                    status: statusCode
                  });
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Media stall detected. Recovering...");
                setIsRecovering(true);
                hls?.recoverMediaError();
                setTimeout(() => setIsRecovering(false), 2000);
                break;
              default:
                setError({
                  message: `Playback interrupted: ${data.details}`,
                  type: 'other',
                  details: data.details
                });
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari/iOS
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(err => console.error("Native play failed", err));
        });
        video.addEventListener('error', () => {
          const vErr = video.error;
          setError({
            message: "This browser encountered a native playback error. The stream might be offline or region-locked.",
            type: 'network',
            details: `Native Error: ${vErr?.message || 'Code ' + vErr?.code}`
          });
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel]);

  if (!channel) {
    return (
      <div className="aspect-video w-full glass rounded-xl flex items-center justify-center border border-white/5 text-slate-500 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50"></div>
        <div className="text-center p-6 relative z-10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500">
            <Radio size={32} className="text-slate-600" />
          </div>
          <p className="font-bold mb-1 text-slate-300 tracking-tight">SwagTV Match Center</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Select a channel to begin broadcast</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden glass border border-white/10 shadow-2xl bg-black group">
      {error && !isRecovering && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-8 text-center animate-in fade-in duration-500">
          {error.details === "Mixed Content Error" ? (
            <ShieldAlert size={48} className="text-orange-500 mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          ) : (
            <AlertCircle size={48} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          )}
          <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase italic">
            {error.status === 0 ? "CORS ACCESS DENIED" : "BROADCAST FAILED"}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed font-medium">
            {error.message}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-black uppercase tracking-widest transition-all border border-white/10 text-white active:scale-95"
            >
              Reload Page
            </button>
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2.5 bg-green-500 hover:bg-green-400 rounded-full text-xs font-black uppercase tracking-widest transition-all text-black shadow-lg shadow-green-500/20 active:scale-95"
            >
              Switch Channel
            </button>
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 w-full max-w-sm flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
             <span>ERROR: {error.details}</span>
             {error.status !== undefined && <span>HTTP: {error.status}</span>}
          </div>
        </div>
      )}

      {isRecovering && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative mb-6">
            <RefreshCw size={40} className="text-green-400 animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-20 bg-green-400 rounded-full"></div>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Signal Recovery in Progress...</span>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        playsInline
        crossOrigin="anonymous"
        className={`w-full h-full transition-opacity duration-700 ${error ? 'opacity-10' : 'opacity-100'}`}
      />
      
      {/* Dynamic Watermark Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-0.5"></div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] italic">
            SWAG<span className="text-green-400">TV</span> LIVE
          </span>
        </div>
        <div className="px-3 py-2 rounded-xl bg-green-500/10 backdrop-blur-xl border border-green-500/20 text-[10px] font-black text-green-400 uppercase tracking-widest group-hover:opacity-100 opacity-0 transition-opacity duration-300">
          {channel.name}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;