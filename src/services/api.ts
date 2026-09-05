const API_BASE = '/api';

async function apiCall<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface ProjectIdea {
  title: string;
  description: string;
  problemSolved: string;
  whyItMatchesStudent: string;
  aimlComponent: string;
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  estimatedCost: string;
  innovationScore: number;
  feasibilityScore: number;
  resumeValue: 'low' | 'medium' | 'high' | 'exceptional';
  mainRisk: string;
}

export interface RealityCheckResult {
  scores: {
    innovation: number;
    feasibility: number;
    technicalComplexity: number;
    datasetAvailability: number;
    costFeasibility: number;
    timeFeasibility: number;
    aiPotential: number;
    resumeValue: number;
    riskLevel: number;
  };
  healthScore: number;
  analysis: {
    biggestStrength: string;
    biggestWeakness: string;
    technicalRisk: string;
    implementationRisk: string;
    failureScenario: string;
    improvementSuggestion: string;
  };
  verdict: 'GOOD_TO_BUILD' | 'NEEDS_MODIFICATION' | 'HIGH_RISK' | 'NOT_RECOMMENDED';
  verdictExplanation: string;
  alternativeSuggestion?: string;
}

export interface ProjectArchitecture {
  frontend: { tech: string; description: string };
  backend: { tech: string; description: string };
  aiLayer: { tech: string; description: string };
  database: { tech: string; description: string };
  apis: string[];
  authentication: string;
  mainModules: { name: string; description: string }[];
  dataFlow: string[];
  deployment: string;
}

export interface RoadmapTask {
  title: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface RoadmapPhase {
  name: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface ProjectRoadmap {
  phases: RoadmapPhase[];
}

export interface VivaQuestion {
  category: string;
  question: string;
  expectedPoints: string[];
}

export interface VivaEvaluation {
  score: number;
  whatWasGood: string;
  whatWasMissing: string;
  betterAnswer: string;
}

export interface StudentProfile {
  name: string;
  branch: string;
  year: string;
  programmingSkills: string[];
  technologies: string[];
  aimlKnowledge: string;
  webDevKnowledge: string;
  interests: string[];
  teamSize: number;
  availableMonths: number;
  budget: string;
  difficulty: string;
  careerGoal: string;
}

// API Functions
export function generateProjects(profile: StudentProfile) {
  return apiCall<{ projects: ProjectIdea[] }>('/generate-projects', { profile });
}

export function realityCheck(profile: StudentProfile, projectTitle: string, projectDescription: string) {
  return apiCall<RealityCheckResult>('/reality-check', { profile, projectTitle, projectDescription });
}

export function generateArchitecture(profile: StudentProfile, projectTitle: string, projectDescription: string, techStack?: string[]) {
  return apiCall<ProjectArchitecture>('/architecture', { profile, projectTitle, projectDescription, techStack });
}

export function generateRoadmap(profile: StudentProfile, projectTitle: string, projectDescription: string, techStack?: string[]) {
  return apiCall<ProjectRoadmap>('/roadmap', { profile, projectTitle, projectDescription, techStack });
}

export function mentorChat(
  profile: StudentProfile,
  projectTitle: string,
  projectDescription: string,
  techStack: string[],
  userMessage: string,
  chatHistory: { role: string; content: string }[],
  architectureSummary?: string,
  roadmapProgress?: string
) {
  return apiCall<{ response: string }>('/mentor', {
    profile, projectTitle, projectDescription, techStack,
    userMessage, chatHistory, architectureSummary, roadmapProgress,
  });
}

export function generateVivaQuestions(profile: StudentProfile, projectTitle: string, projectDescription: string, techStack?: string[]) {
  return apiCall<{ questions: VivaQuestion[] }>('/viva/generate', { profile, projectTitle, projectDescription, techStack });
}

export function evaluateVivaAnswer(question: string, expectedPoints: string[], studentAnswer: string, projectTitle: string) {
  return apiCall<VivaEvaluation>('/viva/evaluate', { question, expectedPoints, studentAnswer, projectTitle });
}
