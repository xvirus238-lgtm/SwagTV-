
import { Channel } from './types';

export const M3U_PLAYLIST = `
#EXTINF:-1,★ FEATURED: beIN SPORTS HD 1 
https://s3.eu-central-1.amazonaws.com/simo.live/hls/0/stream720p.m3u8

`;

export const parseM3U = (data: string): Channel[] => {
  const lines = data.split('\n');
  const channels: Channel[] = [];
  let currentName = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#EXTINF:')) {
      const commaIndex = trimmed.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentName = trimmed.substring(commaIndex + 1).trim();
      }
    } else if (trimmed.startsWith('http')) {
      if (currentName) {
        if (!currentName.includes('---') && !currentName.includes('===') && currentName.length > 0) {
            channels.push({ name: currentName, url: trimmed });
        }
        currentName = '';
      }
    }
  }
  return channels;
};
