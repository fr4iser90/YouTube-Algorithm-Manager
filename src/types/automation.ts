import { AlgorithmState } from './algorithm';

export interface AutomationAction {
  id: string;
  type: 'search' | 'watch' | 'like' | 'comment' | 'subscribe' | 'navigate';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  progress?: number;
  data?: any;
}

export interface TrainingProgress {
  progress: number;
  message: string;
  videosWatched: number;
  searchesPerformed: number;
  timestamp: number;
}

export interface TrainingProfile {
  id: string;
  presetId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'paused' | 'error';
  progress: number;
  currentAction: string;
  results?: AlgorithmState;
  language: string;
  region: string;
}
