"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface StatsData {
  // Core gamification
  level: number
  experience: number
  maxExperience: number
  health: number
  maxHealth: number
  
  // Currency & rewards
  gemsEarned: number
  coinsEarned: number
  
  // Habit tracking
  habitsCompleted: number
  totalHabits: number
  currentStreak: number
  longestStreak: number
  
  // Daily tasks
  dailiesCompleted: number
  totalDailies: number
  
  // Routine tracking - ADD THIS
  routinesCompleted: number
  totalRoutines: number
  
  // Timer/Focus
  focusSessionsToday: number
  totalFocusTime: number // in minutes
  
  // Social features (for future)
  friendsCount: number
  partiesJoined: number
  
  // Achievements
  totalAchievements: number
  unlockedAchievements: string[]
  
  // Weekly stats
  weeklyCompletionRate: number
  
  // Level up message
  levelMessage?: string
}

interface StatsContextType {
  stats: StatsData
  // Core actions
  updateExperience: (amount: number) => void
  updateHealth: (amount: number) => void
  updateLevel: () => void
  
  // Feature-specific updates
  updateHabitCompletion: (completed: number, total: number) => void
  updateDailyCompletion: (completed: number, total: number) => void
  updateRoutineCompletion: (completed: number, total: number) => void // ADD THIS
  updateFocusSessions: (sessions: number) => void
  updateFocusTime: (minutes: number) => void
  
  // Rewards
  addGems: (amount: number) => void
  addCoins: (amount: number) => void
  
  // Achievements
  unlockAchievement: (achievementId: string) => void
  
  // Reset functions
  resetStats: () => void
  loadStats: () => void
}

const defaultStats: StatsData = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  health: 100,
  maxHealth: 100,
  gemsEarned: 0,
  coinsEarned: 0,
  habitsCompleted: 0,
  totalHabits: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailiesCompleted: 0,
  totalDailies: 0,
  routinesCompleted: 0, // ADD THIS
  totalRoutines: 0, // ADD THIS
  focusSessionsToday: 0,
  totalFocusTime: 0,
  friendsCount: 0,
  partiesJoined: 0,
  totalAchievements: 0,
  unlockedAchievements: [],
  weeklyCompletionRate: 0,
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<StatsData>(defaultStats)

  // Load stats on app start
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem("userStats")
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats)
        setStats({ ...defaultStats, ...parsedStats })
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const saveStats = async (newStats: StatsData) => {
    try {
      await AsyncStorage.setItem("userStats", JSON.stringify(newStats))
    } catch (error) {
      console.error("Failed to save stats:", error)
    }
  }

  const updateExperience = (amount: number) => {
    setStats(prevStats => {
      const newExperience = Math.max(0, prevStats.experience + amount)
      const newStats = { ...prevStats, experience: newExperience }
      
      // Check for level up
      if (newExperience >= prevStats.maxExperience && amount > 0) {
        newStats.level += 1
        newStats.experience = newExperience - prevStats.maxExperience
        newStats.maxExperience = Math.floor(prevStats.maxExperience * 1.2) // 20% increase
        newStats.levelMessage = `🎉 Level Up! You're now level ${newStats.level}!`
        newStats.gemsEarned += 10 // Level up bonus
        newStats.coinsEarned += 50
        
        // Clear level message after 5 seconds
        setTimeout(() => {
          setStats(current => ({ ...current, levelMessage: undefined }))
        }, 5000)
      }
      
      saveStats(newStats)
      return newStats
    })
  }

  const updateHealth = (amount: number) => {
    setStats(prevStats => {
      const newHealth = Math.max(0, Math.min(prevStats.maxHealth, prevStats.health + amount))
      const newStats = { ...prevStats, health: newHealth }
      saveStats(newStats)
      return newStats
    })
  }

  const updateLevel = () => {
    setStats(prevStats => {
      const newStats = { ...prevStats, level: prevStats.level + 1 }
      saveStats(newStats)
      return newStats
    })
  }

  const updateHabitCompletion = (completed: number, total: number) => {
    setStats(prevStats => {
      const completionRate = total > 0 ? (completed / total) * 100 : 0
      const newStats = {
        ...prevStats,
        habitsCompleted: completed,
        totalHabits: total,
        weeklyCompletionRate: completionRate
      }
      saveStats(newStats)
      return newStats
    })
  }

  const updateDailyCompletion = (completed: number, total: number) => {
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        dailiesCompleted: completed,
        totalDailies: total
      }
      saveStats(newStats)
      return newStats
    })
  }

  // ADD THIS NEW FUNCTION
  const updateRoutineCompletion = (completed: number, total: number) => {
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        routinesCompleted: completed,
        totalRoutines: total
      }
      saveStats(newStats)
      return newStats
    })
  }

  const updateFocusSessions = (sessions: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, focusSessionsToday: sessions }
      saveStats(newStats)
      return newStats
    })
  }

  const updateFocusTime = (minutes: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, totalFocusTime: prevStats.totalFocusTime + minutes }
      saveStats(newStats)
      return newStats
    })
  }

  const addGems = (amount: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, gemsEarned: prevStats.gemsEarned + amount }
      saveStats(newStats)
      return newStats
    })
  }

  const addCoins = (amount: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, coinsEarned: prevStats.coinsEarned + amount }
      saveStats(newStats)
      return newStats
    })
  }

  const unlockAchievement = (achievementId: string) => {
    setStats(prevStats => {
      if (!prevStats.unlockedAchievements.includes(achievementId)) {
        const newStats = {
          ...prevStats,
          unlockedAchievements: [...prevStats.unlockedAchievements, achievementId],
          totalAchievements: prevStats.totalAchievements + 1,
          gemsEarned: prevStats.gemsEarned + 5, // Achievement bonus
          coinsEarned: prevStats.coinsEarned + 25
        }
        saveStats(newStats)
        return newStats
      }
      return prevStats
    })
  }

  const resetStats = async () => {
    setStats(defaultStats)
    await AsyncStorage.removeItem("userStats")
  }

  const value: StatsContextType = {
    stats,
    updateExperience,
    updateHealth,
    updateLevel,
    updateHabitCompletion,
    updateDailyCompletion,
    updateRoutineCompletion, // ADD THIS
    updateFocusSessions,
    updateFocusTime,
    addGems,
    addCoins,
    unlockAchievement,
    resetStats,
    loadStats,
  }

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export const useStats = () => {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider")
  }
  return context
}
