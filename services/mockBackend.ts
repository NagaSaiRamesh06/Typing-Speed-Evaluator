import { User, TestResult, LeaderboardEntry } from "../types";
import { LEVELS } from "../constants";

// Keys for LocalStorage
const STORAGE_KEYS = {
  USERS: 'typemaster_users_db', // Store all users
  CURRENT_USER: 'typemaster_current_user',
  RESULTS: 'typemaster_results',
  LEADERBOARD: 'typemaster_leaderboard',
};

// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateLevel = (xp: number): number => {
  let level = 1;
  for (const l of LEVELS) {
    if (xp >= l.xp) level = l.level;
    else break;
  }
  return level;
};

// --- Simulated API ---

export const mockAuth = {
  // Login with Password check
  login: async (username: string, password?: string): Promise<User> => {
    await delay(600);
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS) || '[]';
    const users: User[] = JSON.parse(usersStr);
    
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      throw new Error("User not found");
    }

    if (password && user.password && user.password !== password) {
       throw new Error("Invalid password");
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  // Register new user
  register: async (username: string, email: string, password?: string): Promise<User> => {
    await delay(600);
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS) || '[]';
    const users: User[] = JSON.parse(usersStr);

    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already taken");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      password, // In a real app, hash this!
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      level: 1,
      xp: 0,
      totalTests: 0,
      bestWpm: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }
};

export const mockDb = {
  saveResult: async (result: Omit<TestResult, 'id'>): Promise<User> => {
    await delay(300);
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userStr) throw new Error("User not found");

    const user: User = JSON.parse(userStr);
    
    // Create full result object
    const fullResult: TestResult = {
      ...result,
      id: crypto.randomUUID(),
    };

    // Update User Stats
    const newXp = user.xp + result.xpEarned;
    const newLevel = calculateLevel(newXp);
    const newTotalTests = user.totalTests + 1;
    const newBestWpm = Math.max(user.bestWpm, result.wpm);

    const updatedUser: User = {
      ...user,
      xp: newXp,
      level: newLevel,
      totalTests: newTotalTests,
      bestWpm: newBestWpm
    };

    // Save Current User
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    // Update User in global DB
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS) || '[]';
    let users: User[] = JSON.parse(usersStr);
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Save Result to History
    // We store all results in one array for simplicity, filtering by userId when fetching
    const historyStr = localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]';
    const history: TestResult[] = JSON.parse(historyStr);
    history.unshift(fullResult);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(history));

    // Update Leaderboard
    await mockDb.updateLeaderboard(updatedUser);

    return updatedUser;
  },

  getHistory: async (): Promise<TestResult[]> => {
    await delay(300);
    const currentUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserStr) return [];
    const user = JSON.parse(currentUserStr);

    const h = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!h) return [];
    
    const allResults: TestResult[] = JSON.parse(h);
    return allResults.filter(r => r.userId === user.id);
  },

  updateLeaderboard: async (user: User) => {
    const lbStr = localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]';
    let lb: LeaderboardEntry[] = JSON.parse(lbStr);
    
    const entry: LeaderboardEntry = {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      wpm: user.bestWpm,
      level: user.level,
      xp: user.xp
    };

    // Remove old entry for this user, add new, sort
    lb = lb.filter(e => e.userId !== user.id);
    lb.push(entry);
    lb.sort((a, b) => b.wpm - a.wpm);
    
    // Keep top 50
    lb = lb.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(lb));
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await delay(300);
    const lbStr = localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]';
    let lb: LeaderboardEntry[] = JSON.parse(lbStr);
    
    // If empty, seed with some fake data
    if (lb.length === 0) {
      lb = [
        { userId: '1', username: 'SpeedDemon', avatar: 'https://ui-avatars.com/api/?name=SpeedDemon&background=red', wpm: 120, level: 8, xp: 9000 },
        { userId: '2', username: 'TypingNinja', avatar: 'https://ui-avatars.com/api/?name=TypingNinja&background=blue', wpm: 115, level: 7, xp: 7500 },
        { userId: '3', username: 'KeyboardWarrior', avatar: 'https://ui-avatars.com/api/?name=KW&background=green', wpm: 105, level: 6, xp: 6200 },
      ];
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(lb));
    }
    return lb;
  }
};