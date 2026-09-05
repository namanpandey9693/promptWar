import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      profile: null,
      projects: [],
      selectedProject: null,
      customProjectTitle: '',
      customProjectDescription: '',
      realityCheck: null,
      architecture: null,
      roadmap: null,
      chatHistory: [],
      vivaQuestions: [],
      currentStep: 'landing',
    });
  });

  it('should initialize with default state', () => {
    const state = useAppStore.getState();
    expect(state.profile).toBeNull();
    expect(state.projects).toEqual([]);
    expect(state.currentStep).toBe('landing');
  });

  it('should set and retrieve profile', () => {
    const profile = {
      name: 'Test Student',
      branch: 'CSE',
      year: '4th',
      programmingSkills: ['JavaScript'],
      technologies: ['React'],
      aimlKnowledge: 'basic',
      webDevKnowledge: 'intermediate',
      interests: ['AI'],
      teamSize: 1,
      availableMonths: 3,
      budget: 'low',
      difficulty: 'intermediate',
      careerGoal: 'Software Engineer',
    };

    useAppStore.getState().setProfile(profile);
    expect(useAppStore.getState().profile).toEqual(profile);
  });

  it('should get active project title correctly', () => {
    const store = useAppStore.getState();
    expect(store.getActiveProjectTitle()).toBe('');

    store.setCustomProject('Custom Title', 'Desc');
    expect(useAppStore.getState().getActiveProjectTitle()).toBe('Custom Title');
  });
});
