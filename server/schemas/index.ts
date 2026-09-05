import { z } from 'zod';

// === Student Profile ===
export const StudentProfileSchema = z.object({
  name: z.string().min(1),
  branch: z.enum(['CSE', 'AIML', 'IT', 'ECE', 'Other']),
  year: z.enum(['3rd', '4th']),
  programmingSkills: z.array(z.string()).min(1),
  technologies: z.array(z.string()),
  aimlKnowledge: z.enum(['none', 'basic', 'intermediate', 'advanced']),
  webDevKnowledge: z.enum(['none', 'basic', 'intermediate', 'advanced']),
  interests: z.array(z.string()).min(1),
  teamSize: z.number().min(1).max(5),
  availableMonths: z.number().min(1).max(12),
  budget: z.enum(['zero', 'low', 'medium', 'high']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  careerGoal: z.string().min(1),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;

// === Project Idea ===
export const ProjectIdeaSchema = z.object({
  title: z.string(),
  description: z.string(),
  problemSolved: z.string(),
  whyItMatchesStudent: z.string(),
  aimlComponent: z.string(),
  techStack: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedDuration: z.string(),
  estimatedCost: z.string(),
  innovationScore: z.number().min(1).max(10),
  feasibilityScore: z.number().min(1).max(10),
  resumeValue: z.enum(['low', 'medium', 'high', 'exceptional']),
  mainRisk: z.string(),
});

export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;

export const ProjectIdeasResponseSchema = z.object({
  projects: z.array(ProjectIdeaSchema).length(5),
});

// === Reality Check Result ===
export const RealityCheckResultSchema = z.object({
  scores: z.object({
    innovation: z.number().min(0).max(100),
    feasibility: z.number().min(0).max(100),
    technicalComplexity: z.number().min(0).max(100),
    datasetAvailability: z.number().min(0).max(100),
    costFeasibility: z.number().min(0).max(100),
    timeFeasibility: z.number().min(0).max(100),
    aiPotential: z.number().min(0).max(100),
    resumeValue: z.number().min(0).max(100),
    riskLevel: z.number().min(0).max(100),
  }),
  healthScore: z.number().min(0).max(100),
  analysis: z.object({
    biggestStrength: z.string(),
    biggestWeakness: z.string(),
    technicalRisk: z.string(),
    implementationRisk: z.string(),
    failureScenario: z.string(),
    improvementSuggestion: z.string(),
  }),
  verdict: z.enum(['GOOD_TO_BUILD', 'NEEDS_MODIFICATION', 'HIGH_RISK', 'NOT_RECOMMENDED']),
  verdictExplanation: z.string(),
  alternativeSuggestion: z.string().optional(),
});

export type RealityCheckResult = z.infer<typeof RealityCheckResultSchema>;

// === Architecture ===
export const ProjectArchitectureSchema = z.object({
  frontend: z.object({ tech: z.string(), description: z.string() }),
  backend: z.object({ tech: z.string(), description: z.string() }),
  aiLayer: z.object({ tech: z.string(), description: z.string() }),
  database: z.object({ tech: z.string(), description: z.string() }),
  apis: z.array(z.string()),
  authentication: z.string(),
  mainModules: z.array(z.object({ name: z.string(), description: z.string() })),
  dataFlow: z.array(z.string()),
  deployment: z.string(),
});

export type ProjectArchitecture = z.infer<typeof ProjectArchitectureSchema>;

// === Roadmap ===
export const RoadmapTaskSchema = z.object({
  title: z.string(),
  estimatedTime: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

export const RoadmapPhaseSchema = z.object({
  name: z.string(),
  duration: z.string(),
  tasks: z.array(RoadmapTaskSchema),
});

export const ProjectRoadmapSchema = z.object({
  phases: z.array(RoadmapPhaseSchema),
});

export type RoadmapTask = z.infer<typeof RoadmapTaskSchema> & { completed: boolean };
export type RoadmapPhase = { name: string; duration: string; tasks: RoadmapTask[] };
export type ProjectRoadmap = { phases: RoadmapPhase[] };

// === Viva ===
export const VivaQuestionSchema = z.object({
  category: z.enum(['basic', 'technical', 'architecture', 'aiml', 'database', 'security', 'difficult']),
  question: z.string(),
  expectedPoints: z.array(z.string()),
});

export const VivaQuestionsResponseSchema = z.object({
  questions: z.array(VivaQuestionSchema),
});

export type VivaQuestion = z.infer<typeof VivaQuestionSchema>;

export const VivaEvaluationSchema = z.object({
  score: z.number().min(0).max(10),
  whatWasGood: z.string(),
  whatWasMissing: z.string(),
  betterAnswer: z.string(),
});

export type VivaEvaluation = z.infer<typeof VivaEvaluationSchema>;

// === Mentor ===
export const MentorResponseSchema = z.object({
  response: z.string(),
});
