"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Achievements() {
  const router = useRouter()
  const { stats, refreshStats } = useStats()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  // Define all possible achievements
  const allAchievements = [
    // Habit achievements
    {
      id: "habit_starter",
      title: "Habit Starter",
      description: "Create your first habit",
      progress: 0,
      total: 1,
      icon: "add-circle-outline",
      category: "habits",
      unlocked: false,
    },
    {
      id: "habit_collector",
      title: "Habit Collector",
      description: "Create 5 habits",
      progress: 0,
      total: 5,
      icon: "list-outline",
      category: "habits",
      unlocked: false,
    },
    {
      id: "habit_master",
      title: "Habit Master",
      description: "Complete all daily habits for 5 consecutive days",
      progress: 0,
      total: 5,
      icon: "checkmark-circle-outline",
      category: "habits",
      unlocked: false,
    },

    // Daily achievements
    {
      id: "daily_starter",
      title: "Daily Starter",
      description: "Complete your first daily task",
      progress: 0,
      total: 1,
      icon: "today-outline",
      category: "dailies",
      unlocked: false,
    },
    {
      id: "daily_streak",
      title: "Daily Streak",
      description: "Complete all daily tasks for 3 consecutive days",
      progress: 0,
      total: 3,
      icon: "flame-outline",
      category: "dailies",
      unlocked: false,
    },
    {
      id: "daily_champion",
      title: "Daily Champion",
      description: "Complete 50 daily tasks",
      progress: 0,
      total: 50,
      icon: "trophy-outline",
      category: "dailies",
      unlocked: false,
    },

    // Routine achievements
    {
      id: "morning_person",
      title: "Morning Person",
      description: "Complete a morning routine for 7 consecutive days",
      progress: 0,
      total: 7,
      icon: "sunny-outline",
      category: "routines",
      unlocked: false,
    },
    {
      id: "routine_builder",
      title: "Routine Builder",
      description: "Create 3 different routines",
      progress: 0,
      total: 3,
      icon: "repeat-outline",
      category: "routines",
      unlocked: false,
    },
    {
      id: "routine_master",
      title: "Routine Master",
      description: "Complete 10 routine tasks in a single day",
      progress: 0,
      total: 10,
      icon: "calendar-outline",
      category: "routines",
      unlocked: false,
    },

    // Timer achievements
    {
      id: "focus_novice",
      title: "Focus Novice",
      description: "Complete your first focus session",
      progress: 0,
      total: 1,
      icon: "timer-outline",
      category: "timer",
      unlocked: false,
    },
    {
      id: "focus_adept",
      title: "Focus Adept",
      description: "Complete 10 focus sessions",
      progress: 0,
      total: 10,
      icon: "hourglass-outline",
      category: "timer",
      unlocked: false,
    },
    {
      id: "focus_master",
      title: "Focus Master",
      description: "Accumulate 5 hours of focus time",
      progress: 0,
      total: 5,
      icon: "time-outline",
      category: "timer",
      unlocked: false,
    },

    // Level achievements
    {
      id: "level_up",
      title: "Level Up",
      description: "Reach level 5",
      progress: 0,
      total: 5,
      icon: "trending-up-outline",
      category: "level",
      unlocked: false,
    },
    {
      id: "level_master",
      title: "Level Master",
      description: "Reach level 10",
      progress: 0,
      total: 10,
      icon: "star-outline",
      category: "level",
      unlocked: false,
    },

    // Streak achievements
    {
      id: "consistency_novice",
      title: "Consistency Novice",
      description: "Maintain a 3-day streak",
      progress: 0,
      total: 3,
      icon: "flame-outline",
      category: "streak",
      unlocked: false,
    },
    {
      id: "consistency_master",
      title: "Consistency Master",
      description: "Maintain a 10-day streak",
      progress: 0,
      total: 10,
      icon: "bonfire-outline",
      category: "streak",
      unlocked: false,
    },
  ]

  // Load achievements from AsyncStorage or initialize them
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true)

        // Try to load saved achievements
        const savedAchievements = await AsyncStorage.getItem("achievements")

        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements))
        } else {
          // Initialize achievements if none exist
          setAchievements(allAchievements)
          await AsyncStorage.setItem("achievements", JSON.stringify(allAchievements))
        }
      } catch (error) {
        console.error("Failed to load achievements:", error)
        // Fall back to default achievements
        setAchievements(allAchievements)
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [])

  // Update achievements based on app data
  useEffect(() => {
    const updateAchievements = async () => {
      if (loading || achievements.length === 0) return

      let updatedAchievements = [...achievements]
      let achievementUnlocked = false

      // Load app data to check achievement progress
      try {
        // Load habits data
        const habitsData = await AsyncStorage.getItem("habitsData")
        const habits = habitsData ? JSON.parse(habitsData) : []

        // Load dailies data
        const dailiesData = await AsyncStorage.getItem("dailiesData")
        const dailies = dailiesData ? JSON.parse(dailiesData) : []

        // Load routines data
        const routinesData = await AsyncStorage.getItem("routinesData")
        const routines = routinesData ? JSON.parse(routinesData) : {}

        // Load timer stats
        const timerStats = await AsyncStorage.getItem("timerStats")
        const timer = timerStats ? JSON.parse(timerStats) : { totalSessionsToday: 0, streak: 0 }

        // Update habit achievements
        updatedAchievements = updatedAchievements.map((achievement) => {
          if (achievement.category === "habits") {
            switch (achievement.id) {
              case "habit_starter":
                achievement.progress = habits.length > 0 ? 1 : 0
                achievement.unlocked = habits.length > 0
                break
              case "habit_collector":
                achievement.progress = Math.min(habits.length, 5)
                achievement.unlocked = habits.length >= 5
                break
              case "habit_master":
                achievement.progress = stats.currentHabitStreak
                achievement.unlocked = stats.currentHabitStreak >= 5
                break
            }
          }

          // Update dailies achievements
          else if (achievement.category === "dailies") {
            switch (achievement.id) {
              case "daily_starter":
                achievement.progress = stats.completedDailiesToday > 0 ? 1 : 0
                achievement.unlocked = stats.completedDailiesToday > 0
                break
              case "daily_streak":
                // This would need a proper streak tracking mechanism
                achievement.progress = Math.min(stats.currentHabitStreak, 3)
                achievement.unlocked = stats.currentHabitStreak >= 3
                break
              case "daily_champion":
                achievement.progress = Math.min(stats.totalTasksCompleted, 50)
                achievement.unlocked = stats.totalTasksCompleted >= 50
                break
            }
          }

          // Update routines achievements
          else if (achievement.category === "routines") {
            const routinesArray = Object.values(routines)
            switch (achievement.id) {
              case "routine_builder":
                achievement.progress = Math.min(routinesArray.length, 3)
                achievement.unlocked = routinesArray.length >= 3
                break
              case "morning_person":
                // This would need proper tracking of morning routine completion
                achievement.progress = Math.min(stats.routineCompletionRate >= 80 ? 7 : 0, 7)
                achievement.unlocked = stats.routineCompletionRate >= 80
                break
              case "routine_master":
                // Assuming routinesCompletedToday is a good proxy for tasks completed
                achievement.progress = Math.min(stats.routinesCompletedToday * 3, 10) // Estimate 3 tasks per routine
                achievement.unlocked = stats.routinesCompletedToday * 3 >= 10
                break
            }
          }

          // Update timer achievements
          else if (achievement.category === "timer") {
            switch (achievement.id) {
              case "focus_novice":
                achievement.progress = stats.focusSessionsToday > 0 ? 1 : 0
                achievement.unlocked = stats.focusSessionsToday > 0
                break
              case "focus_adept":
                achievement.progress = Math.min(stats.focusSessionsToday, 10)
                achievement.unlocked = stats.focusSessionsToday >= 10
                break
              case "focus_master":
                // This would need proper tracking of total focus time
                const focusHours = stats.focusTimeToday ? Number.parseInt(stats.focusTimeToday.split("h")[0]) || 0 : 0
                achievement.progress = Math.min(focusHours, 5)
                achievement.unlocked = focusHours >= 5
                break
            }
          }

          // Update level achievements
          else if (achievement.category === "level") {
            switch (achievement.id) {
              case "level_up":
                achievement.progress = Math.min(stats.level, 5)
                achievement.unlocked = stats.level >= 5
                break
              case "level_master":
                achievement.progress = Math.min(stats.level, 10)
                achievement.unlocked = stats.level >= 10
                break
            }
          }

          // Update streak achievements
          else if (achievement.category === "streak") {
            const currentStreak = Math.max(stats.currentHabitStreak, timer.streak || 0)
            switch (achievement.id) {
              case "consistency_novice":
                achievement.progress = Math.min(currentStreak, 3)
                achievement.unlocked = currentStreak >= 3
                break
              case "consistency_master":
                achievement.progress = Math.min(currentStreak, 10)
                achievement.unlocked = currentStreak >= 10
                break
            }
          }

          // Check if this achievement was just unlocked
          if (achievement.unlocked && !achievements.find((a) => a.id === achievement.id).unlocked) {
            achievementUnlocked = true
          }

          return achievement
        })

        // Save updated achievements
        await AsyncStorage.setItem("achievements", JSON.stringify(updatedAchievements))
        setAchievements(updatedAchievements)

        // Show notification if an achievement was unlocked
        if (achievementUnlocked) {
          Alert.alert(
            "Achievement Unlocked!",
            "You've unlocked a new achievement. Check it out in the Achievements section!",
            [{ text: "OK" }],
          )
        }
      } catch (error) {
        console.error("Failed to update achievements:", error)
      }
    }

    updateAchievements()
  }, [stats, loading, achievements])

  // Function to get the appropriate color for achievement rarity/category
  const getAchievementColor = (category) => {
    switch (category) {
      case "habits":
        return "green"
      case "dailies":
        return "blue"
      case "routines":
        return "purple"
      case "timer":
        return "yellow"
      case "level":
        return "red"
      case "streak":
        return "orange"
      default:
        return "violet"
    }
  }

  // Group achievements by category for display
  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const category = achievement.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(achievement)
    return groups
  }, {})

  // Function to get category title
  const getCategoryTitle = (category) => {
    switch (category) {
      case "habits":
        return "Habit Achievements"
      case "dailies":
        return "Daily Task Achievements"
      case "routines":
        return "Routine Achievements"
      case "timer":
        return "Focus Timer Achievements"
      case "level":
        return "Level Achievements"
      case "streak":
        return "Streak Achievements"
      default:
        return `${category.charAt(0).toUpperCase() + category.slice(1)} Achievements`
    }
  }

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
          {/* Achievement stats summary */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
            <Text style={tw`text-white text-lg font-bold mb-2`}>Achievement Progress</Text>
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Unlocked</Text>
              <Text style={tw`text-white font-bold`}>
                {achievements.filter((a) => a.unlocked).length}/{achievements.length}
              </Text>
            </View>
            <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden mb-1`}>
              <View
                style={[
                  tw`h-full rounded-full bg-violet-600`,
                  { width: `${(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Display achievements by category */}
          {Object.keys(groupedAchievements).map((category) => (
            <View key={category}>
              <Text style={tw`text-white text-lg font-bold mb-3`}>{getCategoryTitle(category)}</Text>

              {groupedAchievements[category].map((achievement) => (
                <View
                  key={achievement.id}
                  style={tw`bg-gray-800 rounded-xl p-4 mb-4 ${achievement.unlocked ? `border border-${getAchievementColor(category)}-600` : ""}`}
                >
                  <View style={tw`flex-row items-center mb-2`}>
                    <View
                      style={tw`bg-${achievement.unlocked ? getAchievementColor(category) : "gray"}-700 p-2 rounded-full mr-3`}
                    >
                      <Ionicons
                        name={achievement.icon}
                        size={24}
                        color={achievement.unlocked ? `#${getIconColor(getAchievementColor(category))}` : "white"}
                      />
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
                            tw`bg-${getAchievementColor(category)}-600 h-full rounded-full`,
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
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// Helper function to get icon color based on category color
function getIconColor(color) {
  switch (color) {
    case "green":
      return "10B981" // green-500
    case "blue":
      return "3B82F6" // blue-500
    case "purple":
      return "8B5CF6" // violet-500
    case "yellow":
      return "F59E0B" // amber-500
    case "red":
      return "EF4444" // red-500
    case "orange":
      return "F97316" // orange-500
    default:
      return "8B5CF6" // violet-500
  }
}
