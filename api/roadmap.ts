import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStructuredResponse } from './_lib/gemini.js';
import { StudentProfileSchema, ProjectRoadmapSchema } from './_lib/schemas/index.js';
import { roadmapSystemPrompt, buildProfileContext } from './_lib/prompts/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }

    const { projectTitle, projectDescription, techStack } = req.body;
    if (!projectTitle || !projectDescription) {
      return res.status(400).json({ error: 'Project details are required.' });
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: roadmapSystemPrompt,
        userPrompt: `${profileContext}\n\nPROJECT:\nTitle: ${projectTitle}\nDescription: ${projectDescription}\n${techStack ? `Tech Stack: ${techStack.join(', ')}` : ''}\n\nGenerate a practical development roadmap for this project considering the student's team size (${profile.teamSize}) and available time (${profile.availableMonths} months).`,
        temperature: 0.4,
        maxTokens: 8192,
      },
      ProjectRoadmapSchema
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Roadmap generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate roadmap. Please try again.' });
  }
}
