"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"

interface EditTaskModalProps {
  isVisible: boolean
  onClose: () => void
  onSave: (task: { id: string; name: string }) => void
  task: { id: string; name: string }
}

export default function EditTaskModal({ isVisible, onClose, onSave, task }: EditTaskModalProps) {
  const { colors } = useTheme()
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
        <View style={tw`bg-black bg-opacity-50 flex-1`} />
        <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: colors.card }]}>
          <Text style={[tw`text-2xl font-bold mb-4`, { color: colors.text }]}>Edit Task</Text>

          <TextInput
            style={[
              tw`p-3 rounded-lg mb-4`,
              { backgroundColor: colors.cardSecondary, color: colors.text }
            ]}
            placeholder="Task Name"
            placeholderTextColor={colors.textSecondary}
            value={taskName}
            onChangeText={setTaskName}
            autoFocus={true}
          />

          <TouchableOpacity 
            style={[tw`p-4 rounded-lg mb-4`, { backgroundColor: colors.accent }]} 
            onPress={handleSave}
          >
            <Text style={tw`text-white text-center font-bold`}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`p-4 rounded-lg`, { backgroundColor: colors.cardSecondary }]} 
            onPress={onClose}
          >
            <Text style={[tw`text-center`, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

