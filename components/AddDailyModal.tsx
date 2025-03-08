"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import tw from "../lib/tailwind"

interface AddDailyModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (task: string) => void
}

export default function AddDailyModal({ isVisible, onClose, onAdd }: AddDailyModalProps) {
  const [task, setTask] = useState("")

  const handleAdd = () => {
    if (task.trim()) {
      onAdd(task)
      setTask("")
      onClose()
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-4`}>Add New Daily Task</Text>

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Task Name"
            placeholderTextColor="#9CA3AF"
            value={task}
            onChangeText={setTask}
          />

          <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleAdd}>
            <Text style={tw`text-white text-center font-bold`}>Add Task</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={onClose}>
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

