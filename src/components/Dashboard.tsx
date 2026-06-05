import React, { useState, useEffect } from 'react';
import type { AppState } from '../types';
import { getAppState, saveAppState, getTodayDate, formatWater } from '../utils';
import { WaterBottle } from './WaterBottle';
import { Plus, RotateCcw, Droplets, Droplet } from 'lucide-react';

const PRESET_AMOUNTS = [150, 250, 350, 500];

export const Dashboard: React.FC<{ onStateChange: (state: AppState) => void }> = ({
  onStateChange,
}) => {
  const [state, setState] = useState<AppState>(getAppState());
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset daily data if it's a new day
  useEffect(() => {
    const today = getTodayDate();
    if (state.todayData.date !== today) {
      const newState = {
        ...state,
        todayData: {
          date: today,
          logs: [],
          totalAmount: 0,
          goalMet: false,
          streakDays: 0,
        },
      };
      setState(newState);
      saveAppState(newState);
    }
  }, []);

  const addWater = (amount: number) => {
    const newLog = {
      date: getTodayDate(),
      amount,
      timestamp: Date.now(),
    };

    const newTotalAmount = state.todayData.totalAmount + amount;
    const newTodayData = {
      ...state.todayData,
      logs: [...state.todayData.logs, newLog],
      totalAmount: newTotalAmount,
      goalMet: newTotalAmount >= state.settings.dailyGoal,
    };

    const newState = {
      ...state,
      todayData: newTodayData,
    };

    setState(newState);
    saveAppState(newState);
    onStateChange(newState);
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const undoLastLog = () => {
    if (state.todayData.logs.length > 0) {
      const lastLog = state.todayData.logs[state.todayData.logs.length - 1];
      const newTotalAmount = state.todayData.totalAmount - lastLog.amount;
      const newTodayData = {
        ...state.todayData,
        logs: state.todayData.logs.slice(0, -1),
        totalAmount: newTotalAmount,
        goalMet: newTotalAmount >= state.settings.dailyGoal,
      };

      const newState = {
        ...state,
        todayData: newTodayData,
      };

      setState(newState);
      saveAppState(newState);
      onStateChange(newState);
    }
  };

  return (
    <div className="space-y-6">
      {/* Water Bottle Progress */}
      <div className="glass-card flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-brand-primary" />
            Today's Progress
          </h2>
        </div>
        <WaterBottle
          current={state.todayData.totalAmount}
          goal={state.settings.dailyGoal}
          unit={state.settings.unit}
        />
      </div>

      {/* Quick Add Buttons */}
      <div className="glass-card">
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
          Log Intake
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => addWater(amount)}
              className="btn-secondary py-3 text-sm font-semibold flex flex-col items-center gap-1 group"
            >
              <Droplet className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
              <span>+{amount} {state.settings.unit}</span>
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-brand-primary hover:text-brand-primary hover:bg-brand-light/50 dark:hover:bg-brand-primary/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Custom Amount
          </button>
        ) : (
          <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount..."
              className="input-field flex-1"
              min="0"
              max="5000"
              autoFocus
            />
            <button
              onClick={() => {
                const amount = parseInt(customAmount);
                if (amount > 0) {
                  addWater(amount);
                }
              }}
              className="btn-primary px-6 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomAmount('');
              }}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Today's Logs */}
      {state.todayData.logs.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Recent Logs
            </h3>
            <button
              onClick={undoLastLog}
              className="text-xs font-medium flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo Last
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {[...state.todayData.logs].reverse().map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-white/50 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-light dark:bg-brand-primary/20 rounded-lg">
                    <Droplet className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {formatWater(log.amount, state.settings.unit)}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
