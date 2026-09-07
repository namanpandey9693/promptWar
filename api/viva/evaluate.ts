import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStructuredResponse } from '../_lib/gemini.js';
import { VivaEvaluationSchema } from '../_lib/schemas/index.js';
import { vivaEvaluationSystemPrompt } from '../_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { question, expectedPoints, studentAnswer, projectTitle } = req.body;
    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    const result = await generateStructuredResponse(
      {
        systemPrompt: vivaEvaluationSystemPrompt,
        userPrompt: `PROJECT: ${projectTitle || 'Final year project'}\n\nQUESTION: ${question}\n\nEXPECTED KEY POINTS: ${(expectedPoints || []).join('; ')}\n\nSTUDENT'S ANSWER: ${studentAnswer}\n\nEvaluate this answer fairly.`,
        temperature: 0.3,
        maxTokens: 1024,
      },
      VivaEvaluationSchema
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Viva evaluation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate answer. Please try again.' });
  }
}
