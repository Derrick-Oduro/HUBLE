"use client"

import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsContext"

// Component for progress bars
const StatProgressBar = ({ value, max, color, showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <View style={tw`mb-1`}>
      <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden`}>
        <View style={[tw`h-full rounded-full bg-${color}`, { width: `${percentage}%` }]} />
      </View>
      {showPercentage && <Text style={tw`text-gray-400 text-xs text-right mt-1`}>{Math.round(percentage)}%</Text>}
    </View>
  )
}

export default function Stats() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const { stats, refreshStats } = useStats()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshStats()
    setRefreshing(false)
  }, [refreshStats])

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Stats & Analytics</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={["#8B5CF6"]} />
          }
        >
          {/* User Level Card */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-violet-600 rounded-full p-2 mr-2`}>
                  <Text style={tw`text-white font-bold text-lg`}>{stats.level}</Text>
                </View>
                <Text style={tw`text-white text-lg font-bold`}>Level {stats.level}</Text>
              </View>
              <Text style={tw`text-white`}>
                {stats.experience}/{stats.maxExperience} XP
              </Text>
            </View>

            <Text style={tw`text-white mb-1`}>Experience</Text>
            <StatProgressBar value={stats.experience} max={stats.maxExperience} color="yellow-500" />

            <Text style={tw`text-white mb-1 mt-2`}>Health</Text>
            <StatProgressBar value={stats.health} max={stats.maxHealth} color="red-500" />

            <View style={tw`flex-row justify-between mt-2`}>
              <Text style={tw`text-white`}>💎 {stats.gemsEarned}</Text>
              <Text style={tw`text-white`}>🟡 {stats.coinsEarned}</Text>
            </View>
          </View>

          {/* Habits Stats */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#8B5CF6" style={tw`mr-2`} />
              <Text style={tw`text-white text-lg font-bold`}>Habits</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Habits Completed Today</Text>
              <Text style={tw`text-white font-bold`}>
                {stats.completedHabitsToday}/{stats.totalHabits}
              </Text>
            </View>

            <Text style={tw`text-gray-400 mb-1`}>Completion Rate</Text>
            <StatProgressBar value={stats.habitCompletionRate} max={100} color="green-500" />

            <View style={tw`flex-row justify-between mt-2`}>
              <View>
                <Text style={tw`text-gray-400`}>Current Streak</Text>
                <Text style={tw`text-white font-bold`}>{stats.currentHabitStreak} days 🔥</Text>
              </View>
              <View>
                <Text style={tw`text-gray-400`}>Longest Streak</Text>
                <Text style={tw`text-white font-bold`}>{stats.longestHabitStreak} days</Text>
              </View>
            </View>
          </View>

          {/* Dailies Stats */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="list-outline" size={20} color="#8B5CF6" style={tw`mr-2`} />
              <Text style={tw`text-white text-lg font-bold`}>Daily Tasks</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Tasks Completed Today</Text>
              <Text style={tw`text-white font-bold`}>
                {stats.completedDailiesToday}/{stats.totalDailies}
              </Text>
            </View>

            <Text style={tw`text-gray-400 mb-1`}>Completion Rate</Text>
            <StatProgressBar value={stats.dailyCompletionRate} max={100} color="blue-500" />

            <View style={tw`flex-row justify-between mt-2`}>
              <View>
                <Text style={tw`text-gray-400`}>Most Productive Day</Text>
                <Text style={tw`text-white font-bold`}>{stats.mostProductiveDay}</Text>
              </View>
              <View>
                <Text style={tw`text-gray-400`}>Weekly Rate</Text>
                <Text style={tw`text-white font-bold`}>{stats.weeklyCompletionRate}%</Text>
              </View>
            </View>
          </View>

          {/* Routines Stats */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="repeat-outline" size={20} color="#8B5CF6" style={tw`mr-2`} />
              <Text style={tw`text-white text-lg font-bold`}>Routines</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Routines Completed Today</Text>
              <Text style={tw`text-white font-bold`}>
                {stats.routinesCompletedToday}/{stats.totalRoutines}
              </Text>
            </View>

            <Text style={tw`text-gray-400 mb-1`}>Completion Rate</Text>
            <StatProgressBar value={stats.routineCompletionRate} max={100} color="purple-500" />

            <View style={tw`mt-2`}>
              <Text style={tw`text-gray-400`}>Most Completed Routine</Text>
              <Text style={tw`text-white font-bold`}>{stats.mostCompletedRoutine}</Text>
            </View>
          </View>

          {/* Timer Stats */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="time-outline" size={20} color="#8B5CF6" style={tw`mr-2`} />
              <Text style={tw`text-white text-lg font-bold`}>Focus Timer</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Focus Sessions Today</Text>
              <Text style={tw`text-white font-bold`}>{stats.focusSessionsToday}</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Focus Time Today</Text>
              <Text style={tw`text-white font-bold`}>{stats.focusTimeToday}</Text>
            </View>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Total Focus Time</Text>
              <Text style={tw`text-white font-bold`}>{stats.totalFocusTime}</Text>
            </View>

            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-400`}>Average Session</Text>
              <Text style={tw`text-white font-bold`}>{stats.averageSessionLength}</Text>
            </View>
          </View>

          {/* Overall Stats */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
            <Text style={tw`text-white text-lg font-bold mb-3`}>Overall Progress</Text>

            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Total Tasks Completed</Text>
              <Text style={tw`text-white font-bold`}>{stats.totalTasksCompleted}</Text>
            </View>

            <Text style={tw`text-gray-400 mb-1`}>Weekly Productivity</Text>
            <StatProgressBar value={stats.weeklyCompletionRate} max={100} color="violet-500" />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

