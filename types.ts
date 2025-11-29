export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  totalTests: number;
  bestWpm: number;
  createdAt: string;
  password?: string; // For mock auth only
}

export interface TestResult {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  date: string;
  xpEarned: number;
  mode: 'text' | 'time';
  duration?: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredTests?: number;
  requiredWpm?: number;
  icon: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  wpm: number;
  level: number;
  xp: number;
}

export enum TestState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED'
}

export type Theme = 'light' | 'dark';