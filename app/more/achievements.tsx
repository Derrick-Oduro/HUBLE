"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Modal, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"

import { achievementsAPI } from "../../lib/api"

const CATEGORY_META = {
  habits: { title: 'Habit Master', icon: 'checkmark-circle' },
  focus: { title: 'Focus Expert', icon: 'timer' },
  level: { title: 'Level Master', icon: 'trending-up' },
  dailies: { title: 'Daily Dedication', icon: 'calendar' },
  routines: { title: 'Routine Champion', icon: 'list' },
  social: { title: 'Social Star', icon: 'people' },
}

export default function Achievements() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [achievementCategories, setAchievementCategories] = useState([])
  const [totalAchievements, setTotalAchievements] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState(0)
  const [celebrationQueue, setCelebrationQueue] = useState<any[]>([])
  const [activeCelebration, setActiveCelebration] = useState<any | null>(null)

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const response = await achievementsAPI.getAchievements()
      
      if (response.success) {
        // Convert backend grouped data to frontend format
        const categories = Object.keys(response.achievements).map(categoryKey => {
          const meta = CATEGORY_META[categoryKey] || { title: categoryKey, icon: 'star' };
          return {
            id: categoryKey,
            title: meta.title,
            color: response.achievements[categoryKey][0]?.color || '#10B981',
            icon: meta.icon,
            achievements: response.achievements[categoryKey]
          };
        });

        setAchievementCategories(categories)
        setTotalAchievements(response.stats.total)
        setUnlockedAchievements(response.stats.unlocked)

        const unlockedList = categories.flatMap((category) =>
          category.achievements
            .filter((achievement: any) => achievement.unlocked)
            .map((achievement: any) => ({
              ...achievement,
              categoryTitle: category.title,
              color: achievement.color || category.color,
            })),
        )

        const seenRaw = await AsyncStorage.getItem("seenAchievementIds")
        const seenIds = new Set(seenRaw ? JSON.parse(seenRaw) : [])
        const newUnlocks = unlockedList.filter((achievement: any) => !seenIds.has(achievement.id))

        if (newUnlocks.length > 0) {
          setCelebrationQueue(newUnlocks)
          setActiveCelebration(newUnlocks[0])
        }

        await AsyncStorage.setItem("seenAchievementIds", JSON.stringify(unlockedList.map((achievement: any) => achievement.id)))
      }
    } catch (error) {
      console.error("Failed to load achievements:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  const getProgressPercentage = (progress: number, total: number) => {
    return Math.min(100, (progress / total) * 100)
  }

  const shareAchievement = async () => {
    if (!activeCelebration) return

    try {
      await Share.share({
        message: `I just unlocked \"${activeCelebration.title}\" in HUBLE. Staying consistent is paying off.`,
      })
    } catch (error) {
      console.error("Failed to share achievement:", error)
    }
  }

  const closeCelebration = () => {
    const [, ...remaining] = celebrationQueue
    setCelebrationQueue(remaining)
    setActiveCelebration(remaining[0] || null)
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[tw`mt-4`, { color: colors.text }]}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
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
                  {totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0}%
                </Text>
              </View>
              <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                <View
                  style={[
                    tw`h-full bg-yellow-500 rounded-full`,
                    {
                      width: `${totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0}%`,
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

      <Modal
        visible={!!activeCelebration}
        transparent
        animationType="fade"
        onRequestClose={closeCelebration}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-55 px-6`}>
          <View
            style={[
              tw`w-full rounded-3xl p-6 items-center`,
              {
                backgroundColor: colors.card,
                borderWidth: 2,
                borderColor: activeCelebration?.color || colors.accent,
              },
            ]}
          >
            <View style={tw`flex-row mb-3`}>
              {[0, 1, 2, 3, 4].map((index) => (
                <Ionicons
                  key={index}
                  name="sparkles"
                  size={18}
                  color={activeCelebration?.color || colors.accent}
                  style={tw`mx-1`}
                />
              ))}
            </View>

            <View
              style={[
                tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                { backgroundColor: (activeCelebration?.color || colors.accent) + "20" },
              ]}
            >
              <Ionicons name="trophy" size={40} color={activeCelebration?.color || colors.accent} />
            </View>

            <Text style={[tw`text-xs font-bold uppercase tracking-wide`, { color: colors.textSecondary }]}>Achievement unlocked</Text>
            <Text style={[tw`text-2xl font-bold mt-2 text-center`, { color: colors.text }]}>{activeCelebration?.title}</Text>
            <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
              {activeCelebration?.description}
            </Text>

            <View style={tw`flex-row w-full mt-6`}>
              <TouchableOpacity
                style={[tw`flex-1 py-3 rounded-xl mr-2`, { backgroundColor: colors.cardSecondary }]}
                onPress={closeCelebration}
              >
                <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[tw`flex-1 py-3 rounded-xl ml-2`, { backgroundColor: activeCelebration?.color || colors.accent }]}
                onPress={shareAchievement}
              >
                <Text style={tw`text-center font-semibold text-white`}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

