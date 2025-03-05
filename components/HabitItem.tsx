import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface HabitItemProps {
  title: string
  color: string
  subtext?: string
}

export default function HabitItem({ title, color, subtext }: HabitItemProps) {
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
              <TouchableOpacity style={tw`mr-2 p-1`}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={tw`p-1`}>
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

