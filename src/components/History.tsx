import React, { useState, useMemo } from 'react';
import type { AppState } from '../types';
import {
  getAppState,
  calculateStreak,
  getLast7Days,
  formatWater,
  formatDate,
} from '../utils';
import { Flame, Target, CalendarDays, Award, CheckCircle2, BarChart2 } from 'lucide-react';

export const History: React.FC = () => {
  const [state] = useState<AppState>(getAppState());

  const last7Days = useMemo(() => getLast7Days(state.history), [state.history]);
  const currentStreak = useMemo(
    () => calculateStreak([...state.history, state.todayData]),
    [state.history, state.todayData]
  );

  const maxAmount = useMemo(
    () => Math.max(...last7Days.map((d) => d.totalAmount), state.settings.dailyGoal),
    [last7Days, state.settings.dailyGoal]
  );

  const getBarHeight = (amount: number): number => {
    return Math.min((amount / maxAmount) * 100, 100);
  };

  const goalsMetCount = useMemo(
    () => state.history.filter((d) => d.goalMet).length + (state.todayData.goalMet ? 1 : 0),
    [state.history, state.todayData]
  );

  return (
    <div className="space-y-6">
      {/* Streak & Goals Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-brand-light to-brand-primary/20 dark:from-brand-primary/40 dark:to-brand-primary/20 rounded-xl">
              <Flame className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {currentStreak}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Day Streak
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-accent/10 rounded-full blur-2xl group-hover:bg-brand-accent/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-brand-bg to-brand-accent/30 dark:from-brand-accent/40 dark:to-brand-accent/20 rounded-xl">
              <Target className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {goalsMetCount}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Goals Met
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-brand-light to-brand-primary/20 dark:from-brand-primary/40 dark:to-brand-primary/20 rounded-xl">
              <CalendarDays className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {state.history.length + 1}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-brand-primary" />
          Last 7 Days
        </h3>
        <div className="space-y-5">
          {last7Days.map((day, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-brand-primary transition-colors">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {formatWater(day.totalAmount, state.settings.unit)}
                  {day.goalMet && <CheckCircle2 className="w-4 h-4 text-brand-accent" />}
                </div>
              </div>
              <div className="w-full bg-brand-light/50 dark:bg-slate-800/50 rounded-full h-4 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${getBarHeight(day.totalAmount)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-[-150%] animate-[wave_2s_infinite]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-primary" />
          Badges Earned
        </h3>
        {state.badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/30 dark:bg-slate-900/30 rounded-xl border border-dashed border-brand-light dark:border-slate-700">
            <Award className="w-12 h-12 text-brand-light dark:text-slate-600 mb-2" />
            <p className="text-brand-primary/60 dark:text-slate-400 font-medium">
              Keep hydrating to earn badges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {state.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-brand-light/20 dark:bg-slate-800/50 backdrop-blur border border-brand-primary/20 dark:border-slate-700/50 rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-3 drop-shadow-md">{badge.icon}</div>
                <p className="font-bold text-sm text-slate-800 dark:text-white mb-1">
                  {badge.name}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All History */}
      {state.history.length > 0 && (
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
            Full History
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {[...state.history, state.todayData]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-white/50 dark:border-slate-700/50 hover:border-brand-primary/30 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {formatDate(day.date)}
                    </p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {day.logs.length} logs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-primary dark:text-white text-lg">
                      {formatWater(day.totalAmount, state.settings.unit)}
                    </p>
                    {day.goalMet && (
                      <p className="text-xs font-bold text-brand-accent flex items-center justify-end gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Goal met
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

