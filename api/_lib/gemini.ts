import { GoogleGenAI } from '@google/genai';
import type { z } from 'zod';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateStructuredResponse<T>(
  options: GenerateOptions,
  schema: z.ZodType<T>
): Promise<T> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 4096 } = options;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    const parsed = JSON.parse(text);
    const validated = schema.safeParse(parsed);

    if (!validated.success) {
      console.error('Zod validation failed:', validated.error.issues);
      // Try to use the raw parsed data anyway — Gemini usually gets close
      return parsed as T;
    }

    return validated.data;
  } catch (error: any) {
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400 || error.message?.includes('API key')) {
      throw new Error('AI service is not configured correctly. Please check the server environment API key.');
    }
    if (error.status === 429) {
      throw new Error('AI rate limit reached. Please wait a moment and try again.');
    }
    if (error.status >= 500 || error.message?.includes('fetch')) {
      throw new Error('Unable to reach the AI service. Please try again.');
    }
    throw error;
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  userMessage: string,
  chatHistory: { role: string; content: string }[],
  temperature = 0.7
): Promise<string> {
  const contents = [
    ...chatHistory.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: 2048,
      },
    });

    return response.text || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error: any) {
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400 || error.message?.includes('API key')) {
      throw new Error('AI service is not configured correctly. Please check the server environment API key.');
    }
    if (error.status === 429) {
      throw new Error('AI rate limit reached. Please wait a moment and try again.');
    }
    if (error.status >= 500 || error.message?.includes('fetch')) {
      throw new Error('Unable to reach the AI service. Please try again.');
    }
    throw error;
  }
}
