import type { UserSettings, DailyData, Badge } from './types';

const DEFAULT_SETTINGS: UserSettings = {
  weight: 70,
  dailyGoal: 2500,
  reminderInterval: 60,
  wakeTime: '06:00',
  sleepTime: '22:00',
  unit: 'ml',
};

const BADGES_CONFIG: Badge[] = [
  {
    id: 'first_glass',
    name: 'First Glass',
    description: 'Log your first glass of water',
    icon: '🥤',
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Drink 5 liters in a day',
    icon: '🦸',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Meet daily goal 10 times',
    icon: '💪',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log water before 8 AM',
    icon: '🌅',
  },
];

// Calculate daily water intake based on weight
export const calculateDailyGoal = (weight: number): number => {
  // Formula: weight (kg) * 35 ml/kg
  return Math.round(weight * 35);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Check if time is between wake and sleep times
export const isWithinWakeHours = (
  wakeTime: string,
  sleepTime: string,
  date: Date = new Date()
): boolean => {
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

  const currentTime = date.getHours() * 60 + date.getMinutes();
  const wakeMinutes = wakeHour * 60 + wakeMin;
  const sleepMinutes = sleepHour * 60 + sleepMin;

  if (wakeMinutes <= sleepMinutes) {
    return currentTime >= wakeMinutes && currentTime < sleepMinutes;
  } else {
    return currentTime >= wakeMinutes || currentTime < sleepMinutes;
  }
};

// Format ml to display value based on unit preference
export const formatWater = (
  ml: number,
  unit: 'ml' | 'oz' = 'ml',
  decimals: number = 0
): string => {
  if (unit === 'oz') {
    const oz = ml / 29.5735;
    return `${oz.toFixed(decimals)} oz`;
  }
  return `${ml.toFixed(decimals)} ml`;
};

// Get percentage of goal completed
export const getGoalPercentage = (
  current: number,
  goal: number
): number => {
  return Math.min(Math.round((current / goal) * 100), 100);
};

// Calculate streak days
export const calculateStreak = (history: DailyData[]): number => {
  if (history.length === 0) return 0;

  let streak = 0;
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = getTodayDate();

  let lastDate = today;
  for (const day of sortedHistory) {
    if (day.goalMet) {
      const lastDateObj = new Date(lastDate);
      const expectedDate = new Date(lastDateObj);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (day.date === expectedDate.toISOString().split('T')[0]) {
        streak++;
        lastDate = day.date;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
};

// Check and unlock badges
export const checkBadges = (
  history: DailyData[],
  todayData: DailyData,
  unlockedBadges: Badge[]
): Badge[] => {
  const newBadges = [...unlockedBadges];

  // Check First Glass
  if (
    todayData.logs.length > 0 &&
    !newBadges.find((b) => b.id === 'first_glass')
  ) {
    newBadges.push({
      ...BADGES_CONFIG[0],
      unlockedAt: Date.now(),
    });
  }

  // Check Goal Crusher (met goal 10 times)
  const goalMetCount = history.filter((d) => d.goalMet).length;
  if (goalMetCount >= 10 && !newBadges.find((b) => b.id === 'goal_crusher')) {
    newBadges.push({
      ...BADGES_CONFIG[4],
      unlockedAt: Date.now(),
    });
  }

  // Check Week Warrior (7-day streak)
  const streak = calculateStreak(history);
  if (streak >= 7 && !newBadges.find((b) => b.id === 'week_warrior')) {
    newBadges.push({
      ...BADGES_CONFIG[2],
      unlockedAt: Date.now(),
    });
  }

  // Check Month Master (30-day streak)
  if (streak >= 30 && !newBadges.find((b) => b.id === 'month_master')) {
    newBadges.push({
      ...BADGES_CONFIG[3],
      unlockedAt: Date.now(),
    });
  }

  // Check Hydration Hero (5 liters in a day)
  if (todayData.totalAmount >= 5000 && !newBadges.find((b) => b.id === 'hydration_hero')) {
    newBadges.push({
      ...BADGES_CONFIG[1],
      unlockedAt: Date.now(),
    });
  }

  // Check Early Bird (logged before 8 AM)
  const earlyLog = todayData.logs.find((log) => {
    const date = new Date(log.timestamp);
    return date.getHours() < 8;
  });
  if (earlyLog && !newBadges.find((b) => b.id === 'early_bird')) {
    newBadges.push({
      ...BADGES_CONFIG[5],
      unlockedAt: Date.now(),
    });
  }

  return newBadges;
};

// Initialize or get app state from localStorage
export const getAppState = () => {
  const stored = localStorage.getItem('waterReminderState');
  if (stored) {
    return JSON.parse(stored);
  }

  const today = getTodayDate();
  return {
    settings: DEFAULT_SETTINGS,
    todayData: {
      date: today,
      logs: [],
      totalAmount: 0,
      goalMet: false,
      streakDays: 0,
    },
    history: [],
    badges: [],
    lastReminder: 0,
  };
};

// Save app state to localStorage
export const saveAppState = (state: any) => {
  localStorage.setItem('waterReminderState', JSON.stringify(state));
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send notification
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/water-icon.png',
      ...options,
    });
  }
};

// Format date to readable string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Get last 7 days history
export const getLast7Days = (history: DailyData[]): DailyData[] => {
  const today = new Date();
  const last7 = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayData = history.find((d) => d.date === dateStr);
    if (dayData) {
      last7.push(dayData);
    } else {
      last7.push({
        date: dateStr,
        logs: [],
        totalAmount: 0,
        goalMet: false,
        streakDays: 0,
      });
    }
  }

  return last7;
};
