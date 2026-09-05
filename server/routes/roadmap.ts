import { Router } from 'express';
import { generateStructuredResponse } from '../services/gemini.js';
import { StudentProfileSchema, ProjectRoadmapSchema } from '../schemas/index.js';
import { roadmapSystemPrompt, buildProfileContext } from '../prompts/index.js';

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
        systemPrompt: roadmapSystemPrompt,
        userPrompt: `${profileContext}

PROJECT:
Title: ${projectTitle}
Description: ${projectDescription}
${techStack ? `Tech Stack: ${techStack.join(', ')}` : ''}

Generate a practical development roadmap for this project considering the student's team size (${profile.teamSize}) and available time (${profile.availableMonths} months).`,
        temperature: 0.4,
        maxTokens: 8192,
      },
      ProjectRoadmapSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate roadmap. Please try again.' });
  }
});

export default router;
