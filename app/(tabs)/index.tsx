"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import HabitItem from "../../components/HabitItem"
import ProgressBar from "../../components/ProgressBar"
import AddHabitModal from "../../components/AddHabitModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

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
}

export default function HabitsScreen() {
  const { colors, currentTheme } = useTheme()
  
  // Enhanced default habits with streak data
  const defaultHabits: EnhancedHabit[] = [
    { 
      id: 1, 
      title: "30 minutes with the word of God", 
      description: "Daily spiritual practice", 
      difficulty: "medium", 
      color: "green-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5, 6, 0]
    },
    {
      id: 2,
      title: "Read at least 20 to 30 minutes",
      description: "Build knowledge through reading",
      difficulty: "easy",
      color: "blue-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5, 6, 0]
    },
    {
      id: 3,
      title: "Wake up Time 5:30",
      description: "Early morning routine for productivity",
      difficulty: "hard",
      color: "yellow-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5]
    },
    { 
      id: 4, 
      title: "Study/Focus Time", 
      description: "Dedicated learning and productivity", 
      difficulty: "medium", 
      color: "purple-500",
      streak: 0,
      completedDates: [],
      targetDays: [1, 2, 3, 4, 5]
    },
  ]

  const { stats, updateHabitCompletion, updateExperience, updateHealth } = useStats()
  const [habits, setHabits] = useState<EnhancedHabit[]>(defaultHabits)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingHabit, setEditingHabit] = useState<EnhancedHabit | null>(null)
  const [loading, setLoading] = useState(true)

  // Get today's date string
  const getTodayString = () => new Date().toISOString().split('T')[0]

  // Calculate streak for a habit
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

  // Reset function with enhanced data
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

  // Enhanced load habits with streak calculation
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true)
        const savedData = await AsyncStorage.getItem("habitsData")

        if (savedData) {
          const habitsData: EnhancedHabit[] = JSON.parse(savedData)

          if (habitsData.length > 0) {
            // Update streaks for all habits
            const habitsWithStreaks = habitsData.map(habit => ({
              ...habit,
              streak: calculateStreak(habit.completedDates || []),
              completed: (habit.completedDates || []).includes(getTodayString())
            }))
            
            setHabits(habitsWithStreaks)
            
            const completedCount = habitsWithStreaks.filter(habit => habit.completed).length
            updateHabitCompletion(completedCount, habitsWithStreaks.length)
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

  const addHabit = async (newHabit: any) => {
    const habitToAdd: EnhancedHabit = { 
      ...newHabit, 
      id: habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1,
      streak: 0,
      completedDates: [],
      targetDays: newHabit.targetDays || [1, 2, 3, 4, 5, 6, 0]
    }
    const updatedHabits = [...habits, habitToAdd]
    setHabits(updatedHabits)

    try {
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
      updateHabitCompletion(0, updatedHabits.length)
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
    if (editingHabit) {
      const updatedHabits = habits.map((habit) =>
        habit.id === editingHabit.id ? { ...habit, ...updatedHabit } : habit
      )
      setHabits(updatedHabits)
      setEditingHabit(null)

      try {
        await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))
        const completedCount = updatedHabits.filter((habit) => habit.completed).length
        updateHabitCompletion(completedCount, updatedHabits.length)
      } catch (e) {
        console.error("Failed to save habits data:", e)
      }
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
            const updatedHabits = habits.filter((habit) => habit.id !== id)
            setHabits(updatedHabits)

            try {
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

  // Enhanced habit completion with streak tracking
  const handleHabitComplete = async (id: number) => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    const today = getTodayString()
    const wasCompletedToday = (habit.completedDates || []).includes(today)
    
    if (wasCompletedToday) {
      Alert.alert("Already Completed", "You've already completed this habit today!")
      return
    }

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

    // Calculate new streak
    const newCompletedDates = [...(habit.completedDates || []), today]
    const newStreak = calculateStreak(newCompletedDates)
    
    // Streak bonus
    if (newStreak >= 7) streakBonus = Math.floor(newStreak / 7) * 2
    if (newStreak >= 30) streakBonus += 10 // Monthly bonus

    const totalExp = expIncrease + streakBonus
    
    // Update experience and health
    updateExperience(totalExp)
    updateHealth(2)

    // Show completion feedback
    Alert.alert(
      "Great Job! 🎉",
      `+${totalExp} XP earned!\n${newStreak > 1 ? `🔥 ${newStreak} day streak!` : ""}${streakBonus > 0 ? `\n🌟 Streak bonus: +${streakBonus} XP` : ""}`,
      [{ text: "Awesome!", style: "default" }]
    )

    // Update habit with completion
    const updatedHabits = habits.map((h) => 
      h.id === id 
        ? { 
            ...h, 
            completed: true, 
            completedDates: newCompletedDates,
            streak: newStreak,
            lastCompleted: today
          } 
        : h
    )
    
    setHabits(updatedHabits)

    try {
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

    // Reset streak if failed
    const updatedHabits = habits.map((h) => 
      h.id === id 
        ? { ...h, completed: false, streak: 0 }
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

  // Calculate completion stats
  const completedToday = habits.filter(h => h.completed).length
  const totalHabits = habits.length
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-3`}>
        
        {/* Minimalist Header */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Habits</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {completedToday}/{totalHabits} completed
            </Text>
          </View>
          <TouchableOpacity 
            style={[tw`p-3 rounded-lg`, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={[tw`rounded-lg p-4 mb-6`, { backgroundColor: colors.card }]}>
          {stats.levelMessage && (
            <View style={[tw`px-3 py-2 rounded-lg mb-3`, { backgroundColor: colors.success + '20' }]}>
              <Text style={[tw`text-sm font-bold text-center`, { color: colors.success }]}>
                🎉 {stats.levelMessage}
              </Text>
            </View>
          )}

          <ProgressBar
            value={stats.health}
            max={stats.maxHealth}
            color="red-500"
            label="Health"
            showLevel={true}
            level={stats.level}
          />

          <ProgressBar 
            value={stats.experience} 
            max={stats.maxExperience} 
            color="yellow-500" 
            label="Experience" 
          />

          <View style={[tw`flex-row justify-between items-center mt-3 pt-3 border-t`, { borderColor: colors.cardSecondary }]}>
            <Text style={[tw``, { color: colors.textSecondary }]}>
              💎 {stats.gemsEarned}  🪙 {stats.coinsEarned}
            </Text>
            <Text style={[tw`font-bold`, { color: colors.accent }]}>Level {stats.level}</Text>
          </View>
        </View>

        {/* Cool Habit List */}
        <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
          {habits.length === 0 ? (
            <View style={tw`items-center py-8`}>
              <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
              <Text style={[tw`text-lg mt-3`, { color: colors.textSecondary }]}>No habits yet</Text>
              <Text style={[tw`text-center mt-1`, { color: colors.textSecondary }]}>
                Add your first habit to get started
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <View key={habit.id}>
                <HabitItem
                  id={habit.id}
                  title={habit.title}
                  color={habit.color}
                  subtext={`${habit.description}${habit.streak > 0 ? ` • 🔥 ${habit.streak} day streak` : ""}`}
                  completed={habit.completed}
                  streak={habit.streak}
                  difficulty={habit.difficulty}
                  onEdit={editHabit}
                  onDelete={deleteHabit}
                  onComplete={handleHabitComplete}
                  onFail={handleHabitFail}
                />
              </View>
            ))
          )}
        </ScrollView>

        {/* Modal */}
        {editingHabit ? (
          <AddHabitModal
            isVisible={isAddModalVisible}
            onClose={() => {
              setIsAddModalVisible(false)
              setEditingHabit(null)
            }}
            onAdd={updateHabit}
            initialValues={editingHabit}
          />
        ) : (
          <AddHabitModal 
            isVisible={isAddModalVisible} 
            onClose={() => setIsAddModalVisible(false)} 
            onAdd={addHabit} 
          />
        )}
      </View>
    </SafeAreaView>
  )
}
