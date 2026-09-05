import { Router } from 'express';
import { generateStructuredResponse } from '../services/gemini.js';
import { StudentProfileSchema, ProjectArchitectureSchema } from '../schemas/index.js';
import { architectureSystemPrompt, buildProfileContext } from '../prompts/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      res.status(400).json({ error: 'Invalid profile data' });
      return;
    }

    const { projectTitle, projectDescription, techStack } = req.body;
    if (!projectTitle || !projectDescription) {
      res.status(400).json({ error: 'Project details are required.' });
      return;
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: architectureSystemPrompt,
        userPrompt: `${profileContext}

PROJECT:
Title: ${projectTitle}
Description: ${projectDescription}
${techStack ? `Suggested Tech Stack: ${techStack.join(', ')}` : ''}

Generate a practical technical architecture for this student project.`,
        temperature: 0.4,
        maxTokens: 8192,
      },
      ProjectArchitectureSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Architecture generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate architecture. Please try again.' });
  }
});

export default router;
