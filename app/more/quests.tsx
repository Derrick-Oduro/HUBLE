"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Quests() {
  const quests = [
    {
      id: 1,
      title: "Morning Champion",
      description: "Complete your morning routine for 3 consecutive days",
      reward: "50 Coins",
      progress: 2,
      total: 3,
      icon: "sunny-outline",
      status: "active",
    },
    {
      id: 2,
      title: "Focus Master",
      description: "Complete 5 focus sessions of at least 25 minutes",
      reward: "1 Focus Potion",
      progress: 3,
      total: 5,
      icon: "timer-outline",
      status: "active",
    },
    {
      id: 3,
      title: "Habit Streak",
      description: "Complete all daily habits for 7 consecutive days",
      reward: "1 Habit Shield",
      progress: 4,
      total: 7,
      icon: "flame-outline",
      status: "active",
    },
    {
      id: 4,
      title: "Task Warrior",
      description: "Complete 20 tasks",
      reward: "100 Coins",
      progress: 20,
      total: 20,
      icon: "checkmark-done-outline",
      status: "completed",
    },
  ]

  return (
    <PageTemplate title="Quests">
      <View style={tw`bg-violet-600/20 rounded-xl p-4 mb-4 border border-violet-600`}>
        <Text style={tw`text-white text-center`}>Complete quests to earn rewards and boost your progress!</Text>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Active Quests</Text>

      {quests
        .filter((q) => q.status === "active")
        .map((quest) => (
          <View key={quest.id} style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`bg-gray-700 p-2 rounded-full mr-3`}>
                <Ionicons name={quest.icon} size={24} color="white" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-lg font-bold`}>{quest.title}</Text>
                <Text style={tw`text-gray-400 text-sm`}>{quest.description}</Text>
              </View>
            </View>

            <View style={tw`bg-gray-700 h-2 rounded-full overflow-hidden mb-2`}>
              <View
                style={[tw`bg-violet-600 h-full rounded-full`, { width: `${(quest.progress / quest.total) * 100}%` }]}
              />
            </View>

            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-gray-400 text-xs`}>
                {quest.progress}/{quest.total}
              </Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-gray-400 text-xs mr-1`}>Reward:</Text>
                <Text style={tw`text-white text-xs font-bold`}>{quest.reward}</Text>
              </View>
            </View>
          </View>
        ))}

      <Text style={tw`text-white text-lg font-bold mb-3`}>Completed Quests</Text>

      {quests
        .filter((q) => q.status === "completed")
        .map((quest) => (
          <View key={quest.id} style={tw`bg-gray-800 rounded-xl p-4 mb-4 opacity-80`}>
            <View style={tw`flex-row items-center mb-2`}>
              <View style={tw`bg-violet-600/30 p-2 rounded-full mr-3`}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-lg font-bold`}>{quest.title}</Text>
                <Text style={tw`text-gray-400 text-sm`}>{quest.description}</Text>
              </View>
              <TouchableOpacity style={tw`bg-violet-600 px-3 py-1 rounded-full`}>
                <Text style={tw`text-white text-xs font-bold`}>Claim</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`bg-gray-700 h-2 rounded-full overflow-hidden mb-2`}>
              <View style={tw`bg-violet-600 h-full rounded-full w-full`} />
            </View>

            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-gray-400 text-xs`}>
                {quest.total}/{quest.total}
              </Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-gray-400 text-xs mr-1`}>Reward:</Text>
                <Text style={tw`text-white text-xs font-bold`}>{quest.reward}</Text>
              </View>
            </View>
          </View>
        ))}
    </PageTemplate>
  )
}

