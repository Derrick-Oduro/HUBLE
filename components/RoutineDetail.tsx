"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "twrnc" // Using twrnc instead of custom tailwind
import AddTaskModal from "./AddTaskModal"
import EditTaskModal from "./EditTaskModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../contexts/StatsContext"

// This function will load routines data from AsyncStorage if available,
// but will preserve your existing routines if no data is found
const getRoutinesData = async (existingRoutines: any[]) => {
  try {
    // Try to load from AsyncStorage first
    const savedData = await AsyncStorage.getItem("routinesData")
    if (savedData) {
      return JSON.parse(savedData)
    }
  } catch (e) {
    console.error("Failed to load routines data:", e)
  }

  // If no data in AsyncStorage, convert existing routines to the expected format
  // This preserves your existing routines instead of creating new defaults
  const routinesData = {}
  if (existingRoutines && existingRoutines.length > 0) {
    existingRoutines.forEach((routine) => {
      routinesData[routine.id] = {
        ...routine,
        tasks: routine.tasks || [],
      }
    })

    // Save the existing routines to AsyncStorage for future use
    try {
      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
    } catch (e) {
      console.error("Failed to save existing routines to AsyncStorage:", e)
    }

    return routinesData
  }

  // If no existing routines and no AsyncStorage data, return empty object
  return {}
}

// This would be in a real app to persist task completion state
const loadTaskState = async () => {
  try {
    const savedState = await AsyncStorage.getItem("routineTasksState")
    return savedState ? JSON.parse(savedState) : {}
  } catch (e) {
    console.error("Failed to load task state:", e)
    return {}
  }
}

