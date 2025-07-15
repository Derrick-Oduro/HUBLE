"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"
import React from "react"

interface AddTaskModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (taskName: string) => void
}

export default function AddTaskModal({ isVisible, onClose, onAdd }: AddTaskModalProps) {
  const { colors } = useTheme()
  const [taskName, setTaskName] = useState("")

  const handleAdd = () => {
    if (taskName.trim()) {
      onAdd(taskName.trim())
      setTaskName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setTaskName("")
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={handleCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-black bg-opacity-50 flex-1`} />
        <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: colors.card }]}>
          <Text style={[tw`text-2xl font-bold mb-4`, { color: colors.text }]}>Add New Task</Text>

          <TextInput
            style={[
              tw`p-3 rounded-lg mb-4`,
              { 
                backgroundColor: colors.cardSecondary, 
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.cardSecondary,
              }
            ]}
            placeholder="Enter task name"
            placeholderTextColor={colors.textSecondary}
            value={taskName}
            onChangeText={setTaskName}
            autoFocus={true}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />

          <TouchableOpacity 
            style={[
              tw`p-4 rounded-lg mb-4`, 
              { 
                backgroundColor: taskName.trim() ? colors.accent : colors.cardSecondary,
                opacity: taskName.trim() ? 1 : 0.6
              }
            ]} 
            onPress={handleAdd}
            disabled={!taskName.trim()}
          >
            <Text style={[
              tw`text-center font-bold`,
              { color: taskName.trim() ? "white" : colors.textSecondary }
            ]}>
              Add Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`p-4 rounded-lg`, { backgroundColor: colors.cardSecondary }]} 
            onPress={handleCancel}
          >
            <Text style={[tw`text-center font-medium`, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

