import { GoogleGenAI } from "@google/genai";

// Assumes API_KEY is set in the environment
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_KEY! });

export async function summarizeVideo(title: string, channelName: string): Promise<string> {
  const prompt = `Provide a concise, one-paragraph summary for a YouTube video with the following details. Focus on what the video is likely about based on the title and channel name.
  
  Video Title: "${title}"
  Channel: "${channelName}"
  
  Summary:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary from AI.");
  }
}
