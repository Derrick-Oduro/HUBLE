"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import HabitItem from "../../components/HabitItem"
import ProgressBar from "../../components/ProgressBar"
import AddHabitModal from "../../components/AddHabitModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function HabitsScreen() {
  // Default habits
  const defaultHabits = [
    { id: 1, title: "30 minutes with the word of God", description: "", difficulty: "medium", color: "green-500" },
    {
      id: 2,
      title: "Read at least 20 to 30 minutes",
      description: "Or delete it from the edit screen",
      difficulty: "easy",
      color: "blue-500",
    },
    {
      id: 3,
      title: "Wake up Time 5:30",
      description: "I am supposed to wake up 5:30 to 40",
      difficulty: "hard",
      color: "yellow-500",
    },
    { id: 4, title: "Study/Procrastinate", description: "", difficulty: "medium", color: "green-500" },
  ]

  const { stats, updateHabitCompletion, updateExperience, updateHealth } = useStats()
  const [habits, setHabits] = useState(defaultHabits)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [loading, setLoading] = useState(true)

  // Add reset function
  const resetToHabitsDefaults = async () => {
    try {
      // Save default habits to AsyncStorage
      await AsyncStorage.setItem("habitsData", JSON.stringify(defaultHabits))
      setHabits(defaultHabits)
      console.log("Reset to default habits completed")

      // Update stats context
      updateHabitCompletion(0, defaultHabits.length)
    } catch (e) {
      console.error("Failed to reset habits:", e)
    }
  }

  // Load habits from AsyncStorage
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true)
        const savedData = await AsyncStorage.getItem("habitsData")

        if (savedData) {
          const habitsData = JSON.parse(savedData)

          if (habitsData.length > 0) {
            setHabits(habitsData)

            // Update stats context with current completion
            const completedCount = habitsData.filter((habit) => habit.completed).length || 0
            updateHabitCompletion(completedCount, habitsData.length)
          } else {
            // If empty array, use default habits
            await resetToHabitsDefaults()
          }
        } else {
          // No data in AsyncStorage, use default habits
          await resetToHabitsDefaults()
        }
      } catch (e) {
        console.error("Failed to load habits:", e)
        // Use defaults if there's an error
        setHabits(defaultHabits)
        updateHabitCompletion(0, defaultHabits.length)
      } finally {
        setLoading(false)
      }
    }

    loadHabits()
  }, [])

  const addHabit = async (newHabit: any) => {
    const habitToAdd = { ...newHabit, id: habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1 }
    const updatedHabits = [...habits, habitToAdd]
    setHabits(updatedHabits)

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

      // Update stats context
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
        habit.id === editingHabit.id ? { ...updatedHabit, id: habit.id } : habit,
      )
      setHabits(updatedHabits)
      setEditingHabit(null)

      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

        // Update stats context
        const completedCount = updatedHabits.filter((habit) => habit.completed).length || 0
        updateHabitCompletion(completedCount, updatedHabits.length)
      } catch (e) {
        console.error("Failed to save habits data:", e)
      }
    }
  }

  const deleteHabit = async (id: number) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id)
    setHabits(updatedHabits)

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

      // Update stats context
      const completedCount = updatedHabits.filter((habit) => habit.completed).length || 0
      updateHabitCompletion(completedCount, updatedHabits.length)
    } catch (e) {
      console.error("Failed to save habits data:", e)
    }
  }

  const handleHabitComplete = (id: number) => {
    const habit = habits.find((h) => h.id === id)
    if (habit) {
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

      // Update experience in context
      updateExperience(expIncrease)

      // Also increase health slightly when completing habits
      updateHealth(2)

      // Mark habit as completed in state
      const updatedHabits = habits.map((h) => (h.id === id ? { ...h, completed: true } : h))
      setHabits(updatedHabits)

      // Save to AsyncStorage and update stats
      try {
        AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

        // Update stats context
        const completedCount = updatedHabits.filter((habit) => habit.completed).length || 0
        updateHabitCompletion(completedCount, updatedHabits.length)
      } catch (e) {
        console.error("Failed to save habit completion:", e)
      }
    }
  }

  const handleHabitFail = (id: number) => {
    const habit = habits.find((h) => h.id === id)
    if (habit) {
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

      // Update experience in context (negative value for decrease)
      updateExperience(expDecrease)

      // Decrease health when failing habits
      updateHealth(-5)

      // Mark habit as failed (not completed) in state
      const updatedHabits = habits.map((h) => (h.id === id ? { ...h, completed: false } : h))
      setHabits(updatedHabits)

      // Save to AsyncStorage and update stats
      try {
        AsyncStorage.setItem("habitsData", JSON.stringify(updatedHabits))

        // Update stats context
        const completedCount = updatedHabits.filter((habit) => habit.completed).length || 0
        updateHabitCompletion(completedCount, updatedHabits.length)
      } catch (e) {
        console.error("Failed to save habit failure:", e)
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Top Section */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-white text-lg font-bold`}>Habits</Text>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* User Stats */}
        <View style={tw`mb-4 bg-gray-800 p-4 rounded-xl`}>
          {stats.levelMessage && (
            <Text style={tw`text-green-400 text-sm font-bold text-center mb-2`}>{stats.levelMessage}</Text>
          )}

          {/* Health bar first, with level beside it */}
          <ProgressBar
            value={stats.health}
            max={stats.maxHealth}
            color="red-500"
            label="Health"
            showLevel={true}
            level={stats.level}
          />

          {/* Experience bar second */}
          <ProgressBar value={stats.experience} max={stats.maxExperience} color="yellow-500" label="Experience" />

          <Text style={tw`text-white mt-2`}>
            💎 {stats.gemsEarned} 🟡 {stats.coinsEarned}
          </Text>
        </View>

        {/* Habit List */}
        <ScrollView>
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              id={habit.id}
              title={habit.title}
              color={habit.color}
              subtext={habit.description}
              onEdit={editHabit}
              onDelete={deleteHabit}
              onComplete={handleHabitComplete}
              onFail={handleHabitFail}
            />
          ))}
        </ScrollView>

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
          <AddHabitModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addHabit} />
        )}
      </View>
    </SafeAreaView>
  )
}
