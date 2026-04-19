
import { GoogleGenAI, Type } from "@google/genai";
import { Match, AnalysisResponse, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLiveMatches = async (): Promise<Match[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real-time live and upcoming top-tier football matches happening today (${new Date().toLocaleDateString()}). 
      Focus on major leagues (Premier League, La Liga, Champions League, etc.). 
      Return the data in a structured format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              homeTeam: { type: Type.STRING },
              awayTeam: { type: Type.STRING },
              league: { type: Type.STRING },
              startTime: { type: Type.STRING },
              status: { type: Type.STRING },
              score: {
                type: Type.OBJECT,
                properties: {
                  home: { type: Type.NUMBER },
                  away: { type: Type.NUMBER }
                }
              }
            },
            required: ["id", "homeTeam", "awayTeam", "league", "startTime", "status"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const getStreamingInfo = async (home: string, away: string): Promise<AnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find official live streaming and broadcast sources for the football match: ${home} vs ${away} on ${new Date().toLocaleDateString()}. 
      Include links to official platforms (e.g., NBC Sports, Sky Sports, DAZN, ESPN+). 
      Provide a brief summary of how to watch and any free options if they exist legally.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      ?.map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      })) || [];

    return {
      summary: response.text || "No streaming info found.",
      sources
    };
  } catch (error) {
    console.error("Error fetching streaming info:", error);
    return { summary: "Failed to load streaming info.", sources: [] };
  }
};

export const getMatchAnalysis = async (home: string, away: string): Promise<AnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a deep tactical analysis and prediction for ${home} vs ${away}. 
      Use recent form, head-to-head records, and injury news.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      ?.map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      })) || [];

    return {
      summary: response.text || "Analysis unavailable.",
      sources
    };
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return { summary: "Failed to load analysis.", sources: [] };
  }
};
