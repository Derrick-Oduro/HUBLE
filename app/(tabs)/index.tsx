"use client"

import React, { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Alert, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import HabitItem from "../../components/HabitItem"
import AddHabitModal from "../../components/AddHabitModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"

import { habitsAPI } from "../../lib/api"
import { maybePromptForReview } from "../../lib/reviewPrompt"
import CharacterPanel from "../../components/CharacterPanel"

// Enhanced habit interface with streak tracking
interface EnhancedHabit {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  color: string
  completed?: boolean
  streak?: number
  lastCompleted?: string
  completedDates?: string[]
  targetDays?: number[]
  dueTime?: string | null
  reminderTime?: string | null
  failedDates?: string[]
}

const DEFAULT_TARGET_DAYS = [1, 2, 3, 4, 5, 6, 0]
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const normalizeTargetDays = (days: any): number[] => {
  if (!Array.isArray(days) || days.length === 0) return [...DEFAULT_TARGET_DAYS]

  const parsed = days
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)

  if (parsed.length === 0) return [...DEFAULT_TARGET_DAYS]

  const unique = Array.from(new Set(parsed))
  return DAY_ORDER.filter((day) => unique.includes(day))
}

const parseTargetDaysValue = (value: any): number[] => {
  if (Array.isArray(value)) return normalizeTargetDays(value)

  if (typeof value === 'string') {
    try {
      return normalizeTargetDays(JSON.parse(value))
    } catch {
      return [...DEFAULT_TARGET_DAYS]
    }
  }

  return [...DEFAULT_TARGET_DAYS]
}

const parseDueTime = (value: any): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed) ? trimmed : null
}

const isPastDueTime = (dueTime: string, now: Date = new Date()): boolean => {
  const [hoursText, minutesText] = dueTime.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return false

  const dueAt = new Date(now)
  dueAt.setHours(hours, minutes, 0, 0)
  return now.getTime() >= dueAt.getTime()
}

const getFailPenalty = (difficulty: EnhancedHabit['difficulty']) => {
  if (difficulty === 'easy') return { exp: -3, health: -5 }
  if (difficulty === 'hard') return { exp: -12, health: -5 }
  return { exp: -7, health: -5 }
}

const shouldAutoFailHabit = (habit: EnhancedHabit, date = new Date()): boolean => {
  const today = date.toISOString().split('T')[0]
  const targetDays = normalizeTargetDays(habit.targetDays)
  const dueTime = parseDueTime(habit.dueTime)
  const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : []
  const failedDates = Array.isArray(habit.failedDates) ? habit.failedDates : []

  const isScheduledToday = targetDays.includes(date.getDay())
  const completedToday = Boolean(habit.completed) || completedDates.includes(today)
  const alreadyFailedToday = failedDates.includes(today)

  if (!isScheduledToday || !dueTime || completedToday || alreadyFailedToday) return false
  return isPastDueTime(dueTime, date)
}

