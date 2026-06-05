import { useState, useEffect } from 'react'
import { Dashboard, Settings as SettingsView, History as HistoryView } from './components'
import type { AppState } from './types'
import {
  getAppState,
  saveAppState,
  isWithinWakeHours,
  sendNotification,
  checkBadges,
  getTodayDate,
} from './utils'
import { Droplet, Settings, BarChart2, Sun, Moon } from 'lucide-react'
import './App.css'

type TabType = 'dashboard' | 'settings' | 'history'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [state, setState] = useState<AppState>(getAppState())
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Handle state changes from child components
  const handleStateChange = (newState: AppState) => {
    setState(newState)
    saveAppState(newState)

    // Check and update badges
    const updatedBadges = checkBadges(newState.history, newState.todayData, newState.badges)
    if (updatedBadges.length > newState.badges.length) {
      const newBadge = updatedBadges[updatedBadges.length - 1]
      sendNotification(`🏆 New Badge Unlocked: ${newBadge.name}!`, {
        body: newBadge.description,
      })
      const updated = { ...newState, badges: updatedBadges }
      setState(updated)
      saveAppState(updated)
    }
  }

  // Reminder system
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const isWithinWake = isWithinWakeHours(
        state.settings.wakeTime,
        state.settings.sleepTime
      )

      if (isWithinWake && now - state.lastReminder > state.settings.reminderInterval * 60 * 1000) {
        const messages = [
          `💧 Time to drink water! You've had ${state.todayData.totalAmount}ml so far.`,
          '💧 Stay hydrated! Have you had your water today?',
          '💧 Your body needs water. Take a sip!',
          `💧 ${state.settings.dailyGoal - state.todayData.totalAmount}ml more to reach your goal!`,
        ]
        const randomMsg = messages[Math.floor(Math.random() * messages.length)]
        sendNotification('Water Reminder', { body: randomMsg })
        
        const updated = { ...state, lastReminder: now }
        setState(updated)
        saveAppState(updated)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [state])

  // Reset daily data at midnight
  useEffect(() => {
    const checkReset = () => {
      const today = getTodayDate()
      if (state.todayData.date !== today) {
        const newState = {
          ...state,
          history: [
            ...state.history,
            state.todayData,
          ],
          todayData: {
            date: today,
            logs: [],
            totalAmount: 0,
            goalMet: false,
            streakDays: 0,
          },
        }
        setState(newState)
        saveAppState(newState)
      }
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeout = setTimeout(checkReset, tomorrow.getTime() - now.getTime())
    return () => clearTimeout(timeout)
  }, [state.todayData.date])

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 bg-brand-bg dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}>
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-light/50 dark:bg-brand-primary/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/30 dark:bg-brand-accent/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-[100dvh] max-w-md mx-auto sm:max-w-xl md:max-w-4xl pt-4 pb-24 md:pb-8 px-4 sm:px-6">
        
        {/* Header */}
        <header className="glass-panel mb-8 mt-2 sticky top-4 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary blur-md opacity-50 rounded-full animate-pulse"></div>
                <Droplet className="w-8 h-8 text-brand-primary fill-brand-primary relative z-10" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">
                Love H₂O
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-brand-light/50 dark:bg-slate-800/50 hover:bg-brand-light dark:hover:bg-slate-700/50 text-brand-primary dark:text-brand-light transition-all active:scale-95"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && <Dashboard onStateChange={handleStateChange} />}
          {activeTab === 'settings' && <SettingsView onStateChange={handleStateChange} />}
          {activeTab === 'history' && <HistoryView />}
        </main>

        {/* Navigation Tabs - Mobile Bottom, Desktop Sticky */}
        <nav className="fixed bottom-4 left-4 right-4 md:static md:mt-8 z-50">
          <div className="glass-panel mx-auto max-w-md md:max-w-none">
            <div className="flex p-2 gap-2">
              {(['dashboard', 'history', 'settings'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const Icon = tab === 'dashboard' ? Droplet : tab === 'settings' ? Settings : BarChart2;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-3 px-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-light text-brand-primary dark:bg-brand-primary/20 dark:text-brand-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-brand-light/50 dark:hover:bg-slate-800/50 hover:text-brand-primary dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-brand-light dark:fill-brand-primary/20' : ''}`} />
                    <span className="text-xs md:text-sm capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

      </div>
    </div>
  )
}

export default App
