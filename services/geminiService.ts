
import { GoogleGenAI } from '@google/genai';
import type { FormData, AnalysisResponse } from '../types';
import { SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE, JSON_OUTPUT_SCHEMA } from '../constants';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

function buildUserPrompt(data: FormData): string {
  let prompt = USER_PROMPT_TEMPLATE;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const typedKey = key as keyof FormData;
      prompt = prompt.replace(`{{${typedKey}}}`, data[typedKey] || 'Not provided');
    }
  }
  return prompt;
}

export async function analyzeDrugInteractions(data: FormData): Promise<AnalysisResponse | null> {
  const userPrompt = buildUserPrompt(data);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: JSON_OUTPUT_SCHEMA,
      },
    });

    const text = response.text.trim();
    if (!text) {
      throw new Error("Received an empty response from the API.");
    }
    
    // Clean potential markdown code block fences
    const cleanedText = text.replace(/^```json\s*|```$/g, '');

    const parsedResponse: AnalysisResponse = JSON.parse(cleanedText);
    return parsedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error('The AI returned an invalid JSON response. Please try again or adjust your inputs.');
    }
    throw error;
  }
}
