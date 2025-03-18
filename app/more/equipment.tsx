"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Equipment() {
  const items = [
    {
      id: 1,
      name: "Focus Potion",
      description: "Increases focus time by 10%",
      quantity: 2,
      rarity: "Rare",
      icon: "flask-outline",
    },
    {
      id: 2,
      name: "Productivity Charm",
      description: "Doubles XP earned for 24 hours",
      quantity: 1,
      rarity: "Epic",
      icon: "star-outline",
    },
    {
      id: 3,
      name: "Time Crystal",
      description: "Adds 30 minutes to your timer",
      quantity: 3,
      rarity: "Common",
      icon: "hourglass-outline",
    },
    {
      id: 4,
      name: "Habit Shield",
      description: "Protects streak for one missed day",
      quantity: 1,
      rarity: "Legendary",
      icon: "shield-outline",
    },
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Common":
        return "text-gray-400"
      case "Rare":
        return "text-blue-400"
      case "Epic":
        return "text-purple-400"
      case "Legendary":
        return "text-yellow-400"
      default:
        return "text-white"
    }
  }

  return (
    <PageTemplate title="Equipment & Items">
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
        <Text style={tw`text-white text-lg font-bold mb-3`}>Your Items</Text>

        {items.map((item) => (
          <View
            key={item.id}
            style={tw`flex-row items-center p-3 border-b border-gray-700 ${item.id === items.length ? "border-b-0" : ""}`}
          >
            <View style={tw`bg-gray-700 p-2 rounded-full mr-3`}>
              <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-white font-bold mr-2`}>{item.name}</Text>
                <Text style={tw`${getRarityColor(item.rarity)} text-xs`}>{item.rarity}</Text>
              </View>
              <Text style={tw`text-gray-400 text-sm`}>{item.description}</Text>
            </View>
            <Text style={tw`text-white font-bold`}>x{item.quantity}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Visit Market</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

