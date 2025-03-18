"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface HabitItemProps {
  id?: number | string
  title: string
  color: string
  subtext?: string
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
  onComplete?: (id: number | string) => void
  onFail?: (id: number | string) => void
}

export default function HabitItem({
  id = 0,
  title,
  color,
  subtext,
  onEdit = () => {},
  onDelete = () => {},
  onComplete = () => {},
  onFail = () => {},
}: HabitItemProps) {
  const [showOptions, setShowOptions] = useState(false)

  // Safe handler functions that check if id exists before calling callbacks
  const handleEdit = () => {
    setShowOptions(false)
    if (id !== undefined) onEdit(id)
  }

  const handleDelete = () => {
    setShowOptions(false)
    if (id !== undefined) onDelete(id)
  }

  const handleComplete = () => {
    if (id !== undefined) onComplete(id)
  }

  const handleFail = () => {
    if (id !== undefined) onFail(id)
  }

  return (
    <View style={tw`bg-gray-800 rounded-xl mb-3 overflow-hidden shadow-lg`}>
      <View style={tw`border-l-4 border-${color}`}>
        <View style={tw`p-4`}>
          <View style={tw`flex-row justify-between items-start`}>
            <View style={tw`flex-1 mr-3`}>
              <Text style={tw`text-white text-base font-medium mb-1`}>{title}</Text>
              {subtext && <Text style={tw`text-gray-400 text-sm`}>{subtext}</Text>}
            </View>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity style={tw`mr-2 p-1`} onPress={handleFail}>
                <Ionicons name="remove-circle-outline" size={28} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={tw`mr-2 p-1`} onPress={handleComplete}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={tw`p-1`} onPress={() => setShowOptions(true)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal transparent={true} visible={showOptions} onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity
          style={tw`flex-1 bg-black bg-opacity-50`}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={tw`bg-gray-800 rounded-xl p-4 m-4 absolute right-0 top-1/4`}>
            <TouchableOpacity style={tw`py-2`} onPress={handleEdit}>
              <Text style={tw`text-white text-lg`}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`py-2`} onPress={handleDelete}>
              <Text style={tw`text-white text-lg`}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

