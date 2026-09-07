import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStructuredResponse } from '../_lib/gemini.js';
import { StudentProfileSchema, VivaQuestionsResponseSchema } from '../_lib/schemas/index.js';
import { vivaSystemPrompt, buildProfileContext } from '../_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }

    const { projectTitle, projectDescription, techStack } = req.body;
    if (!projectTitle) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: vivaSystemPrompt,
        userPrompt: `${profileContext}\n\nPROJECT:\nTitle: ${projectTitle}\nDescription: ${projectDescription || ''}\nTech Stack: ${(techStack || []).join(', ')}\n\nGenerate comprehensive viva questions for this project. Include questions from all categories.`,
        temperature: 0.7,
        maxTokens: 8192,
      },
      VivaQuestionsResponseSchema
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Viva generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate viva questions. Please try again.' });
  }
}
