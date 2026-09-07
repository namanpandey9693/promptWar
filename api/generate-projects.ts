import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStructuredResponse } from './_lib/gemini.js';
import { StudentProfileSchema, ProjectIdeasResponseSchema } from './_lib/schemas/index.js';
import { generatorSystemPrompt, buildProfileContext } from './_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      return res.status(400).json({ error: 'Invalid profile data', details: profileResult.error.issues });
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

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Project generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate projects. Please try again.' });
  }
}
