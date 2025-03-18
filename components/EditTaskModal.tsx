"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import tw from "../lib/tailwind"

interface EditTaskModalProps {
  isVisible: boolean
  onClose: () => void
  onSave: (task: { id: string; name: string }) => void
  task: { id: string; name: string }
}

export default function EditTaskModal({ isVisible, onClose, onSave, task }: EditTaskModalProps) {
  const [taskName, setTaskName] = useState("")

  useEffect(() => {
    if (task) {
      setTaskName(task.name || "")
    }
  }, [task, isVisible])

  const handleSave = () => {
    if (taskName.trim()) {
      onSave({
        id: task.id,
        name: taskName,
      })
      onClose()
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-4`}>Edit Task</Text>

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Task Name"
            placeholderTextColor="#9CA3AF"
            value={taskName}
            onChangeText={setTaskName}
            autoFocus={true}
          />

          <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleSave}>
            <Text style={tw`text-white text-center font-bold`}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={onClose}>
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

