"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface AddRoutineModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (routine: { title: string; description: string; icon: string }) => void
}

export default function AddRoutineModal({ isVisible, onClose, onAdd }: AddRoutineModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("sunny")

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({ title, description, icon })
      setTitle("")
      setDescription("")
      setIcon("sunny")
      onClose()
    }
  }

  const icons = ["sunny", "partly-sunny", "moon", "fitness", "book", "briefcase"]

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-4`}>Add New Routine</Text>

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Routine Title"
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

          <Text style={tw`text-white mb-2`}>Icon:</Text>
          <View style={tw`flex-row justify-between mb-6`}>
            {icons.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                style={tw`p-2 rounded-full ${icon === iconName ? "bg-violet-600" : "bg-gray-700"}`}
                onPress={() => setIcon(iconName)}
              >
                <Ionicons name={iconName} size={24} color="white" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleAdd}>
            <Text style={tw`text-white text-center font-bold`}>Add Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={onClose}>
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

