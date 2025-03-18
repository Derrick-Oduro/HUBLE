"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "twrnc" // Using twrnc instead of custom tailwind
import AddRoutineModal from "../../components/AddRoutineModal"
import EditRoutineModal from "../../components/EditRoutineModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsContext"

export default function Routines() {
  // Add this function at the top of your component, before the useState declarations
  const resetToDefaultRoutines = async () => {
    try {
      // Clear existing routines data
      await AsyncStorage.removeItem("routinesData")
      await AsyncStorage.removeItem("routineTasksState")

      // Reset to default routines
      setRoutines(defaultRoutines)

      // Save default routines to AsyncStorage
      const routinesObj = {}
      defaultRoutines.forEach((routine) => {
        routinesObj[routine.id] = {
          ...routine,
          tasks: [],
        }
      })

      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesObj))
      console.log("Reset to default routines completed")

      // Update stats context
      updateRoutineCompletion(0, defaultRoutines.length)
    } catch (e) {
      console.error("Failed to reset routines:", e)
    }
  }
  // Keep your existing default routines
  const defaultRoutines = [
    { id: "1", title: "Morning Routine", icon: "sunny", description: "Start your day with good habits" },
    { id: "2", title: "Afternoon Routine", icon: "partly-sunny", description: "Stay productive through the day" },
    { id: "3", title: "Evening Routine", icon: "moon", description: "End your day on a positive note" },
  ]

  const { updateRoutineCompletion } = useStats()
  const [routines, setRoutines] = useState(defaultRoutines)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Add this to your useEffect that loads routines
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        setLoading(true)
        const savedData = await AsyncStorage.getItem("routinesData")

        if (savedData) {
          const routinesData = JSON.parse(savedData)
          // Convert object to array for display
          const routinesArray = Object.values(routinesData)

          // Check if we have all default routines
          const hasAllDefaults = defaultRoutines.every((defaultRoutine) =>
            routinesArray.some((r) => r.id === defaultRoutine.id),
          )

          if (routinesArray.length > 0 && hasAllDefaults) {
            setRoutines(routinesArray)

            // Update stats context
            // Count completed routines (those with all tasks completed)
            let completedRoutines = 0
            routinesArray.forEach((routine) => {
              if (routine.tasks && routine.tasks.length > 0) {
                const allTasksCompleted = routine.tasks.every((task) => task.completed)
                if (allTasksCompleted) completedRoutines++
              }
            })

            updateRoutineCompletion(completedRoutines, routinesArray.length)
          } else {
            // If any default routine is missing, reset to defaults
            console.log("Some default routines are missing, resetting to defaults")
            await resetToDefaultRoutines()
          }
        } else {
          // No data in AsyncStorage, use default routines
          console.log("No routines found, setting defaults")
          await resetToDefaultRoutines()
        }
      } catch (e) {
        console.error("Failed to load routines:", e)
        // Reset to defaults if there's an error
        await resetToDefaultRoutines()
      } finally {
        setLoading(false)
      }
    }

    loadRoutines()
  }, [])

  const addRoutine = async (newRoutine: { title: any; icon: any; description: any; tasks: any }) => {
    // Create a new routine with the provided data
    const routineToAdd = {
      id: Date.now().toString(),
      title: newRoutine.title,
      icon: newRoutine.icon,
      description: newRoutine.description,
    }

    // Update local state
    setRoutines([...routines, routineToAdd])

    // Save to AsyncStorage
    try {
      // Get existing routines data
      const existingData = await AsyncStorage.getItem("routinesData")
      const routinesData = existingData ? JSON.parse(existingData) : {}

      // Add the new routine with its tasks
      routinesData[routineToAdd.id] = {
        ...routineToAdd,
        tasks: newRoutine.tasks || [],
      }

      // Save back to AsyncStorage
      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))

      // Update stats context
      updateRoutineCompletion(0, routines.length + 1)
    } catch (e) {
      console.error("Failed to save routine data:", e)
    }
  }

  const editRoutine = (id: string) => {
    const routineToEdit = routines.find((routine) => routine.id === id)
    if (routineToEdit) {
      setEditingRoutine(routineToEdit)
      setIsEditModalVisible(true)
    }
  }

  const saveEditedRoutine = async (editedRoutine: { id: string; title: any; icon: any; description: any }) => {
    // Update local state
    const updatedRoutines = routines.map((routine) => (routine.id === editedRoutine.id ? editedRoutine : routine))
    setRoutines(updatedRoutines)
    setEditingRoutine(null)

    // Update in AsyncStorage
    try {
      const existingData = await AsyncStorage.getItem("routinesData")
      if (existingData) {
        const routinesData = JSON.parse(existingData)
        if (routinesData[editedRoutine.id]) {
          routinesData[editedRoutine.id] = {
            ...routinesData[editedRoutine.id],
            title: editedRoutine.title,
            icon: editedRoutine.icon,
            description: editedRoutine.description,
          }
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))

          // Count completed routines
          let completedRoutines = 0
          Object.values(routinesData).forEach((routine) => {
            if (routine.tasks && routine.tasks.length > 0) {
              const allTasksCompleted = routine.tasks.every((task) => task.completed)
              if (allTasksCompleted) completedRoutines++
            }
          })

          // Update stats context
          updateRoutineCompletion(completedRoutines, Object.keys(routinesData).length)
        } else {
          // If the routine doesn't exist in AsyncStorage yet, add it
          routinesData[editedRoutine.id] = {
            ...editedRoutine,
            tasks: [],
          }
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))

          // Update stats context
          updateRoutineCompletion(0, Object.keys(routinesData).length)
        }
      }
    } catch (e) {
      console.error("Failed to update routine data:", e)
    }
  }

  const deleteRoutine = async (id) => {
    // Update local state
    setRoutines(routines.filter((routine) => routine.id !== id))

    // Remove from AsyncStorage
    try {
      const existingData = await AsyncStorage.getItem("routinesData")
      if (existingData) {
        const routinesData = JSON.parse(existingData)
        delete routinesData[id]
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))

        // Count completed routines
        let completedRoutines = 0
        Object.values(routinesData).forEach((routine) => {
          if (routine.tasks && routine.tasks.length > 0) {
            const allTasksCompleted = routine.tasks.every((task) => task.completed)
            if (allTasksCompleted) completedRoutines++
          }
        })

        // Update stats context
        updateRoutineCompletion(completedRoutines, Object.keys(routinesData).length)
      }
    } catch (e) {
      console.error("Failed to delete routine data:", e)
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
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={tw`text-white text-2xl font-bold`}>Daily Routines</Text>
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-full p-2 shadow-lg`}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={tw`bg-gray-800 rounded-xl mb-4 overflow-hidden shadow-lg`}
              onPress={() =>
                router.push({
                  pathname: "/routines/routine-detail",
                  params: { id: routine.id },
                })
              }
            >
              <View style={tw`p-4`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`bg-violet-600 rounded-full p-2 mr-3`}>
                      <Ionicons name={routine.icon} size={24} color="white" />
                    </View>
                    <Text style={tw`text-white text-lg font-bold`}>{routine.title}</Text>
                  </View>
                  <View style={tw`flex-row`}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation()
                        editRoutine(routine.id)
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={tw`mr-3`}
                    >
                      <Ionicons name="pencil-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation()
                        deleteRoutine(routine.id)
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={tw`text-gray-400`}>{routine.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <AddRoutineModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addRoutine} />

        {editingRoutine && (
          <EditRoutineModal
            isVisible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false)
              setEditingRoutine(null)
            }}
            onSave={saveEditedRoutine}
            routine={editingRoutine}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

