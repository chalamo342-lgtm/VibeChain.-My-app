import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SummaryResult {
  summary: string;
  topic: string;
  keyPoints: string[];
}

export interface LessonPlan {
  title: string;
  steps: {
    title: string;
    description: string;
    videoId?: string;
  }[];
}

export const summarizeVideo = async (caption: string, username: string): Promise<SummaryResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the video caption: "${caption}" by user "${username}", provide a technical summary of the knowledge shared.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topic: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        systemInstruction: "You are an expert educational AI for VibeChain, a knowledge-sharing social platform. Summarize videos concisely and highlight learning outcomes."
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Summarization failed:", error);
    return {
      summary: caption,
      topic: "Uncategorized",
      keyPoints: ["No key points extracted"]
    };
  }
};

export const generateLessonFromChain = async (chainNodes: any[]): Promise<LessonPlan> => {
  try {
    const context = chainNodes.map(n => `- @${n.username}: ${n.caption}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transform this chain of connected videos into a structured lesson plan:\n${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Lesson generation failed:", error);
    return {
      title: "Chain Insight",
      steps: [{ title: "Overview", description: "Dive into the chain to discover more." }]
    };
  }
};
