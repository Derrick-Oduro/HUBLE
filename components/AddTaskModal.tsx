"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface AddTaskModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (taskName: string) => void
}

export default function AddTaskModal({ isVisible, onClose, onAdd }: AddTaskModalProps) {
  const [taskName, setTaskName] = useState("")

  const handleAdd = () => {
    if (taskName.trim() === "") return

    onAdd(taskName)
    setTaskName("")
    onClose()
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={tw`flex-1 bg-black/50 justify-center items-center p-5`}>
        <View style={tw`bg-gray-800 w-full rounded-xl p-5`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-xl font-bold`}>Add New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={tw`text-white mb-1`}>Task Name</Text>
          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Enter task name"
            placeholderTextColor="#9CA3AF"
            value={taskName}
            onChangeText={setTaskName}
          />

          <TouchableOpacity style={tw`bg-violet-600 p-3 rounded-lg items-center`} onPress={handleAdd}>
            <Text style={tw`text-white font-bold`}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

