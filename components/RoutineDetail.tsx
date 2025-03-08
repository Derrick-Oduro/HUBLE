"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import tw from "../lib/tailwind"
import AddTaskModal from "./AddTaskModal"

export default function RoutineDetail({ route }) {
  const navigation = useNavigation()
  const { routineId } = route.params || {}

  const [routine, setRoutine] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false)

  // Mock data for routines - in a real app, you'd fetch this from storage or API
  const routinesData = [
    { id: "1", title: "Morning Routine", icon: "sunny", description: "Start your day with good habits" },
    { id: "2", title: "Afternoon Routine", icon: "partly-sunny", description: "Stay productive through the day" },
    { id: "3", title: "Evening Routine", icon: "moon", description: "End your day on a positive note" },
  ]

  // Mock data for tasks - in a real app, you'd fetch this from storage or API
  const initialTasks = {
    "1": [
      { id: "101", name: "Drink water", completed: false },
      { id: "102", name: "Meditate for 10 minutes", completed: false },
      { id: "103", name: "Exercise", completed: false },
    ],
    "2": [
      { id: "201", name: "Review goals", completed: false },
      { id: "202", name: "Check emails", completed: false },
    ],
    "3": [
      { id: "301", name: "Read a book", completed: false },
      { id: "302", name: "Plan tomorrow", completed: false },
    ],
  }

  useEffect(() => {
    // Find the routine by ID
    const foundRoutine = routinesData.find((r) => r.id === routineId)
    setRoutine(foundRoutine)

    // Get tasks for this routine
    setTasks(initialTasks[routineId] || [])
  }, [routineId])

  const addTask = (taskName) => {
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
    }
    setTasks([...tasks, newTask])
  }

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  if (!routine) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <Text style={tw`text-white text-lg`}>Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={tw`flex-row items-center flex-1`}>
            <View style={tw`bg-violet-600 rounded-full p-2 mr-3`}>
              <Ionicons name={routine.icon} size={24} color="white" />
            </View>
            <View>
              <Text style={tw`text-white text-2xl font-bold`}>{routine.title}</Text>
              <Text style={tw`text-gray-400`}>{routine.description}</Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-white text-xl font-semibold`}>Tasks</Text>
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-full p-2 shadow-lg`}
            onPress={() => setIsAddTaskModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`text-gray-400 text-center`}>No tasks yet. Add some tasks to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={tw`bg-gray-800 rounded-xl mb-3 p-4 flex-row items-center`}>
                <TouchableOpacity
                  style={tw`mr-3 ${item.completed ? "bg-violet-600" : "bg-gray-700"} w-6 h-6 rounded-full justify-center items-center`}
                  onPress={() => toggleTaskCompletion(item.id)}
                >
                  {item.completed && <Ionicons name="checkmark" size={16} color="white" />}
                </TouchableOpacity>
                <Text style={tw`flex-1 text-white ${item.completed ? "line-through text-gray-400" : ""}`}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AddTaskModal isVisible={isAddTaskModalVisible} onClose={() => setIsAddTaskModalVisible(false)} onAdd={addTask} />
    </SafeAreaView>
  )
}

