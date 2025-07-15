"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar, ActivityIndicator, Alert, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import tw from "../lib/tailwind"
import AddTaskModal from "./AddTaskModal"
import EditTaskModal from "./EditTaskModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../contexts/ThemeProvider"
import { useStats } from "../contexts/StatsProvider"

export default function RoutineDetail({ route }) {
  const { colors } = useTheme()
  const { routineId } = route.params
  const router = useRouter()
  const { updateRoutineCompletion } = useStats()

  const [tasks, setTasks] = useState([])
  const [routineTemplate, setRoutineTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Load routine data
  const loadRoutineData = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routine = routinesData[routineId]
        
        if (routine) {
          setRoutineTemplate(routine)
          setTasks(routine.tasks || [])
        } else {
          // Create default routine if not found
          const defaultRoutine = {
            id: routineId,
            title: "Routine",
            icon: "sunny",
            description: "Your routine",
            tasks: [],
          }
          setRoutineTemplate(defaultRoutine)
          setTasks([])
          
          // Save default routine
          routinesData[routineId] = defaultRoutine
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        }
      } else {
        // No data at all, create default
        const defaultRoutine = {
          id: routineId,
          title: "Routine",
          icon: "sunny",
          description: "Your routine",
          tasks: [],
        }
        setRoutineTemplate(defaultRoutine)
        setTasks([])
        
        const routinesData = { [routineId]: defaultRoutine }
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      }
    } catch (e) {
      console.error("Error loading routine data:", e)
      // Fallback
      setRoutineTemplate({
        id: routineId,
        title: "Routine",
        icon: "sunny",
        description: "Your routine",
        tasks: [],
      })
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [routineId])

  // Update routine in storage
  const updateRoutineInStorage = useCallback(async (updatedTasks) => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      const routinesData = savedData ? JSON.parse(savedData) : {}
      
      if (routinesData[routineId]) {
        routinesData[routineId].tasks = updatedTasks
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        
        // Update stats
        const routinesArray = Object.values(routinesData)
        let completedRoutines = 0
        
        routinesArray.forEach((routine) => {
          if (routine.tasks && routine.tasks.length > 0) {
            const allTasksCompleted = routine.tasks.every((task) => task.completed)
            if (allTasksCompleted) completedRoutines++
          }
        })
        
        updateRoutineCompletion(completedRoutines, routinesArray.length)
      }
    } catch (e) {
      console.error("Failed to update routine in storage:", e)
    }
  }, [routineId, updateRoutineCompletion])

  // Load data on mount
  useEffect(() => {
    loadRoutineData()
  }, [loadRoutineData])

  // Reload data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadRoutineData()
    }, [loadRoutineData])
  )

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    updateRoutineInStorage(updatedTasks)
  }

  const addTask = async (taskName) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: taskName,
      completed: false,
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    updateRoutineInStorage(updatedTasks)
  }

  const editTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id)
    if (taskToEdit) {
      setEditingTask(taskToEdit)
      setIsEditModalVisible(true)
    }
  }

  const saveEditedTask = async (editedTask) => {
    const updatedTasks = tasks.map((task) => 
      task.id === editedTask.id ? { ...task, name: editedTask.name } : task
    )
    setTasks(updatedTasks)
    setEditingTask(null)
    updateRoutineInStorage(updatedTasks)
  }

  const deleteTask = async (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedTasks = tasks.filter((task) => task.id !== id)
            setTasks(updatedTasks)
            updateRoutineInStorage(updatedTasks)
          }
        }
      ]
    )
  }

  // Calculate completion percentage
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (loading || !routineTemplate) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={tw`text-gray-400 mt-4 text-lg`}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-3 pb-4`}>
        {/* Cool Modern Header */}
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <View style={tw`flex-row items-center flex-1`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={tw`mr-3 p-2`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={tw`flex-row items-center flex-1`}>
              <View 
                style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                  { 
                    backgroundColor: '#8B5CF620',
                    borderWidth: 2,
                    borderColor: '#8B5CF6',
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
              >
                <Ionicons name={routineTemplate.icon} size={28} color="#8B5CF6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-xl font-bold`} numberOfLines={1}>
                  {routineTemplate.title}
                </Text>
                <Text style={tw`text-gray-400 text-sm mt-1`} numberOfLines={1}>
                  {routineTemplate.description}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              tw`bg-violet-600 rounded-xl p-3 shadow-lg`,
              {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 4,
              }
            ]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Cool Progress Card */}
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white text-lg font-bold`}>Progress</Text>
            <Text style={tw`text-white text-lg font-medium`}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>

          {/* Ultra-thin Progress Bar */}
          <View style={tw`h-0.5 bg-gray-700 rounded-full overflow-hidden mb-1`}>
            <View 
              style={[
                tw`h-full rounded-full`,
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: '#10B981',
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]} 
            />
          </View>

          <Text style={tw`text-gray-400 text-sm`}>
            {completedTasks === totalTasks && totalTasks > 0
              ? "All tasks completed! Great job! 🎉"
              : `${totalTasks - completedTasks} tasks remaining`}
          </Text>
        </View>

        {/* Cool Task List */}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View 
              style={[
                tw`bg-gray-800 rounded-2xl p-3 mb-3 shadow-lg`,
                {
                  backgroundColor: item.completed ? '#1F2937' : '#374151',
                  borderLeftWidth: 4,
                  borderLeftColor: item.completed ? '#10B981' : '#6B7280',
                  shadowColor: item.completed ? '#10B981' : '#6B7280',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity
                  style={tw`flex-row items-center flex-1`}
                  onPress={() => toggleTask(item.id)}
                  activeOpacity={0.7}
                >
                  {/* Cool Completion Button */}
                  <View
                    style={[
                      tw`w-8 h-8 rounded-xl border-2 items-center justify-center mr-3`,
                      {
                        backgroundColor: item.completed ? '#10B981' : 'transparent',
                        borderColor: '#10B981',
                        shadowColor: item.completed ? '#10B981' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: item.completed ? 0.5 : 0,
                        shadowRadius: 4,
                        elevation: item.completed ? 4 : 0,
                      }
                    ]}
                  >
                    {item.completed && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  
                  <Text
                    style={[
                      tw`text-base font-medium flex-1`,
                      {
                        color: item.completed ? '#9CA3AF' : 'white',
                        textDecorationLine: item.completed ? 'line-through' : 'none',
                      }
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    onPress={() => editTask(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={tw`mr-2`}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteTask(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={tw`items-center py-8`}>
              <Ionicons name="list-outline" size={48} color="#6B7280" />
              <Text style={tw`text-gray-400 text-lg mt-3`}>No tasks yet</Text>
              <TouchableOpacity
                style={[
                  tw`mt-4 bg-violet-600 py-3 px-6 rounded-xl`,
                  {
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Text style={tw`text-white font-bold`}>Add Your First Task</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <AddTaskModal 
          isVisible={isAddModalVisible} 
          onClose={() => setIsAddModalVisible(false)} 
          onAdd={addTask} 
        />

        {editingTask && (
          <EditTaskModal
            isVisible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false)
              setEditingTask(null)
            }}
            onSave={saveEditedTask}
            task={editingTask}
          />
        )}

        {/* Routine Info */}
        <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
          <View style={tw`flex-row items-center mb-3`}>
            <View
              style={[
                tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: colors.accent + '20' }
              ]}
            >
              <Ionicons name={routineTemplate.icon} size={24} color={colors.accent} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
                {routineTemplate.title}
              </Text>
              <Text style={[tw``, { color: colors.textSecondary }]}>
                {routineTemplate.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Tasks */}
        {routineTemplate.tasks && routineTemplate.tasks.length > 0 && (
          <View style={[tw`rounded-2xl p-5`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Tasks ({routineTemplate.tasks.filter((t: any) => t.completed).length}/{routineTemplate.tasks.length})
            </Text>
            
            {routineTemplate.tasks.map((task: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`flex-row items-center p-3 rounded-xl mb-2`,
                  { backgroundColor: colors.cardSecondary }
                ]}
                onPress={() => toggleTask(index)}
              >
                <View
                  style={[
                    tw`w-6 h-6 rounded-full border-2 items-center justify-center mr-3`,
                    {
                      backgroundColor: task.completed ? colors.success : 'transparent',
                      borderColor: task.completed ? colors.success : colors.textSecondary,
                    }
                  ]}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text style={[
                  tw`flex-1`,
                  { 
                    color: task.completed ? colors.textSecondary : colors.text,
                    textDecorationLine: task.completed ? 'line-through' : 'none'
                  }
                ]}>
                  {task.title}
                </Text>
                {task.duration && (
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                    {task.duration}m
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
