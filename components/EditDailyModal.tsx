import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native"
import tw from "../lib/tailwind"
import { Ionicons } from "@expo/vector-icons"

interface EditDailyModalProps {
  isVisible: boolean
  onClose: () => void
  taskName: string
  onSave: (newName: string) => void
}

const EditDailyModal: React.FC<EditDailyModalProps> = ({ isVisible, onClose, taskName, onSave }) => {
  const [newName, setNewName] = useState(taskName)

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-gray-900 p-5 rounded-lg w-11/12`}>
          <Text style={tw`text-white text-lg font-semibold mb-2`}>Edit Daily Task</Text>
          
          {/* Task Name Input */}
          <TextInput
            style={tw`bg-gray-800 text-white p-3 rounded-lg mb-4`}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter task name"
            placeholderTextColor="#9CA3AF"
          />

          {/* Buttons */}
          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity style={tw`bg-gray-700 p-3 rounded-lg`} onPress={onClose}>
              <Text style={tw`text-white`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-violet-600 p-3 rounded-lg`}
              onPress={() => {
                onSave(newName)
                onClose()
              }}
            >
              <Text style={tw`text-white`}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default EditDailyModal
