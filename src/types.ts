// Types for the water reminder app
export interface WaterLog {
  date: string;
  amount: number; // in ml
  timestamp: number;
}

export interface UserSettings {
  weight: number; // in kg
  dailyGoal: number; // in ml
  reminderInterval: number; // in minutes
  wakeTime: string; // HH:mm format
  sleepTime: string; // HH:mm format
  unit: 'ml' | 'oz';
}

export interface DailyData {
  date: string;
  logs: WaterLog[];
  totalAmount: number;
  goalMet: boolean;
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface AppState {
  settings: UserSettings;
  todayData: DailyData;
  history: DailyData[];
  badges: Badge[];
  lastReminder: number;
}
