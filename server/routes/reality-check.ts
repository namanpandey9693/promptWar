import { Router } from 'express';
import { generateStructuredResponse } from '../services/gemini.js';
import { StudentProfileSchema, RealityCheckResultSchema } from '../schemas/index.js';
import { realityCheckSystemPrompt, buildProfileContext } from '../prompts/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      res.status(400).json({ error: 'Invalid profile data', details: profileResult.error.issues });
      return;
    }

    const { projectTitle, projectDescription } = req.body;
    if (!projectTitle || !projectDescription) {
      res.status(400).json({ error: 'Project title and description are required.' });
      return;
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: realityCheckSystemPrompt,
        userPrompt: `${profileContext}

PROJECT TO ANALYZE:
Title: ${projectTitle}
Description: ${projectDescription}

Perform a thorough reality check on this project idea for this specific student. Be honest and specific.`,
        temperature: 0.3,
        maxTokens: 4096,
      },
      RealityCheckResultSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Reality check error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze project. Please try again.' });
  }
});

export default router;
