"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface EditRoutineModalProps {
  isVisible: boolean
  onClose: () => void
  onSave: (routine: { id: string; title: string; icon: string; description: string }) => void
  routine: { id: string; title: string; icon: string; description: string }
}

export default function EditRoutineModal({ isVisible, onClose, onSave, routine }: EditRoutineModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("sunny")

  useEffect(() => {
    if (routine) {
      setTitle(routine.title || "")
      setDescription(routine.description || "")
      setSelectedIcon(routine.icon || "sunny")
    }
  }, [routine, isVisible])

  const icons = ["sunny", "partly-sunny", "moon", "fitness", "book", "briefcase", "cafe", "restaurant", "bed", "home"]

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        id: routine.id,
        title,
        icon: selectedIcon,
        description,
      })
      onClose()
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-4`}>Edit Routine</Text>

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Routine Name"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4 min-h-[80px]`}
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={tw`text-white font-medium mb-2`}>Choose an Icon:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-2`}>
            {icons.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={tw`mr-3 p-3 ${selectedIcon === icon ? "bg-violet-600" : "bg-gray-700"} rounded-full`}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons name={icon} size={24} color="white" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={tw`mt-6`}>
            <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleSave}>
              <Text style={tw`text-white text-center font-bold`}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={onClose}>
              <Text style={tw`text-white text-center`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

