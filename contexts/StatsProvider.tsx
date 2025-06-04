"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Update the StatsData interface to include the progress bar related fields
interface StatsData {
  // User stats
  level: number
  experience: number
  maxExperience: number
  health: number
  maxHealth: number
  levelMessage: string

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

// Update the default stats to start at level 1
const defaultStats: StatsData = {
  // User stats
  level: 1,
  experience: 0,
  maxExperience: 60, // Starting max XP at level 1
  health: 42,
  maxHealth: 50,
  levelMessage: "",

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

// Add a function to calculate XP required for a given level
const calculateRequiredXP = (level: number): number => {
  // Base XP is 60 at level 1
  const baseXP = 60

  if (level <= 1) return baseXP

  // For each level above 1, increase by 15%
  let requiredXP = baseXP
  for (let i = 1; i < level; i++) {
    requiredXP = Math.round(requiredXP * 1.15) // 15% increase per level
  }

  return requiredXP
}

// Update the context type to include the new methods
interface StatsContextType {
  stats: StatsData
  refreshStats: () => Promise<void>
  updateDailyCompletion: (completed: number, total: number) => void
  updateHabitCompletion: (completed: number, total: number) => void
  updateRoutineCompletion: (completed: number, total: number) => void
  updateFocusSessions: (sessions: number) => void
  updateExperience: (amount: number) => void
  updateHealth: (amount: number) => void
  setLevelMessage: (message: string) => void
  clearLevelMessage: () => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

// Update the provider
export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsData>(defaultStats)
  const LEVEL_UP_BONUS = 15
  const MIN_EXPERIENCE_FOR_LEVEL = 10

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

        setStats((prev) => {
          const level = user.level || prev.level
          return {
            ...prev,
            level: level,
            experience: user.experience || prev.experience,
            maxExperience: calculateRequiredXP(level), // Calculate max XP based on level
            health: user.health || prev.health,
            coinsEarned: user.coins || prev.coinsEarned,
            gemsEarned: user.gems || prev.gemsEarned,
          }
        })
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

  // Updated function to update experience with dynamic XP requirements
  const updateExperience = (amount: number) => {
    setStats((prev) => {
      let newExperience = prev.experience + amount
      let newLevel = prev.level
      let requiredXP = prev.maxExperience

      // Check for level up
      if (newExperience >= requiredXP) {
        newLevel = prev.level + 1
        newExperience = LEVEL_UP_BONUS // Start with 15 XP after level up
        requiredXP = calculateRequiredXP(newLevel) // Calculate new XP requirement
        setLevelMessage("Level Up! 🎉")
      }

      // Check for level down (only if experience is very low and we're not at level 1)
      if (amount < 0 && newExperience < MIN_EXPERIENCE_FOR_LEVEL && prev.level > 1) {
        newLevel = prev.level - 1
        requiredXP = calculateRequiredXP(newLevel) // Calculate new XP requirement
        newExperience = Math.round(requiredXP * 0.8) // Set to 80% after level down
        setLevelMessage("Level Down! 😢")
      }

      // Save to AsyncStorage
      saveUserStats({
        level: newLevel,
        experience: newExperience,
        health: prev.health,
        coins: prev.coinsEarned,
        gems: prev.gemsEarned,
      })

      return {
        ...prev,
        level: newLevel,
        experience: newExperience,
        maxExperience: requiredXP,
      }
    })
  }

  // New function to update health
  const updateHealth = (amount: number) => {
    setStats((prev) => {
      let newHealth = Math.max(0, Math.min(prev.maxHealth, prev.health + amount))

      // Check if health reached zero
      let newLevel = prev.level
      let healthCausedLevelDown = false

      if (newHealth <= 0 && prev.level > 1) {
        newLevel = prev.level - 1
        newHealth = prev.maxHealth // Reset health to full
        setLevelMessage("Health depleted! Level Down! 😢")
        healthCausedLevelDown = true
      }

      // Save to AsyncStorage
      saveUserStats({
        level: newLevel,
        experience: prev.experience,
        health: newHealth,
        coins: prev.coinsEarned,
        gems: prev.gemsEarned,
      })

      return {
        ...prev,
        health: newHealth,
        level: newLevel,
        maxExperience: calculateRequiredXP(newLevel), // Update max XP if level changed
      }
    })
  }

  // New function to set level message
  const setLevelMessage = (message: string) => {
    setStats((prev) => ({
      ...prev,
      levelMessage: message,
    }))

    // Clear message after 3 seconds
    setTimeout(clearLevelMessage, 3000)
  }

  // New function to clear level message
  const clearLevelMessage = () => {
    setStats((prev) => ({
      ...prev,
      levelMessage: "",
    }))
  }

  // Helper function to save user stats to AsyncStorage
  const saveUserStats = async (userStats: {
    level: number
    experience: number
    health: number
    coins: number
    gems: number
  }) => {
    try {
      await AsyncStorage.setItem("userStats", JSON.stringify(userStats))
    } catch (e) {
      console.error("Failed to save user stats:", e)
    }
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
        updateExperience,
        updateHealth,
        setLevelMessage,
        clearLevelMessage,
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
