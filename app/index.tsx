"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import HabitItem from "../components/HabitItem"
import ProgressBar from "../components/ProgressBar"
import AddHabitModal from "../components/AddHabitModal"

export default function HabitsScreen() {
  const [habits, setHabits] = useState([
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
  ])

  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)

  const addHabit = (newHabit: {
    id: number
    title: string
    description: string
    difficulty: string
    color: string
  }) => {
    setHabits([...habits, { ...newHabit, id: habits.length + 1 }])
  }

  const editHabit = (id) => {
    const habitToEdit = habits.find((habit) => habit.id === id)
    setEditingHabit(habitToEdit)
    setIsAddModalVisible(true)
  }

  const updateHabit = (updatedHabit: any) => {
    setHabits(habits.map((habit) => (habit.id === editingHabit.id ? { ...updatedHabit, id: habit.id } : habit)))
    setEditingHabit(null)
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter((habit) => habit.id !== id))
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
        <View style={tw`mb-4`}>
          <Text style={tw`text-white text-sm font-bold`}>Level 4</Text>
          <ProgressBar value={17} max={100} color="yellow-500" label="Experience" />
          <ProgressBar value={50} max={50} color="red-500" label="Health" />
          <Text style={tw`text-white mt-2`}>💎 20 🟡 27</Text>
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
            />
          ))}
        </ScrollView>

        <AddHabitModal
          isVisible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false)
            setEditingHabit(null)
          }}
          onAdd={editingHabit ? updateHabit : addHabit}
        />
      </View>
    </SafeAreaView>
  )
}

