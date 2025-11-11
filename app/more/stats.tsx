"use client"

import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider" // ← ONLY ADDITION: Theme import
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

// Enhanced Progress Bar Component
const StatProgressBar = ({ value, max, color, label, showPercentage = true, colors }) => { // ← Add colors prop
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={[tw`font-medium`, { color: colors.text }]}>{label}</Text> {/* ← Use theme color */}
        <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
          {showPercentage ? `${Math.round(percentage)}%` : `${value}/${max}`}
        </Text>
      </View>
      <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}> {/* ← Use theme color */}
        <View
          style={[
            tw`h-full rounded-full`,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
        />
      </View>
    </View>
  )
}

export default function Stats() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme() // ← ONLY ADDITION: Theme hook
  const [refreshing, setRefreshing] = useState(false)
  const { stats, refreshStats } = useStats()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshStats()
    setRefreshing(false)
  }, [refreshStats])

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> {/* ← Use theme color */}
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} /> {/* ← Theme status bar */}
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} /> {/* ← Use theme color */}
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Stats & Analytics</Text> {/* ← Use theme color */}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
          }
        >
          {/* Level & XP Card */}
          <View style={[
            tw`rounded-2xl p-6 mb-6`,
            {
              backgroundColor: colors.card, // ← Use theme color
              shadowColor: '#8B5CF6',
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
                  backgroundColor: '#8B5CF620',
                  borderWidth: 2,
                  borderColor: '#8B5CF6',
                }
              ]}>
                <Text style={tw`text-violet-400 text-xl font-bold`}>{stats.level}</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Level {stats.level}</Text> {/* ← Use theme color */}
                <Text style={[{ color: colors.textSecondary }]}>
                  {stats.experience}/{stats.maxExperience} XP
                </Text>
              </View>
            </View>

            <View style={tw`mb-3`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`font-medium`, { color: colors.text }]}>Experience Progress</Text> {/* ← Use theme color */}
                <Text style={tw`text-violet-400 font-bold`}>
                  {Math.round((stats.experience / stats.maxExperience) * 100)}%
                </Text>
              </View>
              <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}> {/* ← Use theme color */}
                <View
                  style={[
                    tw`h-full bg-violet-500 rounded-full`,
                    {
                      width: `${(stats.experience / stats.maxExperience) * 100}%`,
                      shadowColor: '#8B5CF6',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  ]}
                />
              </View>
            </View>

            <View style={[tw`flex-row justify-between pt-3 border-t`, { borderColor: colors.cardSecondary }]}> {/* ← Use theme color */}
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.gemsEarned}</Text> {/* ← Use theme color */}
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>💎 Gems</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.coinsEarned}</Text> {/* ← Use theme color */}
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>🪙 Coins</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.health}</Text> {/* ← Use theme color */}
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>❤️ Health</Text>
              </View>
            </View>
          </View>

          {/* Activity Overview */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card } // ← Use theme color
          ]}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Today's Activity</Text> {/* ← Use theme color */}
            
            <StatProgressBar
              value={stats.habitsCompleted}
              max={stats.totalHabits}
              color="#10B981"
              label="Habits Completed"
              showPercentage={false}
              colors={colors} // ← Pass colors
            />

            <StatProgressBar
              value={stats.dailiesCompleted}
              max={stats.totalDailies}
              color="#3B82F6"
              label="Daily Tasks"
              showPercentage={false}
              colors={colors} // ← Pass colors
            />

            <StatProgressBar
              value={stats.routinesCompleted}
              max={stats.totalRoutines}
              color="#8B5CF6"
              label="Routines Completed"
              showPercentage={false}
              colors={colors} // ← Pass colors
            />

            <StatProgressBar
              value={stats.health}
              max={stats.maxHealth}
              color="#EF4444"
              label="Health Level"
              colors={colors} // ← Pass colors
            />
          </View>

          {/* Focus & Productivity */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card } // ← Use theme color
          ]}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Focus & Productivity</Text> {/* ← Use theme color */}
            
            <View style={tw`flex-row justify-between mb-4`}>
              <View style={tw`flex-1 items-center`}>
                <View style={[
                  tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                  { backgroundColor: '#F59E0B20' }
                ]}>
                  <Ionicons name="timer-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.focusSessionsToday}</Text> {/* ← Use theme color */}
                <Text style={[tw`text-sm text-center`, { color: colors.textSecondary }]}>Focus Sessions</Text>
              </View>
              
              <View style={tw`flex-1 items-center`}>
                <View style={[
                  tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                  { backgroundColor: '#EC489920' }
                ]}>
                  <Ionicons name="time-outline" size={24} color="#EC4899" />
                </View>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.totalFocusTime}m</Text> {/* ← Use theme color */}
                <Text style={[tw`text-sm text-center`, { color: colors.textSecondary }]}>Focus Time</Text>
              </View>
            </View>
          </View>

          {/* Weekly Summary */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card } // ← Use theme color
          ]}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Weekly Summary</Text> {/* ← Use theme color */}
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={[{ color: colors.textSecondary }]}>Completion Rate</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>{stats.weeklyCompletionRate}%</Text> {/* ← Use theme color */}
            </View>
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={[{ color: colors.textSecondary }]}>Current Streak</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>{stats.currentStreak} days</Text> {/* ← Use theme color */}
            </View>
            
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={[{ color: colors.textSecondary }]}>Longest Streak</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>{stats.longestStreak} days</Text> {/* ← Use theme color */}
            </View>
          </View>

          {/* Achievement Progress */}
          <View style={[
            tw`rounded-2xl p-5`,
            { backgroundColor: colors.card } // ← Use theme color
          ]}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Achievements</Text> {/* ← Use theme color */}
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={[{ color: colors.textSecondary }]}>Unlocked Achievements</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>{stats.totalAchievements}</Text> {/* ← Use theme color */}
            </View>
            
            <TouchableOpacity 
              style={[
                tw`bg-violet-600 rounded-xl p-3 flex-row items-center justify-center`,
                {
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
              onPress={() => router.push('/more/achievements')}
            >
              <Ionicons name="trophy-outline" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold`}>View All Achievements</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
