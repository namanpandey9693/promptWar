import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStructuredResponse } from './_lib/gemini.js';
import { StudentProfileSchema, RealityCheckResultSchema } from './_lib/schemas/index.js';
import { realityCheckSystemPrompt, buildProfileContext } from './_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { profile, projectTitle, projectDescription } = req.body;

    const profileResult = StudentProfileSchema.safeParse(profile);
    if (!profileResult.success) {
      return res.status(400).json({ error: 'Invalid profile data', details: profileResult.error.issues });
    }

    if (!projectTitle || !projectDescription) {
      return res.status(400).json({ error: 'Project title and description are required' });
    }

    const profileContext = buildProfileContext(profileResult.data);

    const result = await generateStructuredResponse(
      {
        systemPrompt: realityCheckSystemPrompt,
        userPrompt: `${profileContext}\n\nPROJECT TO ANALYZE:\nTitle: ${projectTitle}\nDescription: ${projectDescription}`,
        temperature: 0.7,
        maxTokens: 2048,
      },
      RealityCheckResultSchema
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Reality check error:', error);
    return res.status(500).json({ error: error.message || 'Failed to perform reality check. Please try again.' });
  }
}
