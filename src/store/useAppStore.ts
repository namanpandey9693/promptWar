import { create } from 'zustand';
import type {
  StudentProfile,
  ProjectIdea,
  RealityCheckResult,
  ProjectArchitecture,
  ProjectRoadmap,
  RoadmapPhase,
  VivaQuestion,
} from '../services/api';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface AppState {
  // Profile
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile) => void;

  // Projects
  projects: ProjectIdea[];
  setProjects: (projects: ProjectIdea[]) => void;

  // Selected Project
  selectedProject: ProjectIdea | null;
  setSelectedProject: (project: ProjectIdea | null) => void;

  // Custom project (for reality check on custom idea)
  customProjectTitle: string;
  customProjectDescription: string;
  setCustomProject: (title: string, description: string) => void;

  // Reality Check
  realityCheck: RealityCheckResult | null;
  setRealityCheck: (result: RealityCheckResult) => void;

  // Architecture
  architecture: ProjectArchitecture | null;
  setArchitecture: (arch: ProjectArchitecture) => void;

  // Roadmap
  roadmap: ProjectRoadmap | null;
  setRoadmap: (roadmap: ProjectRoadmap) => void;
  toggleTask: (phaseIndex: number, taskIndex: number) => void;

  // Mentor Chat
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Viva
  vivaQuestions: VivaQuestion[];
  setVivaQuestions: (questions: VivaQuestion[]) => void;

  // Current step in the flow
  currentStep: string;
  setCurrentStep: (step: string) => void;

  // Get active project info (selected or custom)
  getActiveProjectTitle: () => string;
  getActiveProjectDescription: () => string;
  getActiveProjectTechStack: () => string[];
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  setProfile: (profile) => set({
    profile,
    projects: [],
    selectedProject: null,
    realityCheck: null,
    architecture: null,
    roadmap: null,
    chatHistory: [],
    vivaQuestions: []
  }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  selectedProject: null,
  setSelectedProject: (project) => set({
    selectedProject: project,
    customProjectTitle: '',
    customProjectDescription: '',
    realityCheck: null,
    architecture: null,
    roadmap: null,
    chatHistory: [],
    vivaQuestions: []
  }),

  customProjectTitle: '',
  customProjectDescription: '',
  setCustomProject: (title, description) =>
    set({
      customProjectTitle: title,
      customProjectDescription: description,
      selectedProject: null,
      realityCheck: null,
      architecture: null,
      roadmap: null,
      chatHistory: [],
      vivaQuestions: []
    }),

  realityCheck: null,
  setRealityCheck: (result) => set({ realityCheck: result }),

  architecture: null,
  setArchitecture: (arch) => set({ architecture: arch }),

  roadmap: null,
  setRoadmap: (roadmap) => {
    // Add `completed: false` to all tasks
    const withCompleted: ProjectRoadmap = {
      phases: roadmap.phases.map((phase: RoadmapPhase) => ({
        ...phase,
        tasks: phase.tasks.map((task) => ({
          ...task,
          completed: false,
        })),
      })),
    };
    set({ roadmap: withCompleted });
  },
  toggleTask: (phaseIndex, taskIndex) =>
    set((state) => {
      if (!state.roadmap) return state;
      const newPhases = [...state.roadmap.phases];
      const newTasks = [...newPhases[phaseIndex].tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], completed: !newTasks[taskIndex].completed };
      newPhases[phaseIndex] = { ...newPhases[phaseIndex], tasks: newTasks };
      return { roadmap: { phases: newPhases } };
    }),

  chatHistory: [],
  addChatMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  clearChat: () => set({ chatHistory: [] }),

  vivaQuestions: [],
  setVivaQuestions: (questions) => set({ vivaQuestions: questions }),

  currentStep: 'landing',
  setCurrentStep: (step) => set({ currentStep: step }),

  getActiveProjectTitle: () => {
    const state = get();
    return state.selectedProject?.title || state.customProjectTitle || '';
  },
  getActiveProjectDescription: () => {
    const state = get();
    return state.selectedProject?.description || state.customProjectDescription || '';
  },
  getActiveProjectTechStack: () => {
    const state = get();
    return state.selectedProject?.techStack || [];
  },
}));
