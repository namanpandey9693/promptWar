import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateChatResponse } from './_lib/gemini.js';
import { StudentProfileSchema } from './_lib/schemas/index.js';
import { buildMentorSystemPrompt } from './_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }

    const {
      projectTitle,
      projectDescription,
      techStack,
      userMessage,
      chatHistory,
      architectureSummary,
      roadmapProgress,
    } = req.body;

    if (!projectTitle || !userMessage) {
      return res.status(400).json({ error: 'Project title and message are required.' });
    }

    const profile = profileResult.data;
    const systemPrompt = buildMentorSystemPrompt(
      profile,
      projectTitle,
      projectDescription || '',
      techStack || [],
      architectureSummary,
      roadmapProgress
    );

    const response = await generateChatResponse(
      systemPrompt,
      userMessage,
      chatHistory || [],
      0.7
    );

    return res.status(200).json({ response });
  } catch (error: any) {
    console.error('Mentor error:', error);
    return res.status(500).json({ error: error.message || 'Mentor could not respond. Please try again.' });
  }
}
