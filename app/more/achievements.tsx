"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import React from "react"

export default function Achievements() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()

  // Mock achievements data with better structure
  const achievementCategories = [
    {
      id: 'habits',
      title: 'Habit Master',
      color: '#10B981',
      icon: 'checkmark-circle',
      achievements: [
        { id: 1, title: "First Steps", description: "Complete your first habit", unlocked: true, progress: 1, total: 1 },
        { id: 2, title: "Week Warrior", description: "Complete habits for 7 days straight", unlocked: true, progress: 7, total: 7 },
        { id: 3, title: "Month Champion", description: "Complete habits for 30 days", unlocked: false, progress: 15, total: 30 },
        { id: 4, title: "Habit Legend", description: "Complete habits for 100 days", unlocked: false, progress: 15, total: 100 },
      ]
    },
    {
      id: 'focus',
      title: 'Focus Expert',
      color: '#F59E0B',
      icon: 'timer',
      achievements: [
        { id: 5, title: "Focused Mind", description: "Complete 10 focus sessions", unlocked: true, progress: 10, total: 10 },
        { id: 6, title: "Deep Worker", description: "Focus for 5 hours in a day", unlocked: false, progress: 2, total: 5 },
        { id: 7, title: "Concentration King", description: "Complete 100 focus sessions", unlocked: false, progress: 25, total: 100 },
      ]
    },
    {
      id: 'level',
      title: 'Level Master',
      color: '#8B5CF6',
      icon: 'trending-up',
      achievements: [
        { id: 8, title: "Level Up!", description: "Reach level 5", unlocked: true, progress: 5, total: 5 },
        { id: 9, title: "XP Hunter", description: "Earn 1000 XP", unlocked: false, progress: 450, total: 1000 },
        { id: 10, title: "Elite Status", description: "Reach level 20", unlocked: false, progress: 5, total: 20 },
      ]
    }
  ]

  const getProgressPercentage = (progress: number, total: number) => {
    return Math.min(100, (progress / total) * 100)
  }

  const totalAchievements = achievementCategories.reduce((sum, cat) => sum + cat.achievements.length, 0)
  const unlockedAchievements = achievementCategories.reduce(
    (sum, cat) => sum + cat.achievements.filter(a => a.unlocked).length, 0
  )

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Achievements</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Overall Progress */}
          <View style={[
            tw`rounded-2xl p-6 mb-6`,
            {
              backgroundColor: colors.card,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                {
                  backgroundColor: '#F59E0B20',
                  borderWidth: 2,
                  borderColor: '#F59E0B',
                }
              ]}>
                <Ionicons name="trophy" size={28} color="#F59E0B" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Achievement Hunter</Text>
                <Text style={[{ color: colors.textSecondary }]}>
                  {unlockedAchievements}/{totalAchievements} unlocked
                </Text>
              </View>
            </View>

            <View style={tw`mb-3`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`font-medium`, { color: colors.text }]}>Overall Progress</Text>
                <Text style={tw`text-yellow-400 font-bold`}>
                  {Math.round((unlockedAchievements / totalAchievements) * 100)}%
                </Text>
              </View>
              <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                <View
                  style={[
                    tw`h-full bg-yellow-500 rounded-full`,
                    {
                      width: `${(unlockedAchievements / totalAchievements) * 100}%`,
                      shadowColor: '#F59E0B',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Achievement Categories */}
          {achievementCategories.map((category) => (
            <View key={category.id} style={[
              tw`rounded-2xl p-5 mb-6`,
              { backgroundColor: colors.card }
            ]}>
              <View style={tw`flex-row items-center mb-4`}>
                <View style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                  { backgroundColor: `${category.color}20` }
                ]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{category.title}</Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                    {category.achievements.filter(a => a.unlocked).length}/{category.achievements.length} completed
                  </Text>
                </View>
              </View>

              {category.achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    tw`p-4 rounded-xl mb-3`,
                    {
                      backgroundColor: achievement.unlocked ? `${category.color}10` : colors.cardSecondary,
                      borderWidth: achievement.unlocked ? 1 : 0,
                      borderColor: achievement.unlocked ? category.color : 'transparent',
                    }
                  ]}
                >
                  <View style={tw`flex-row items-center justify-between mb-2`}>
                    <View style={tw`flex-1 mr-3`}>
                      <Text style={[
                        tw`font-bold text-base`,
                        { color: achievement.unlocked ? category.color : colors.text }
                      ]}>
                        {achievement.title}
                      </Text>
                      <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                        {achievement.description}
                      </Text>
                    </View>
                    {achievement.unlocked ? (
                      <View style={[
                        tw`w-10 h-10 rounded-full items-center justify-center`,
                        { backgroundColor: category.color }
                      ]}>
                        <Ionicons name="checkmark" size={20} color="white" />
                      </View>
                    ) : (
                      <View style={[
                        tw`w-10 h-10 rounded-full border-2 items-center justify-center`,
                        { borderColor: colors.textSecondary }
                      ]}>
                        <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                          {Math.round(getProgressPercentage(achievement.progress, achievement.total))}%
                        </Text>
                      </View>
                    )}
                  </View>

                  {!achievement.unlocked && (
                    <View>
                      <View style={[tw`h-1.5 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                        <View
                          style={[
                            tw`h-full rounded-full`,
                            {
                              width: `${getProgressPercentage(achievement.progress, achievement.total)}%`,
                              backgroundColor: category.color,
                            }
                          ]}
                        />
                      </View>
                      <Text style={[tw`text-xs mt-1 text-right`, { color: colors.textSecondary }]}>
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
