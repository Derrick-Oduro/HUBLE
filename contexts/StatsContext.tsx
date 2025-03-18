"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define the shape of our stats data
interface StatsData {
  // User stats
  level: number
  experience: number
  maxExperience: number
  health: number
  maxHealth: number

  // Habits stats
  totalHabits: number
  completedHabitsToday: number
  habitCompletionRate: number
  longestHabitStreak: number
  currentHabitStreak: number

  // Dailies stats
  totalDailies: number
  completedDailiesToday: number
  dailyCompletionRate: number
  mostProductiveDay: string

  // Routines stats
  totalRoutines: number
  routinesStartedToday: number
  routinesCompletedToday: number
  mostCompletedRoutine: string
  routineCompletionRate: number

  // Timer stats
  focusSessionsToday: number
  focusTimeToday: string
  totalFocusTime: string
  averageSessionLength: string
  longestSession: string

  // Overall stats
  totalTasksCompleted: number
  weeklyCompletionRate: number
  coinsEarned: number
  gemsEarned: number
}

// Default stats values
const defaultStats: StatsData = {
  // User stats
  level: 4,
  experience: 83,
  maxExperience: 100,
  health: 42,
  maxHealth: 50,

  // Habits stats
  totalHabits: 5,
  completedHabitsToday: 3,
  habitCompletionRate: 85,
  longestHabitStreak: 14,
  currentHabitStreak: 7,

  // Dailies stats
  totalDailies: 4,
  completedDailiesToday: 2,
  dailyCompletionRate: 75,
  mostProductiveDay: "Wednesday",

  // Routines stats
  totalRoutines: 3,
  routinesStartedToday: 1,
  routinesCompletedToday: 1,
  mostCompletedRoutine: "Morning Routine",
  routineCompletionRate: 80,

  // Timer stats
  focusSessionsToday: 2,
  focusTimeToday: "1h 45m",
  totalFocusTime: "12h 30m",
  averageSessionLength: "25m",
  longestSession: "45m",

  // Overall stats
  totalTasksCompleted: 127,
  weeklyCompletionRate: 82,
  coinsEarned: 250,
  gemsEarned: 5,
}

// Create the context
interface StatsContextType {
  stats: StatsData
  refreshStats: () => Promise<void>
  updateDailyCompletion: (completed: number, total: number) => void
  updateHabitCompletion: (completed: number, total: number) => void
  updateRoutineCompletion: (completed: number, total: number) => void
  updateFocusSessions: (sessions: number) => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

// Provider component
export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsData>(defaultStats)

  // Load stats from AsyncStorage on mount
  useEffect(() => {
    refreshStats()
  }, [])

  // Function to refresh all stats
  const refreshStats = async () => {
    try {
      // Load habits data
      const habitsData = await AsyncStorage.getItem("habitsData")
      if (habitsData) {
        const habits = JSON.parse(habitsData)
        const completedHabits = habits.filter((habit) => habit.completed).length || 0

        setStats((prev) => ({
          ...prev,
          totalHabits: habits.length,
          completedHabitsToday: completedHabits,
          habitCompletionRate: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0,
        }))
      }

      // Load dailies data
      const dailiesData = await AsyncStorage.getItem("dailiesData")
      if (dailiesData) {
        const dailies = JSON.parse(dailiesData)
        const completedDailies = dailies.filter((daily) => daily.completed).length

        setStats((prev) => ({
          ...prev,
          totalDailies: dailies.length,
          completedDailiesToday: completedDailies,
          dailyCompletionRate: dailies.length > 0 ? Math.round((completedDailies / dailies.length) * 100) : 0,
        }))
      }

      // Load routines data
      const routinesData = await AsyncStorage.getItem("routinesData")
      if (routinesData) {
        const routines = Object.values(JSON.parse(routinesData))

        setStats((prev) => ({
          ...prev,
          totalRoutines: routines.length,
        }))
      }

      // Load timer stats
      const timerStats = await AsyncStorage.getItem("timerStats")
      if (timerStats) {
        const timer = JSON.parse(timerStats)

        setStats((prev) => ({
          ...prev,
          focusSessionsToday: timer.totalSessionsToday || 0,
        }))
      }

      // Load user stats
      const userStats = await AsyncStorage.getItem("userStats")
      if (userStats) {
        const user = JSON.parse(userStats)

        setStats((prev) => ({
          ...prev,
          level: user.level || prev.level,
          experience: user.experience || prev.experience,
          health: user.health || prev.health,
          coinsEarned: user.coins || prev.coinsEarned,
          gemsEarned: user.gems || prev.gemsEarned,
        }))
      }
    } catch (e) {
      console.error("Failed to refresh stats:", e)
    }
  }

  // Function to update daily task completion
  const updateDailyCompletion = (completed: number, total: number) => {
    setStats((prev) => ({
      ...prev,
      completedDailiesToday: completed,
      totalDailies: total,
      dailyCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
  }

  // Function to update habit completion
  const updateHabitCompletion = (completed: number, total: number) => {
    setStats((prev) => ({
      ...prev,
      completedHabitsToday: completed,
      totalHabits: total,
      habitCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
  }

  // Function to update routine completion
  const updateRoutineCompletion = (completed: number, total: number) => {
    setStats((prev) => ({
      ...prev,
      routinesCompletedToday: completed,
      totalRoutines: total,
      routineCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
  }

  // Function to update focus sessions
  const updateFocusSessions = (sessions: number) => {
    setStats((prev) => ({
      ...prev,
      focusSessionsToday: sessions,
    }))
  }

  return (
    <StatsContext.Provider
      value={{
        stats,
        refreshStats,
        updateDailyCompletion,
        updateHabitCompletion,
        updateRoutineCompletion,
        updateFocusSessions,
      }}
    >
      {children}
    </StatsContext.Provider>
  )
}

// Custom hook to use the stats context
export function useStats() {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider")
  }
  return context
}

