"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import tw from "../lib/tailwind"

interface AddHabitModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (habit: { title: string; description: string; difficulty: string; color: string }) => void
  initialValues?: { title: string; description: string; difficulty: string; color: string }
}

export default function AddHabitModal({ isVisible, onClose, onAdd, initialValues }: AddHabitModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [color, setColor] = useState("green-500")

  // Set initial values when editing
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "")
      setDescription(initialValues.description || "")
      setDifficulty(initialValues.difficulty || "medium")
      setColor(initialValues.color || "green-500")
    }
  }, [initialValues, isVisible])

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({ title, description, difficulty, color })
      setTitle("")
      setDescription("")
      setDifficulty("medium")
      setColor("green-500")
      onClose()
    }
  }

  const colors = ["green-500", "blue-500", "yellow-500", "red-500", "purple-500"]
  const difficulties = ["easy", "medium", "hard"]

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-4`}>{initialValues ? "Edit Habit" : "Add New Habit"}</Text>

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Habit Title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={tw`text-white mb-2`}>Difficulty:</Text>
          <View style={tw`flex-row justify-between mb-4`}>
            {difficulties.map((d) => (
              <TouchableOpacity
                key={d}
                style={tw`bg-gray-700 p-2 rounded-lg ${difficulty === d ? "bg-violet-600" : ""}`}
                onPress={() => setDifficulty(d)}
              >
                <Text style={tw`text-white capitalize`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={tw`text-white mb-2`}>Color:</Text>
          <View style={tw`flex-row justify-between mb-6`}>
            {colors.map((c) => (
              <TouchableOpacity
                key={c}
                style={tw`w-10 h-10 rounded-full bg-${c} ${color === c ? "border-4 border-white" : ""}`}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleAdd}>
            <Text style={tw`text-white text-center font-bold`}>{initialValues ? "Update Habit" : "Add Habit"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={onClose}>
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

