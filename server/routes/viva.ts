import { Router } from 'express';
import { generateStructuredResponse } from '../services/gemini.js';
import {
  StudentProfileSchema,
  VivaQuestionsResponseSchema,
  VivaEvaluationSchema,
} from '../schemas/index.js';
import { vivaSystemPrompt, vivaEvaluationSystemPrompt, buildProfileContext } from '../prompts/index.js';

const router = Router();

// Generate viva questions
router.post('/generate', async (req, res) => {
  try {
    const profileResult = StudentProfileSchema.safeParse(req.body.profile);
    if (!profileResult.success) {
      res.status(400).json({ error: 'Invalid profile data' });
      return;
    }

    const { projectTitle, projectDescription, techStack } = req.body;
    if (!projectTitle) {
      res.status(400).json({ error: 'Project title is required.' });
      return;
    }

    const profile = profileResult.data;
    const profileContext = buildProfileContext(profile);

    const result = await generateStructuredResponse(
      {
        systemPrompt: vivaSystemPrompt,
        userPrompt: `${profileContext}

PROJECT:
Title: ${projectTitle}
Description: ${projectDescription || ''}
Tech Stack: ${(techStack || []).join(', ')}

Generate comprehensive viva questions for this project. Include questions from all categories.`,
        temperature: 0.7,
        maxTokens: 8192,
      },
      VivaQuestionsResponseSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Viva generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate viva questions. Please try again.' });
  }
});

// Evaluate a viva answer
router.post('/evaluate', async (req, res) => {
  try {
    const { question, expectedPoints, studentAnswer, projectTitle } = req.body;
    if (!question || !studentAnswer) {
      res.status(400).json({ error: 'Question and answer are required.' });
      return;
    }

    const result = await generateStructuredResponse(
      {
        systemPrompt: vivaEvaluationSystemPrompt,
        userPrompt: `PROJECT: ${projectTitle || 'Final year project'}

QUESTION: ${question}

EXPECTED KEY POINTS: ${(expectedPoints || []).join('; ')}

STUDENT'S ANSWER: ${studentAnswer}

Evaluate this answer fairly.`,
        temperature: 0.3,
        maxTokens: 1024,
      },
      VivaEvaluationSchema
    );

    res.json(result);
  } catch (error: any) {
    console.error('Viva evaluation error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate answer. Please try again.' });
  }
});

export default router;
