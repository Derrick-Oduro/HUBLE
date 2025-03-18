"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"

export default function Achievements() {
  const router = useRouter()

  const achievements = [
    {
      id: 1,
      title: "Early Bird",
      description: "Complete a morning routine for 7 consecutive days",
      progress: 5,
      total: 7,
      icon: "sunny-outline",
      unlocked: false,
    },
    {
      id: 2,
      title: "Habit Master",
      description: "Complete all daily habits for 5 consecutive days",
      progress: 5,
      total: 5,
      icon: "checkmark-circle-outline",
      unlocked: true,
    },
    {
      id: 3,
      title: "Focus Champion",
      description: "Complete 10 focus sessions",
      progress: 7,
      total: 10,
      icon: "timer-outline",
      unlocked: false,
    },
    {
      id: 4,
      title: "Task Warrior",
      description: "Complete 50 tasks",
      progress: 42,
      total: 50,
      icon: "list-outline",
      unlocked: false,
    },
    {
      id: 5,
      title: "Consistency King",
      description: "Maintain a 10-day streak",
      progress: 7,
      total: 10,
      icon: "flame-outline",
      unlocked: false,
    },
  ]

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Achievements & Badges</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={tw`bg-gray-800 rounded-xl p-4 mb-4 ${achievement.unlocked ? "border border-violet-600" : ""}`}
            >
              <View style={tw`flex-row items-center mb-2`}>
                <View style={tw`bg-${achievement.unlocked ? "violet" : "gray"}-700 p-2 rounded-full mr-3`}>
                  <Ionicons name={achievement.icon} size={24} color={achievement.unlocked ? "#8B5CF6" : "white"} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white text-lg font-bold`}>{achievement.title}</Text>
                  <Text style={tw`text-gray-400 text-sm`}>{achievement.description}</Text>
                </View>
                {achievement.unlocked && <Ionicons name="trophy" size={24} color="#8B5CF6" />}
              </View>

              {!achievement.unlocked && (
                <View>
                  <View style={tw`bg-gray-700 h-2 rounded-full overflow-hidden`}>
                    <View
                      style={[
                        tw`bg-violet-600 h-full rounded-full`,
                        { width: `${(achievement.progress / achievement.total) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={tw`text-gray-400 text-xs mt-1 text-right`}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

