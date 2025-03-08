"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AddDailyModal from "../../components/AddDailyModal"

export default function Dailies() {
  const [tasks, setTasks] = useState([
    { id: "1", name: "Morning Walk", completed: false },
    { id: "2", name: "Read 10 pages", completed: false },
  ])

  const [isAddModalVisible, setIsAddModalVisible] = useState(false)

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const addTask = (newTask: any) => {
    setTasks([...tasks, { id: Date.now().toString(), name: newTask, completed: false }])
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
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
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
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

