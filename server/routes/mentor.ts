import { Router } from 'express';
import { generateChatResponse } from '../services/gemini.js';
import { StudentProfileSchema } from '../schemas/index.js';
import { buildMentorSystemPrompt } from '../prompts/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      res.status(400).json({ error: 'Invalid profile data' });
      return;
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
      res.status(400).json({ error: 'Project title and message are required.' });
      return;
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

    res.json({ response });
  } catch (error: any) {
    console.error('Mentor error:', error);
    res.status(500).json({ error: error.message || 'Mentor could not respond. Please try again.' });
  }
});

export default router;
