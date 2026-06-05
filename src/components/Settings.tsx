import React, { useState } from 'react';
import type { AppState } from '../types';
import {
  getAppState,
  saveAppState,
  calculateDailyGoal,
  requestNotificationPermission,
} from '../utils';
import { Target, Bell, Moon, Sun, Scale, Droplet, Info, BellRing } from 'lucide-react';

export const Settings: React.FC<{ onStateChange: (state: AppState) => void }> = ({
  onStateChange,
}) => {
  const [state, setState] = useState<AppState>(getAppState());
  const [notificationEnabled, setNotificationEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const updateMultipleSettings = (updates: Partial<typeof state.settings>) => {
    const newState = {
      ...state,
      settings: {
        ...state.settings,
        ...updates,
      },
    };
    setState(newState);
    saveAppState(newState);
    onStateChange(newState);
  };

  const updateSettings = (key: keyof typeof state.settings, value: any) => {
    updateMultipleSettings({ [key]: value });
  };

  const handleWeightChange = (weight: number) => {
    const newGoal = calculateDailyGoal(weight);
    updateMultipleSettings({ weight, dailyGoal: newGoal });
  };

  const toggleNotifications = async () => {
    const hasPermission = await requestNotificationPermission();
    setNotificationEnabled(hasPermission);
  };

  return (
    <div className="space-y-6">
      {/* Daily Goal Settings */}
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-primary" />
          Daily Hydration Goal
        </h3>
        <div className="space-y-5">
          {/* Weight Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Scale className="w-4 h-4 text-slate-400" />
              Your Weight (kg)
            </label>
            <input
              type="number"
              value={state.settings.weight}
              onChange={(e) =>
                handleWeightChange(Math.max(20, parseInt(e.target.value) || 70))
              }
              className="input-field"
              min="20"
              max="200"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Formula: Weight × 35ml = Recommended Goal
            </p>
          </div>

          {/* Daily Goal Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Droplet className="w-4 h-4 text-brand-primary" />
              Daily Goal ({state.settings.unit})
            </label>
            <input
              type="number"
              value={state.settings.dailyGoal}
              onChange={(e) =>
                updateSettings('dailyGoal', Math.max(500, parseInt(e.target.value) || 2500))
              }
              className="input-field"
              min="500"
              max="10000"
              step="100"
            />
          </div>

          {/* Unit Preference */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Preferred Unit
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  checked={state.settings.unit === 'ml'}
                  onChange={() => updateSettings('unit', 'ml')}
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-xl border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-400 peer-checked:border-brand-primary peer-checked:text-brand-primary peer-checked:bg-brand-light/50 dark:peer-checked:bg-brand-primary/20 transition-all">
                  Milliliters (ml)
                </div>
              </label>
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  checked={state.settings.unit === 'oz'}
                  onChange={() => updateSettings('unit', 'oz')}
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-xl border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-400 peer-checked:border-brand-primary peer-checked:text-brand-primary peer-checked:bg-brand-light/50 dark:peer-checked:bg-brand-primary/20 transition-all">
                  Fluid Ounces (oz)
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-primary" />
          Reminder Settings
        </h3>
        <div className="space-y-5">
          {/* Reminder Interval */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <BellRing className="w-4 h-4 text-slate-400" />
              Reminder Interval (minutes)
            </label>
            <select
              value={state.settings.reminderInterval}
              onChange={(e) => updateSettings('reminderInterval', parseInt(e.target.value))}
              className="input-field appearance-none"
            >
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
              <option value={120}>Every 2 hours</option>
              <option value={180}>Every 3 hours</option>
              <option value={240}>Every 4 hours</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Wake Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Sun className="w-4 h-4 text-orange-400" />
                Wake Time
              </label>
              <input
                type="time"
                value={state.settings.wakeTime}
                onChange={(e) => updateSettings('wakeTime', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Sleep Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Sleep Time
              </label>
              <input
                type="time"
                value={state.settings.sleepTime}
                onChange={(e) => updateSettings('sleepTime', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${notificationEnabled ? 'bg-brand-light text-brand-primary dark:bg-brand-primary/40 dark:text-brand-light' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'} transition-colors`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-white">
                    Push Notifications
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {notificationEnabled ? 'Reminders are active' : 'Enable to get reminders'}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationEnabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${notificationEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
              <input
                type="checkbox"
                checked={notificationEnabled}
                onChange={toggleNotifications}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="glass-card bg-brand-light/50 dark:bg-brand-primary/10 border-brand-light dark:border-brand-primary/30">
        <h3 className="text-lg font-bold mb-3 text-brand-primary dark:text-brand-light flex items-center gap-2">
          <Info className="w-5 h-5" />
          Hydration Tips
        </h3>
        <ul className="text-sm font-medium text-slate-700 dark:text-slate-300 space-y-2">
          <li className="flex gap-2"><span className="text-brand-primary">•</span> Drink a glass of water when you wake up</li>
          <li className="flex gap-2"><span className="text-brand-primary">•</span> Drink before, during, and after exercise</li>
          <li className="flex gap-2"><span className="text-brand-primary">•</span> Keep water nearby throughout the day</li>
          <li className="flex gap-2"><span className="text-brand-primary">•</span> Monitor your urine color (pale is good)</li>
          <li className="flex gap-2"><span className="text-brand-primary">•</span> Increase intake in hot weather</li>
        </ul>
      </div>
    </div>
  );
};

