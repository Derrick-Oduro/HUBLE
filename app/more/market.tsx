"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Market() {
  const marketItems = [
    {
      id: 1,
      name: "Focus Potion",
      description: "Increases focus time by 10%",
      price: 50,
      currency: "coins",
      rarity: "Rare",
      icon: "flask-outline",
    },
    {
      id: 2,
      name: "Productivity Charm",
      description: "Doubles XP earned for 24 hours",
      price: 100,
      currency: "coins",
      rarity: "Epic",
      icon: "star-outline",
    },
    {
      id: 3,
      name: "Time Crystal",
      description: "Adds 30 minutes to your timer",
      price: 25,
      currency: "coins",
      rarity: "Common",
      icon: "hourglass-outline",
    },
    {
      id: 4,
      name: "Habit Shield",
      description: "Protects streak for one missed day",
      price: 200,
      currency: "coins",
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
    <PageTemplate title="Market">
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="cash-outline" size={20} color="#FFD700" style={tw`mr-1`} />
          <Text style={tw`text-white font-bold`}>250 Coins</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="diamond-outline" size={20} color="#3B82F6" style={tw`mr-1`} />
          <Text style={tw`text-white font-bold`}>5 Gems</Text>
        </View>
      </View>

      <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
        <Text style={tw`text-white text-lg font-bold mb-3`}>Available Items</Text>

        {marketItems.map((item) => (
          <View
            key={item.id}
            style={tw`flex-row items-center p-3 border-b border-gray-700 ${item.id === marketItems.length ? "border-b-0" : ""}`}
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
            <TouchableOpacity style={tw`bg-violet-600 px-3 py-1 rounded-full`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name={item.currency === "coins" ? "cash-outline" : "diamond-outline"}
                  size={14}
                  color="white"
                  style={tw`mr-1`}
                />
                <Text style={tw`text-white font-bold`}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </PageTemplate>
  )
}

