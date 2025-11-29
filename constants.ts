import { Milestone } from "./types";

export const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 2000 },
  { level: 7, xp: 4000 },
  { level: 8, xp: 8000 },
  { level: 9, xp: 16000 },
  { level: 10, xp: 32000 },
];

export const MILESTONES: Milestone[] = [
  // Consistency Milestones
  { id: 'bronze', name: 'Novice Typist', description: 'Complete 5 tests', requiredTests: 5, icon: 'fa-medal text-amber-700' },
  { id: 'silver', name: 'Dedicated Typist', description: 'Complete 25 tests', requiredTests: 25, icon: 'fa-medal text-slate-400' },
  { id: 'gold', name: 'Master Typist', description: 'Complete 50 tests', requiredTests: 50, icon: 'fa-medal text-yellow-500' },
  { id: 'platinum', name: 'Keyboard Legend', description: 'Complete 100 tests', requiredTests: 100, icon: 'fa-crown text-purple-500' },
  
  // Speed Milestones
  { id: 'speed-40', name: 'Cruising Speed', description: 'Reach 40 WPM', requiredWpm: 40, icon: 'fa-gauge-simple text-blue-400' },
  { id: 'speed-60', name: 'Rapid Typer', description: 'Reach 60 WPM', requiredWpm: 60, icon: 'fa-gauge-high text-indigo-500' },
  { id: 'speed-80', name: 'Lightning Fingers', description: 'Reach 80 WPM', requiredWpm: 80, icon: 'fa-bolt text-yellow-400' },
  { id: 'speed-100', name: 'Grandmaster Speed', description: 'Reach 100 WPM', requiredWpm: 100, icon: 'fa-fire text-red-500' },
];

export const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Typing fast is a skill that takes practice and patience. Regular exercises can help improve both your speed and accuracy over time.",
  "Technology continues to evolve at a rapid pace, changing the way we live, work, and communicate with one another across the globe.",
  "A journey of a thousand miles begins with a single step. Consistency is key to mastering any new skill, including touch typing.",
  "In software engineering, clean code is often more important than clever code. Readability helps teams maintain projects in the long run."
];

export const GEMINI_PROMPT = "Generate a random interesting paragraph about science, history, or technology for a typing test. It should be approximately 60-80 words long. Plain text only, no markdown.";