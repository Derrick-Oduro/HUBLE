"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AddDailyModal from "../../components/AddDailyModal"
import ProgressBar from "../../components/ProgressBar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Dailies() {
  // Default dailies that will be restored when the app is reset
  const defaultDailies = [
    { id: "1", name: "Morning Walk", completed: false },
    { id: "2", name: "Read 10 pages", completed: false },
  ]

  const { stats, updateDailyCompletion, updateExperience, updateHealth } = useStats()
  const [tasks, setTasks] = useState(defaultDailies)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add reset function
  const resetToDailiesDefaults = async () => {
    try {
      // Save default dailies to AsyncStorage
      await AsyncStorage.setItem("dailiesData", JSON.stringify(defaultDailies))
      setTasks(defaultDailies)
      console.log("Reset to default dailies completed")

      // Update stats context
      updateDailyCompletion(0, defaultDailies.length)
    } catch (e) {
      console.error("Failed to reset dailies:", e)
    }
  }

  // Load dailies from AsyncStorage
  useEffect(() => {
    const loadDailies = async () => {
      try {
        setLoading(true)
        const savedData = await AsyncStorage.getItem("dailiesData")

        if (savedData) {
          const dailiesData = JSON.parse(savedData)

          if (dailiesData.length > 0) {
            setTasks(dailiesData)

            // Update stats context with current completion
            const completedCount = dailiesData.filter((task) => task.completed).length
            updateDailyCompletion(completedCount, dailiesData.length)
          } else {
            // If empty array, use default dailies
            await resetToDailiesDefaults()
          }
        } else {
          // No data in AsyncStorage, use default dailies
          await resetToDailiesDefaults()
        }
      } catch (e) {
        console.error("Failed to load dailies:", e)
        // Use defaults if there's an error
        setTasks(defaultDailies)
        updateDailyCompletion(0, defaultDailies.length)
      } finally {
        setLoading(false)
      }
    }

    loadDailies()
  }, [])

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    const wasCompleted = task?.completed || false

    // Update task completion status
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))

    setTasks(updatedTasks)

    // Save the updated tasks to AsyncStorage
    try {
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedTasks))

      // Update stats context with new completion count
      const completedCount = updatedTasks.filter((task) => task.completed).length
      updateDailyCompletion(completedCount, updatedTasks.length)
    } catch (e) {
      console.error("Failed to save dailies data:", e)
    }

    // Update experience when task is completed/uncompleted
    if (!wasCompleted) {
      // Task is being completed - increase experience
      updateExperience(10)

      // Also increase health slightly when completing tasks
      updateHealth(2)
    } else {
      // Task is being uncompleted - decrease experience
      updateExperience(-10)

      // Decrease health when uncompleting tasks
      updateHealth(-3)
    }
  }

  const addTask = async (taskName: string) => {
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)

    // Save the updated tasks to AsyncStorage
    try {
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedTasks))

      // Update stats context with new task count
      const completedCount = updatedTasks.filter((task) => task.completed).length
      updateDailyCompletion(completedCount, updatedTasks.length)
    } catch (e) {
      console.error("Failed to save dailies data:", e)
    }
  }

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)

    // If deleting a completed task, decrease experience
    if (task?.completed) {
      // Decrease experience
      updateExperience(-10)

      // Decrease health
      updateHealth(-5)
    } else {
      // If deleting any task, decrease health slightly
      updateHealth(-2)
    }

    // Remove the task
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)

    // Save the updated tasks to AsyncStorage
    try {
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedTasks))

      // Update stats context with new task count
      const completedCount = updatedTasks.filter((task) => task.completed).length
      updateDailyCompletion(completedCount, updatedTasks.length)
    } catch (e) {
      console.error("Failed to save dailies data:", e)
    }
  }

  // Calculate completion percentage for display
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={tw`text-white text-2xl font-bold`}>Dailies</Text>
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-full p-2 shadow-lg`}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
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

        {/* Daily Progress */}
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-4 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white text-lg font-bold`}>Daily Progress</Text>
            <Text style={tw`text-white text-lg font-medium`}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={tw`h-2.5 bg-gray-700 rounded-full overflow-hidden mb-1`}>
            <View style={[tw`h-full rounded-full bg-green-500`, { width: `${completionPercentage}%` }]} />
          </View>

          <Text style={tw`text-gray-400 text-sm`}>
            {completedTasks === totalTasks
              ? "All tasks completed! Great job!"
              : `${totalTasks - completedTasks} tasks remaining`}
          </Text>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleTask(item.id)}
              style={tw`flex-row items-center justify-between bg-gray-800 p-4 rounded-lg mb-2`}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name={item.completed ? "checkbox" : "square-outline"}
                  size={24}
                  color={item.completed ? "#10B981" : "#9CA3AF"}
                />
                <Text
                  style={tw`text-lg font-medium ml-2 ${item.completed ? "line-through text-gray-400" : "text-white"}`}
                >
                  {item.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  deleteTask(item.id)
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
        <AddDailyModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addTask} />
      </View>
    </SafeAreaView>
  )
}
