
import { GoogleGenAI, Type } from "@google/genai";
import type { Channel } from '../types';

export async function fetchYouTubeData(): Promise<Channel[]> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a realistic but fictional list of 12 YouTube channel subscriptions.
    For each channel, provide its name, a fictional channel ID, a placeholder thumbnail URL from picsum.photos (square, 100x100), and details for its single latest video.
    The video details should include a fictional video ID, a compelling title, a placeholder thumbnail URL from picsum.photos (16:9 ratio, e.g., 480x270), a realistic ISO 8601 publish date from within the last 7 days, a realistic view count (e.g., "1.2M views", "25K views"), and a duration string (e.g., "15:32").
    The channels should cover a variety of topics like tech, cooking, vlogging, science, and gaming.
    Ensure the publish dates are varied to allow for sorting.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            channelName: { type: Type.STRING },
            channelId: { type: Type.STRING },
            channelThumbnailUrl: { type: Type.STRING },
            latestVideo: {
              type: Type.OBJECT,
              properties: {
                videoId: { type: Type.STRING },
                title: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING },
                publishedAt: { type: Type.STRING, format: "date-time" },
                viewCount: { type: Type.STRING },
                duration: { type: Type.STRING },
              },
              required: ["videoId", "title", "thumbnailUrl", "publishedAt", "viewCount", "duration"],
            },
          },
          required: ["channelName", "channelId", "channelThumbnailUrl", "latestVideo"],
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as Channel[];
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", response.text);
    throw new Error("Invalid data format received from the API.");
  }
}