export default function HabitsScreen() {
  const { colors, currentTheme } = useTheme()
  
  const defaultHabits: EnhancedHabit[] = [
    { 
      id: 1, 
      title: "30 minutes with the word of God", 
      description: "Daily spiritual practice", 
      difficulty: "medium", 
      color: "green-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5, 6, 0],
      dueTime: null,
      reminderTime: null,
      failedDates: [],
    },
    {
      id: 2,
      title: "Read at least 20 to 30 minutes",
      description: "Build knowledge through reading",
      difficulty: "easy",
      color: "blue-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5, 6, 0],
      dueTime: null,
      reminderTime: null,
      failedDates: [],
    },
    {
      id: 3,
      title: "Wake up Time 5:30",
      description: "Early morning routine for productivity",
      difficulty: "hard",
      color: "yellow-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5],
      dueTime: null,
      reminderTime: null,
      failedDates: [],
    },
    { 
      id: 4, 
      title: "Study/Focus Time", 
      description: "Dedicated learning and productivity", 
      difficulty: "medium", 
      color: "purple-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5],
      dueTime: null,
      reminderTime: null,
      failedDates: [],
    },
  ]

  const { stats, updateHabitCompletion, updateExperience, updateHealth } = useStats()
  const [habits, setHabits] = useState<EnhancedHabit[]>(defaultHabits)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingHabit, setEditingHabit] = useState<EnhancedHabit | null>(null)
  const [loading, setLoading] = useState(true)
  const habitsRef = useRef<EnhancedHabit[]>(defaultHabits)

  useEffect(() => {
    habitsRef.current = habits
  }, [habits])

  const getTodayString = () => new Date().toISOString().split('T')[0]

  const calculateStreak = (completedDates: string[]): number => {
    if (!completedDates || completedDates.length === 0) return 0
    
    const sortedDates = completedDates.sort().reverse()
    let streak = 0
    let currentDate = new Date()
    
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr)
      const diffTime = currentDate.getTime() - date.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak + 1 || (streak === 0 && diffDays <= 1)) {
        streak++
        currentDate = date
      } else {
        break
      }
    }
    
    return streak
  }

  const applyDeadlineFailures = async (
    sourceHabits: EnhancedHabit[],
    options: { silent?: boolean } = { silent: true }
  ) => {
    const now = new Date()
    const today = getTodayString()
    let changed = false
    let failedCount = 0
    let expPenaltyTotal = 0
    let healthPenaltyTotal = 0

    const updatedHabits = sourceHabits.map((habit) => {
      const targetDays = normalizeTargetDays(habit.targetDays)
      const dueTime = parseDueTime(habit.dueTime)
      const failedDates = Array.isArray(habit.failedDates) ? habit.failedDates : []
      const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : []
      const completedToday = Boolean(habit.completed) || completedDates.includes(today)
      const alreadyFailedToday = failedDates.includes(today)
      const isScheduledToday = targetDays.includes(now.getDay())

      if (!isScheduledToday || !dueTime || completedToday || alreadyFailedToday) {
        return {
          ...habit,
          dueTime,
          targetDays,
          failedDates,
        }
      }

      if (!isPastDueTime(dueTime, now)) {
        return {
          ...habit,
          dueTime,
          targetDays,
          failedDates,
        }
      }

      changed = true
      failedCount += 1
      const penalties = getFailPenalty(habit.difficulty)
      expPenaltyTotal += penalties.exp
      healthPenaltyTotal += penalties.health

      return {
        ...habit,
        dueTime,
        targetDays,
        failedDates: [...failedDates, today],
        completed: false,
        streak: 0,
      }
    })

    if (!changed) {
      return sourceHabits
    }

    setHabits(updatedHabits)
    await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

    const completedCount = updatedHabits.filter((habit) => habit.completed).length
    updateHabitCompletion(completedCount, updatedHabits.length)

    if (expPenaltyTotal !== 0) updateExperience(expPenaltyTotal)
    if (healthPenaltyTotal !== 0) updateHealth(healthPenaltyTotal)

    if (!options.silent && failedCount > 0) {
      Alert.alert(
        "Deadline Missed",
        `${failedCount} habit${failedCount > 1 ? "s were" : " was"} marked failed because the time limit passed.`
      )
    }

    return updatedHabits
  }

  const resetToHabitsDefaults = async () => {
    try {
      await AsyncStorage.setItem("habitsData", JSON.stringify(defaultHabits))
      setHabits(defaultHabits)
      console.log("Reset to default habits completed")
      updateHabitCompletion(0, defaultHabits.length)
    } catch (e) {
      console.error("Failed to reset habits:", e)
    }
  }

  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true)

        const localSavedData = await AsyncStorage.getItem("habitsData")
        const localHabits = localSavedData ? JSON.parse(localSavedData) : []
        const localHabitsById = new Map<number, any>()
        if (Array.isArray(localHabits)) {
          localHabits.forEach((habit) => {
            if (habit?.id !== undefined) {
              localHabitsById.set(Number(habit.id), habit)
            }
          })
        }
        
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')
        
        if (token && isGuest !== 'true') {
          console.log('🔄 Loading habits from backend...')
          try {
            const response = await habitsAPI.getHabits()
            
            if (response.success && response.habits) {
              const convertedHabits: EnhancedHabit[] = response.habits.map((backendHabit: any) => {
                const localHabit = localHabitsById.get(Number(backendHabit.id)) || {}

                return {
                id: backendHabit.id,
                title: backendHabit.title,
                description: backendHabit.description,
                difficulty: backendHabit.difficulty,
                color: backendHabit.color,
                completed: backendHabit.is_completed_today,
                streak: backendHabit.streak || 0,
                completedDates: Array.isArray(localHabit.completedDates) ? localHabit.completedDates : [],
                targetDays: parseTargetDaysValue(backendHabit.target_days ?? localHabit.targetDays),
                dueTime: parseDueTime(backendHabit.due_time ?? localHabit.dueTime),
                reminderTime: parseDueTime(backendHabit.reminder_time ?? localHabit.reminderTime),
                failedDates: Array.isArray(localHabit.failedDates) ? localHabit.failedDates : [],
              }
              })
              
              setHabits(convertedHabits)
              
              await AsyncStorage.setItem("habitsData", JSON.stringify(convertedHabits))
              
              const completedCount = convertedHabits.filter((h: any) => h.completed).length
              updateHabitCompletion(completedCount, convertedHabits.length)

              await applyDeadlineFailures(convertedHabits)
              
              console.log('✅ Habits loaded from backend:', convertedHabits)
              return
            }
          } catch (error) {
            console.error('❌ Backend failed, loading from local:', error)
          }
        }

        console.log('📱 Loading habits from local storage...')
        const savedData = localSavedData

        if (savedData) {
          const habitsData: EnhancedHabit[] = JSON.parse(savedData)

          if (habitsData.length > 0) {
            const habitsWithStreaks = habitsData.map(habit => ({
              ...habit,
              targetDays: normalizeTargetDays(habit.targetDays),
              dueTime: parseDueTime(habit.dueTime),
              reminderTime: parseDueTime(habit.reminderTime),
              failedDates: Array.isArray(habit.failedDates) ? habit.failedDates : [],
              streak: calculateStreak(habit.completedDates || []),
              completed:
                (habit.completedDates || []).includes(getTodayString()) &&
                !(Array.isArray(habit.failedDates) ? habit.failedDates : []).includes(getTodayString()),
            }))
            
            setHabits(habitsWithStreaks)
            
            const completedCount = habitsWithStreaks.filter(habit => habit.completed).length
            updateHabitCompletion(completedCount, habitsWithStreaks.length)

            await applyDeadlineFailures(habitsWithStreaks)
          } else {
            await resetToHabitsDefaults()
          }
        } else {
          await resetToHabitsDefaults()
        }
      } catch (e) {
        console.error("Failed to load habits:", e)
        setHabits(defaultHabits)
        updateHabitCompletion(0, defaultHabits.length)
      } finally {
        setLoading(false)
      }
    }

    loadHabits()
  }, [])

  useEffect(() => {
    if (loading) return

    void applyDeadlineFailures(habitsRef.current)

    const timer = setInterval(() => {
      void applyDeadlineFailures(habitsRef.current)
    }, 60 * 1000)

    return () => clearInterval(timer)
  }, [loading])

  const addHabit = async (newHabit: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('➕ Adding habit to backend:', newHabit)
        
        try {
          const response = await habitsAPI.createHabit(newHabit)
          
          if (response.success) {
            const newBackendHabit: EnhancedHabit = {
              id: response.habit.id,
              title: response.habit.title,
              description: response.habit.description,
              difficulty: response.habit.difficulty,
              color: response.habit.color,
              completed: false,
              streak: 0,
              completedDates: [],
              targetDays: parseTargetDaysValue(response.habit.target_days ?? newHabit.targetDays),
              dueTime: parseDueTime(response.habit.due_time ?? newHabit.dueTime),
              reminderTime: parseDueTime(response.habit.reminder_time ?? newHabit.reminderTime),
              failedDates: [],
            }
            
            const updatedHabits = [...habits, newBackendHabit]
            setHabits(updatedHabits)
            
            await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
            const completedCount = updatedHabits.filter((habit) => habit.completed).length
            updateHabitCompletion(completedCount, updatedHabits.length)

            await applyDeadlineFailures(updatedHabits)
            
            console.log('✅ Habit added to backend successfully')
            return
          }
        } catch (error) {
          console.error('❌ Failed to add to backend, saving locally:', error)
        }
      }

      console.log('📱 Adding habit locally:', newHabit)
      const habitToAdd: EnhancedHabit = { 
        ...newHabit, 
        id: habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1,
        streak: 0,
        completedDates: [],
        targetDays: normalizeTargetDays(newHabit.targetDays || [1, 2, 3, 4, 5, 6, 0]),
        dueTime: parseDueTime(newHabit.dueTime),
        reminderTime: parseDueTime(newHabit.reminderTime),
        failedDates: [],
      }
      const updatedHabits = [...habits, habitToAdd]
      setHabits(updatedHabits)

      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
      const completedCount = updatedHabits.filter((habit) => habit.completed).length
      updateHabitCompletion(completedCount, updatedHabits.length)

      await applyDeadlineFailures(updatedHabits)
    } catch (e) {
      console.error("Failed to save habits data:", e)
    }
  }

  const editHabit = (id: number) => {
    const habitToEdit = habits.find((habit) => habit.id === id)
    if (habitToEdit) {
      setEditingHabit(habitToEdit)
      setIsAddModalVisible(true)
    }
  }

  const updateHabit = async (updatedHabit: any) => {
    if (!editingHabit) return

    const mergedUpdate = {
      title: updatedHabit.title,
      description: updatedHabit.description,
      difficulty: updatedHabit.difficulty,
      color: updatedHabit.color,
      targetDays: normalizeTargetDays(updatedHabit.targetDays ?? editingHabit.targetDays),
      dueTime: parseDueTime(updatedHabit.dueTime),
      reminderTime: parseDueTime(updatedHabit.reminderTime),
    }

    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        try {
          const response = await habitsAPI.updateHabit(editingHabit.id, mergedUpdate)
          if (response.success && response.habit) {
            const updatedHabits = habits.map((habit) => {
              if (habit.id !== editingHabit.id) return habit

              return {
                ...habit,
                title: response.habit.title,
                description: response.habit.description,
                difficulty: response.habit.difficulty,
                color: response.habit.color,
                targetDays: parseTargetDaysValue(response.habit.target_days ?? mergedUpdate.targetDays),
                dueTime: parseDueTime(response.habit.due_time ?? mergedUpdate.dueTime),
                reminderTime: parseDueTime(response.habit.reminder_time ?? mergedUpdate.reminderTime),
              }
            })

            setHabits(updatedHabits)
            await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

            const completedCount = updatedHabits.filter((habit) => habit.completed).length
            updateHabitCompletion(completedCount, updatedHabits.length)

            await applyDeadlineFailures(updatedHabits)
            setEditingHabit(null)
            return
          }
        } catch (error) {
          console.error('❌ Failed to update on backend, updating locally:', error)
        }
      }

      const updatedHabits = habits.map((habit) => {
        if (habit.id !== editingHabit.id) return habit

        return {
          ...habit,
          ...mergedUpdate,
        }
      })

      setHabits(updatedHabits)
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

      const completedCount = updatedHabits.filter((habit) => habit.completed).length
      updateHabitCompletion(completedCount, updatedHabits.length)

      await applyDeadlineFailures(updatedHabits)
    } catch (e) {
      console.error("Failed to save habits data:", e)
    } finally {
      setEditingHabit(null)
    }
  }

  const deleteHabit = async (id: number) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This will remove all progress data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken')
              const isGuest = await AsyncStorage.getItem('isGuest')

              if (token && isGuest !== 'true') {
                console.log('🗑️ Deleting habit from backend:', id)
                
                try {
                  const response = await habitsAPI.deleteHabit(id)
                  
                  if (response.success) {
                    console.log('✅ Habit deleted from backend successfully')
                  }
                } catch (error) {
                  console.error('❌ Failed to delete from backend:', error)
                }
              }

              const updatedHabits = habits.filter((habit) => habit.id !== id)
              setHabits(updatedHabits)

              await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
              const completedCount = updatedHabits.filter((habit) => habit.completed).length
              updateHabitCompletion(completedCount, updatedHabits.length)
            } catch (e) {
              console.error("Failed to save habits data:", e)
            }
          }
        }
      ]
    )
  }

  const handleHabitComplete = async (id: number) => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    const now = new Date()
    const today = getTodayString()
    const targetDays = normalizeTargetDays(habit.targetDays)
    const dueTime = parseDueTime(habit.dueTime)
    const failedDates = Array.isArray(habit.failedDates) ? habit.failedDates : []
    const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : []

    if (!targetDays.includes(now.getDay())) {
      Alert.alert(
        "Not Scheduled Today",
        "This habit is not active for today based on its selected days."
      )
      return
    }

    if (failedDates.includes(today)) {
      Alert.alert("Already Failed", "This habit already failed for today.")
      return
    }

    if (shouldAutoFailHabit(habit, now)) {
      await applyDeadlineFailures(habits, { silent: false })
      return
    }

    const wasCompletedToday = (habit.completedDates || []).includes(today)
    
    if (wasCompletedToday || habit.completed) {
      Alert.alert("Already Completed", "You've already completed this habit today!")
      return
    }

    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('✅ Completing habit on backend:', id)
        
        try {
          const response = await habitsAPI.completeHabit(id)
          
          if (response.success) {
            const updatedHabits = habits.map((h) => 
              h.id === id 
                ? { 
                    ...h, 
                    completed: true, 
                    streak: response.habit?.streak || (h.streak || 0) + 1,
                    completedDates: Array.from(new Set([...(h.completedDates || []), today])),
                    failedDates: (h.failedDates || []).filter((date) => date !== today),
                    dueTime: parseDueTime(response.habit?.due_time ?? h.dueTime ?? dueTime),
                    reminderTime: parseDueTime(response.habit?.reminder_time ?? h.reminderTime),
                    targetDays: parseTargetDaysValue(response.habit?.target_days ?? h.targetDays),
                  } 
                : h
            )
            
            setHabits(updatedHabits)
            await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
            
            const completedCount = updatedHabits.filter((habit) => habit.completed).length
            updateHabitCompletion(completedCount, updatedHabits.length)

            let expIncrease = 0
            switch (habit.difficulty) {
              case "easy":
                expIncrease = 5
                break
              case "medium":
                expIncrease = 10
                break
              case "hard":
                expIncrease = 15
                break
              default:
                expIncrease = 5
            }

            updateExperience(expIncrease)
            updateHealth(2)

            Alert.alert(
              "Great Job!",
              `${response.message || 'Habit completed!'}\n+${expIncrease} XP earned!`,
              [{ text: "Awesome!", style: "default" }]
            )

            await maybePromptForReview(response.habit?.streak || 0)
            
            console.log('✅ Habit completed on backend successfully')
            return
          }
        } catch (error) {
          console.error('❌ Failed to complete on backend, updating locally:', error)
        }
      }

      console.log('📱 Completing habit locally:', id)
      
      let expIncrease = 0
      let streakBonus = 0
      
      switch (habit.difficulty) {
        case "easy":
          expIncrease = 5
          break
        case "medium":
          expIncrease = 10
          break
        case "hard":
          expIncrease = 15
          break
        default:
          expIncrease = 5
      }

      const newCompletedDates = Array.from(new Set([...completedDates, today]))
      const newStreak = calculateStreak(newCompletedDates)
      
      if (newStreak >= 7) streakBonus = Math.floor(newStreak / 7) * 2
      if (newStreak >= 30) streakBonus += 10

      const totalExp = expIncrease + streakBonus
      
      updateExperience(totalExp)
      updateHealth(2)

      Alert.alert(
        "Great Job!",
        `+${totalExp} XP earned!\n${newStreak > 1 ? `${newStreak} day streak!` : ""}${streakBonus > 0 ? `\nStreak bonus: +${streakBonus} XP` : ""}`,
        [{ text: "Awesome!", style: "default" }]
      )

      await maybePromptForReview(newStreak)

      const updatedHabits = habits.map((h) => 
        h.id === id 
          ? { 
              ...h, 
              completed: true, 
              completedDates: newCompletedDates,
              failedDates: failedDates.filter((date) => date !== today),
              targetDays,
              dueTime,
              streak: newStreak,
              lastCompleted: today,
            } 
          : h
      )
      
      setHabits(updatedHabits)
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
      const completedCount = updatedHabits.filter((habit) => habit.completed).length
      updateHabitCompletion(completedCount, updatedHabits.length)
      
    } catch (e) {
      console.error("Failed to save habit completion:", e)
    }
  }

  const handleHabitFail = async (id: number) => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    const today = getTodayString()
    const failedDates = Array.isArray(habit.failedDates) ? habit.failedDates : []

    if (failedDates.includes(today)) {
      Alert.alert("Already Failed", "This habit is already marked failed for today.")
      return
    }

    let expDecrease = 0
    switch (habit.difficulty) {
      case "easy":
        expDecrease = -3
        break
      case "medium":
        expDecrease = -7
        break
      case "hard":
        expDecrease = -12
        break
      default:
        expDecrease = -3
    }

    Alert.alert(
      "Habit Failed",
      `Don't give up! Tomorrow is a new day.\n${expDecrease} XP and -5 Health`,
      [{ text: "I'll do better", style: "default" }]
    )

    updateExperience(expDecrease)
    updateHealth(-5)

    const updatedHabits = habits.map((h) => 
      h.id === id 
        ? {
            ...h,
            completed: false,
            streak: 0,
            failedDates: Array.from(new Set([...(h.failedDates || []), today])),
            completedDates: (h.completedDates || []).filter((date) => date !== today),
          }
        : h
    )
    
    setHabits(updatedHabits)

    try {
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
      const completedCount = updatedHabits.filter((habit) => habit.completed).length
      updateHabitCompletion(completedCount, updatedHabits.length)
    } catch (e) {
      console.error("Failed to save habit failure:", e)
    }
  }

  const completedToday = habits.filter(h => h.completed).length
  const totalHabits = habits.length

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      
      <FlatList
        style={tw`flex-1 px-2 pt-2`}
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
        ListHeaderComponent={() => (
          <View>
            {/* Character Panel Component - Keep as is */}
            <CharacterPanel 
              completedCount={completedToday}
              totalCount={totalHabits}
              taskType="habits"
            />

            {/* Level Up Message */}
            {stats.levelMessage && (
              <View style={[
                tw`px-3 py-2 rounded-lg mb-3`,
                { backgroundColor: colors.success + '20' }
              ]}>
                <Text style={[tw`text-sm font-medium text-center`, { color: colors.success }]}>
                  {stats.levelMessage}
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={tw`items-center py-8`}>
            <Ionicons name="leaf-outline" size={40} color={colors.textSecondary} />
            <Text style={[tw`text-sm font-medium mt-3`, { color: colors.text }]}>No habits yet</Text>
            <Text style={[tw`text-sm text-center mt-1`, { color: colors.textSecondary }]}>
              Add your first habit to get started
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <HabitItem
            id={item.id}
            title={item.title}
            color={item.color}
            subtext={`${item.description}${(item.streak || 0) > 0 ? ` \u2022 ${item.streak} day streak` : ""}`}
            completed={item.completed}
            streak={item.streak}
            onEdit={editHabit}
            onComplete={handleHabitComplete}
            onFail={handleHabitFail}
          />
        )}
      />

      {/* Floating Add Button - Bottom Center */}
      <View style={[
        tw`absolute w-full`, 
        { 
          bottom: 25, 
          left: 0, 
          right: 0,
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <TouchableOpacity 
          style={[
            tw`w-14 h-14 rounded-full items-center justify-center`,
            {
              backgroundColor: colors.accent,
              borderWidth: 3,
              borderColor: colors.background,
              marginLeft: 2,
            }
          ]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {editingHabit ? (
        <AddHabitModal
          isVisible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false)
            setEditingHabit(null)
          }}
          onAdd={updateHabit}
          initialValues={editingHabit}
          onDelete={(habitId) => {
            setIsAddModalVisible(false)
            setEditingHabit(null)
            deleteHabit(habitId)
          }}
        />
      ) : (
        <AddHabitModal 
          isVisible={isAddModalVisible} 
          onClose={() => setIsAddModalVisible(false)} 
          onAdd={addHabit} 
        />
      )}
    </SafeAreaView>
  )
}

