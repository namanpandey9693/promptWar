import { Router } from 'express';
import { generateStructuredResponse } from '../services/gemini.js';
import { StudentProfileSchema, ProjectIdeasResponseSchema } from '../schemas/index.js';
import { generatorSystemPrompt, buildProfileContext } from '../prompts/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      res.status(400).json({ error: 'Invalid profile data', details: profileResult.error.issues });
      return;
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: generatorSystemPrompt,
        userPrompt: `${profileContext}\n\nGenerate 5 personalized final-year project ideas for this student. Each project must match their skills, interests, and constraints.`,
        temperature: 0.8,
        maxTokens: 4096,
      },
      ProjectIdeasResponseSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Project generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate projects. Please try again.' });
  }
});

export default router;
