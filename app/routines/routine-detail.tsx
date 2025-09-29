"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import tw from "../../lib/tailwind"
import AddTaskModal from "../../components/AddTaskModal"
import EditTaskModal from "../../components/EditTaskModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

export default function RoutineDetail() {
  const { colors, currentTheme } = useTheme()
  const { id } = useLocalSearchParams()
  const { updateExperience, addCoins } = useStats()
  const router = useRouter()
  
  const [routine, setRoutine] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false)
  const [isEditTaskModalVisible, setIsEditTaskModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadRoutineData = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routineData = routinesData[id]
        
        if (routineData) {
          setRoutine(routineData)
          setTasks(routineData.tasks || [])
        }
      }
    } catch (e) {
      console.error("Failed to load routine data:", e)
      Alert.alert("Error", "Failed to load routine data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRoutineData()
  }, [loadRoutineData])

  useFocusEffect(
    useCallback(() => {
      loadRoutineData()
    }, [loadRoutineData])
  )

  const addTask = async (taskName: string) => {
    if (!taskName.trim()) {
      Alert.alert("Error", "Task name cannot be empty")
      return
    }

    const newTask = {
      id: Date.now().toString(),
      name: taskName.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)

    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        if (routinesData[id]) {
          routinesData[id].tasks = updatedTasks
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        }
      }
    } catch (e) {
      console.error("Failed to save task:", e)
      Alert.alert("Error", "Failed to save task. Please try again.")
    }
  }

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const wasCompleted = task.completed
        const newCompleted = !wasCompleted
        
        // Reward for completing task (only when checking off)
        if (newCompleted && !wasCompleted) {
          updateExperience(10)
          addCoins(5)
          
          // Optional: Show satisfying feedback
          Alert.alert(
            "Task Completed! ✅", 
            "+10 XP and +5 Coins earned!", 
            [{ text: "Nice!", style: "default" }],
            { duration: 2000 }
          )
        }
        
        return { ...task, completed: newCompleted }
      }
      return task
    })

    setTasks(updatedTasks)

    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        if (routinesData[id]) {
          routinesData[id].tasks = updatedTasks
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        }
      }
    } catch (e) {
      console.error("Failed to update task:", e)
      Alert.alert("Error", "Failed to update task. Please try again.")
    }
  }

  const editTask = (task) => {
    setEditingTask(task)
    setIsEditTaskModalVisible(true)
  }

  const saveEditedTask = async (editedTask) => {
    if (!editedTask.name.trim()) {
      Alert.alert("Error", "Task name cannot be empty")
      return
    }

    const updatedTasks = tasks.map(task => 
      task.id === editedTask.id ? { ...task, name: editedTask.name.trim() } : task
    )
    setTasks(updatedTasks)
    setEditingTask(null)

    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        if (routinesData[id]) {
          routinesData[id].tasks = updatedTasks
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        }
      }
    } catch (e) {
      console.error("Failed to update task:", e)
      Alert.alert("Error", "Failed to update task. Please try again.")
    }
  }

  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId)
    
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskToDelete?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId)
            setTasks(updatedTasks)

            try {
              const savedData = await AsyncStorage.getItem("routinesData")
              if (savedData) {
                const routinesData = JSON.parse(savedData)
                if (routinesData[id]) {
                  routinesData[id].tasks = updatedTasks
                  await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
                }
              }
            } catch (e) {
              console.error("Failed to delete task:", e)
              Alert.alert("Error", "Failed to delete task. Please try again.")
            }
          }
        }
      ]
    )
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4 text-base`, { color: colors.textSecondary }]}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!routine) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
        <View style={tw`flex-1 justify-center items-center px-5`}>
          <Ionicons name="sad-outline" size={64} color={colors.textSecondary} style={tw`mb-4`} />
          <Text style={[tw`text-xl font-bold mb-2`, { color: colors.text }]}>Routine not found</Text>
          <Text style={[tw`text-center mb-6`, { color: colors.textSecondary }]}>
            The routine you're looking for doesn't exist or has been deleted.
          </Text>
          <TouchableOpacity
            style={[
              tw`px-6 py-3 rounded-xl`,
              {
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }
            ]}
            onPress={() => router.back()}
          >
            <Text style={tw`text-white font-bold`}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      
      {/* Enhanced Header */}
      <View style={[tw`flex-row items-center justify-between px-5 py-4 border-b`, { borderColor: colors.cardSecondary }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={tw`p-2 -ml-2`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={tw`flex-row items-center flex-1 ml-3`}>
          <View
            style={[
              tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
              { 
                backgroundColor: colors.accent + '20', 
                borderWidth: 1, 
                borderColor: colors.accent + '40' 
              }
            ]}
          >
            <Ionicons name={routine.icon || "list-outline"} size={20} color={colors.accent} />
          </View>
          <Text style={[tw`text-lg font-bold flex-1`, { color: colors.text }]} numberOfLines={1}>
            {routine.title}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            tw`p-3 rounded-xl`,
            {
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}
          onPress={() => setIsAddTaskModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-5 pt-4`} showsVerticalScrollIndicator={false}>
        {/* Enhanced Routine Info Card */}
        <View style={[
          tw`rounded-2xl p-5 mb-6`,
          {
            backgroundColor: colors.card,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}>
          {routine.description && (
            <Text style={[tw`text-base mb-4`, { color: colors.textSecondary }]}>
              {routine.description}
            </Text>
          )}
          
          {/* Enhanced Progress Stats */}
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View>
              <Text style={[tw`font-bold text-lg`, { color: colors.text }]}>
                {completedTasks}/{totalTasks} tasks
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>completed today</Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={[tw`font-bold text-xl`, { color: colors.accent }]}>
                {completionPercentage}%
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>complete</Text>
            </View>
          </View>
          
          {/* Enhanced Progress Bar */}
          <View style={[tw`h-3 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
            <View
              style={[
                tw`h-full rounded-full transition-all duration-300`,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage === 100 ? colors.success : colors.accent,
                  shadowColor: completionPercentage === 100 ? colors.success : colors.accent,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]}
            />
          </View>
        </View>

        {/* Enhanced Tasks List */}
        {tasks.length === 0 ? (
          <View style={[
            tw`rounded-2xl p-8 items-center`,
            {
              backgroundColor: colors.card,
              shadowColor: colors.cardSecondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}>
            <View style={[
              tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.accent + '20' }
            ]}>
              <Ionicons name="list-outline" size={40} color={colors.accent} />
            </View>
            <Text style={[tw`text-xl font-bold mb-2`, { color: colors.text }]}>No tasks yet</Text>
            <Text style={[tw`text-center mb-6 leading-6`, { color: colors.textSecondary }]}>
              Add your first task to get started with this routine and start earning XP!
            </Text>
            <TouchableOpacity
              style={[
                tw`px-8 py-4 rounded-xl`,
                {
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
              onPress={() => setIsAddTaskModalVisible(true)}
            >
              <Text style={tw`text-white font-bold text-base`}>Add First Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={tw`mb-6`}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Tasks ({tasks.length})
            </Text>
            {tasks.map((task, index) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  tw`rounded-2xl p-4 mb-3 flex-row items-center`,
                  {
                    backgroundColor: colors.card,
                    opacity: task.completed ? 0.8 : 1,
                    shadowColor: task.completed ? colors.success : colors.cardSecondary,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }
                ]}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.7}
              >
                {/* Enhanced Checkbox */}
                <View
                  style={[
                    tw`w-7 h-7 rounded-full border-2 items-center justify-center mr-4`,
                    {
                      borderColor: task.completed ? colors.success : colors.textSecondary,
                      backgroundColor: task.completed ? colors.success : "transparent",
                    }
                  ]}
                >
                  {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>

                {/* Task Content */}
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-base font-medium`,
                      {
                        color: task.completed ? colors.textSecondary : colors.text,
                        textDecorationLine: task.completed ? "line-through" : "none",
                      }
                    ]}
                  >
                    {task.name}
                  </Text>
                  {task.completed && (
                    <Text style={[tw`text-xs mt-1`, { color: colors.success }]}>
                      ✅ Completed • +10 XP +5 Coins
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation()
                      editTask(task)
                    }}
                    style={[tw`p-2 mr-1 rounded-lg`, { backgroundColor: colors.cardSecondary }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation()
                      deleteTask(task.id)
                    }}
                    style={[tw`p-2 rounded-lg`, { backgroundColor: colors.error + '20' }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completion Celebration */}
        {completionPercentage === 100 && tasks.length > 0 && (
          <View style={[
            tw`rounded-2xl p-6 mb-6 items-center`,
            {
              backgroundColor: colors.success + '20',
              borderWidth: 2,
              borderColor: colors.success + '40',
            }
          ]}>
            <Text style={tw`text-4xl mb-2`}>🎉</Text>
            <Text style={[tw`text-lg font-bold mb-1`, { color: colors.success }]}>
              Routine Complete!
            </Text>
            <Text style={[tw`text-center`, { color: colors.text }]}>
              Amazing work! You've completed all tasks for this routine.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AddTaskModal
        isVisible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        onAdd={addTask}
      />

      {editingTask && (
        <EditTaskModal
          isVisible={isEditTaskModalVisible}
          onClose={() => {
            setIsEditTaskModalVisible(false)
            setEditingTask(null)
          }}
          onSave={saveEditedTask}
          task={editingTask}
        />
      )}
    </SafeAreaView>
  )
}