const saveTaskState = async (state: {}) => {
  try {
    await AsyncStorage.setItem("routineTasksState", JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save task state:", e)
  }
}

export default function RoutineDetail({ route }) {
  const { routineId } = route.params
  const router = useRouter()
  const { updateRoutineCompletion } = useStats()

  // State for tasks with persistence
  const [taskState, setTaskState] = useState({})
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [tasks, setTasks] = useState([])
  const [routineTemplate, setRoutineTemplate] = useState(null)
  const [loading, setLoading] = useState(true)

  // Update the useEffect to use the dynamic data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Get the routine data - this will preserve existing routines
        const routinesData = await getRoutinesData([])
        const template = routinesData[routineId]

        if (!template) {
          // If routine doesn't exist in our data, use the route ID to find it
          // This handles the case where the routine exists but hasn't been saved to AsyncStorage yet
          console.log("Routine not found in AsyncStorage, checking route params")

          // You can add logic here to find the routine in your existing data
          // For now, create a basic template
          const basicTemplate = {
            id: routineId,
            title: "Routine",
            icon: "sunny",
            description: "Your routine",
            tasks: [],
          }

          setRoutineTemplate(basicTemplate)
          setTasks([])
        } else {
          setRoutineTemplate(template)

          const savedState = await loadTaskState()
          setTaskState(savedState)

          // Initialize tasks with saved completion state or defaults
          const initialTasks = (template.tasks || []).map((task: { id: string | number; completed: any }) => ({
            ...task,
            completed: savedState[task.id] !== undefined ? savedState[task.id] : task.completed,
          }))

          setTasks(initialTasks)
        }
      } catch (e) {
        console.error("Error loading routine data:", e)
        // Set a fallback template if everything fails
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
    }

    loadData()
  }, [routineId])

  // Save task state whenever it changes
  useEffect(() => {
    if (Object.keys(taskState).length > 0) {
      saveTaskState(taskState)
    }
  }, [taskState])

  // Update stats whenever tasks change
  useEffect(() => {
    const updateStats = async () => {
      try {
        // Get all routines to count total and completed
        const routinesData = await getRoutinesData([])
        if (routinesData) {
          const routinesArray = Object.values(routinesData)
          let completedRoutines = 0

          routinesArray.forEach((routine) => {
            if (routine.tasks && routine.tasks.length > 0) {
              const allTasksCompleted = routine.tasks.every((task) => task.completed)
              if (allTasksCompleted) completedRoutines++
            }
          })

          // Update stats context
          updateRoutineCompletion(completedRoutines, routinesArray.length)
        }
      } catch (e) {
        console.error("Failed to update routine stats:", e)
      }
    }

    updateStats()
  }, [tasks, updateRoutineCompletion])

  if (loading || !routineTemplate) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-white text-lg`}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const toggleTask = (id: any) => {
    // Update the task in the list
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)

    // Update the persistent state
    const taskCompleted = !tasks.find((t) => t.id === id)?.completed
    setTaskState((prev) => ({
      ...prev,
      [id]: taskCompleted,
    }))

    // Update the routine in AsyncStorage
    updateRoutineInStorage(updatedTasks)
  }

  // Helper function to update routine in AsyncStorage
  const updateRoutineInStorage = async (updatedTasks) => {
    try {
      const routinesData = await getRoutinesData([])
      if (routinesData[routineId]) {
        routinesData[routineId].tasks = updatedTasks
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      }
    } catch (e) {
      console.error("Failed to update routine in storage:", e)
    }
  }

  // Update the addTask function to also save to the routinesData
  const addTask = async (taskName: any) => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: taskName,
      completed: false,
    }

    // Update local state
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)

    // Update routinesData in AsyncStorage
    try {
      const routinesData = await getRoutinesData([])
      if (routinesData[routineId]) {
        routinesData[routineId].tasks = updatedTasks
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      } else {
        // If the routine doesn't exist in AsyncStorage yet, create it
        routinesData[routineId] = {
          ...routineTemplate,
          tasks: updatedTasks,
        }
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      }
    } catch (e) {
      console.error("Failed to save task to routine:", e)
    }
  }

  const editTask = (id: any) => {
    const taskToEdit = tasks.find((task) => task.id === id)
    if (taskToEdit) {
      setEditingTask(taskToEdit)
      setIsEditModalVisible(true)
    }
  }

  const saveEditedTask = async (editedTask: { id: any; name: any }) => {
    const updatedTasks = tasks.map((task) => (task.id === editedTask.id ? { ...task, name: editedTask.name } : task))
    setTasks(updatedTasks)
    setEditingTask(null)

    // Update in routinesData
    updateRoutineInStorage(updatedTasks)
  }

  const deleteTask = async (id: string | number) => {
    // Remove the task from the list
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)

    // Remove from persistent state
    const newState = { ...taskState }
    delete newState[id]
    setTaskState(newState)

    // Also remove from routinesData
    updateRoutineInStorage(updatedTasks)
  }

  // Calculate completion percentage
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              style={tw`mr-3`}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-violet-600 rounded-full p-2 mr-3`}>
                <Ionicons name={routineTemplate.icon} size={24} color="white" />
              </View>
              <Text style={tw`text-white text-2xl font-bold`}>{routineTemplate.title}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-full p-2 shadow-lg`}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white text-lg font-bold`}>Progress</Text>
            <Text style={tw`text-white text-lg font-medium`}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={tw`h-2.5 bg-gray-700 rounded-full overflow-hidden mb-1`}>
            <View style={[tw`h-full rounded-full bg-green-500`, { width: `${completionPercentage}%` }]} />
          </View>

          <Text style={tw`text-gray-400 text-sm`}>
            {completedTasks === totalTasks && totalTasks > 0
              ? "All tasks completed! Great job!"
              : `${totalTasks - completedTasks} tasks remaining`}
          </Text>
        </View>

        {/* Task List */}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={tw`flex-row items-center justify-between bg-gray-800 p-4 rounded-lg mb-2`}>
              <TouchableOpacity
                style={tw`flex-row items-center flex-1`}
                onPress={() => toggleTask(item.id)}
                activeOpacity={0.7}
              >
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
              </TouchableOpacity>

              <View style={tw`flex-row`}>
                <TouchableOpacity
                  onPress={() => editTask(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={tw`mr-3`}
                >
                  <Ionicons name="pencil-outline" size={22} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteTask(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={tw`flex items-center justify-center py-8`}>
              <Text style={tw`text-gray-400 text-lg`}>No tasks yet</Text>
              <TouchableOpacity
                style={tw`mt-4 bg-violet-600 py-2 px-4 rounded-lg`}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Text style={tw`text-white font-medium`}>Add Your First Task</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <AddTaskModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addTask} />

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
      </View>
    </SafeAreaView>
  )
}

