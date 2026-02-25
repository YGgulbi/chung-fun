import { GoogleGenAI } from "@google/genai";
import { Experience, AnalysisResult } from '../types';

// Initialize the client-side Gemini API
// Note: In a production app, this should be proxied through a backend to protect the key,
// or use the user's own key if it's a "bring your own key" app.
// For this environment, we use the injected process.env.GEMINI_API_KEY.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeExperiences(experiences: Experience[]): Promise<AnalysisResult> {
  if (experiences.length === 0) {
    throw new Error("No experiences to analyze");
  }

  const prompt = `
    You are an expert career counselor and psychologist for Korean university students. Analyze the following list of personal experiences to help the user understand themselves better.
    
    The goal is to derive:
    1. What they like (Interests)
    2. What they are good at (Strengths)
    3. Their problem-solving style
    4. Their energy direction (e.g., Introverted/Extroverted, or what drains/energizes them)
    5. An actionable plan for the future based on these insights.
    6. Relationships between experiences: Identify which experiences are connected (e.g., one led to another, they share a similar skill, or they represent a growth trajectory).

    Here are the experiences:
    ${JSON.stringify(experiences.map(e => ({ id: e.id, title: e.title, description: e.description, category: e.category })), null, 2)}

    Please return the response in the following JSON format. **All values must be in Korean.**
    {
      "strengths": ["강점 1", "강점 2", ...],
      "interests": ["흥미 1", "흥미 2", ...],
      "problemSolvingStyle": "문제 해결 스타일 설명...",
      "energyDirection": "에너지 방향성 설명...",
      "actionPlan": ["액션 플랜 1", "액션 플랜 2", ...],
      "summary": "따뜻하고 격려하는 요약 문단 (존댓말 사용).",
      "relationships": [
        { "sourceId": "exp_id_1", "targetId": "exp_id_2", "reason": "연결 이유 (예: 성취 경험의 확장)" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean markdown formatting if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    return JSON.parse(cleanedText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}

export async function generateChecklist(action: string, context: Experience[]): Promise<string[]> {
  const prompt = `
    Based on the following action plan item and the user's past experiences, generate a practical 5-item checklist to help the user achieve this goal.
    
    Action Plan: ${action}
    
    User's Context (Past Experiences):
    ${JSON.stringify(context.map(e => e.title), null, 2)}
    
    Return the checklist as a JSON array of strings in Korean.
    Example: ["단계 1", "단계 2", ...]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean markdown formatting if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    return JSON.parse(cleanedText) as string[];
  } catch (error) {
    console.error("Checklist generation failed:", error);
    return ["데이터를 불러오는 중 오류가 발생했습니다."];
  }
}
