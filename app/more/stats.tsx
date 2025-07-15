"use client"

import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

// Enhanced Progress Bar Component
const StatProgressBar = ({ value, max, color, label, showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`text-white font-medium`}>{label}</Text>
        <Text style={tw`text-gray-400 text-sm`}>
          {showPercentage ? `${Math.round(percentage)}%` : `${value}/${max}`}
        </Text>
      </View>
      <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden`}>
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
        {/* Header */}
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
          {/* Level & XP Card */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-6 mb-6`,
            {
              backgroundColor: '#1F2937',
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
                <Text style={tw`text-white text-2xl font-bold`}>Level {stats.level}</Text>
                <Text style={tw`text-gray-400`}>
                  {stats.experience}/{stats.maxExperience} XP
                </Text>
              </View>
            </View>

            <View style={tw`mb-3`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-white font-medium`}>Experience Progress</Text>
                <Text style={tw`text-violet-400 font-bold`}>
                  {Math.round((stats.experience / stats.maxExperience) * 100)}%
                </Text>
              </View>
              <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden`}>
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

            <View style={tw`flex-row justify-between pt-3 border-t border-gray-700`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{stats.gemsEarned}</Text>
                <Text style={tw`text-gray-400 text-xs`}>💎 Gems</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{stats.coinsEarned}</Text>
                <Text style={tw`text-gray-400 text-xs`}>🪙 Coins</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{stats.health}</Text>
                <Text style={tw`text-gray-400 text-xs`}>❤️ Health</Text>
              </View>
            </View>
          </View>

          {/* Activity Overview */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>Today's Activity</Text>
            
            <StatProgressBar
              value={stats.habitsCompleted}
              max={stats.totalHabits}
              color="#10B981"
              label="Habits Completed"
              showPercentage={false}
            />

            <StatProgressBar
              value={stats.dailiesCompleted}
              max={stats.totalDailies}
              color="#3B82F6"
              label="Daily Tasks"
              showPercentage={false}
            />

            <StatProgressBar
              value={stats.routinesCompleted}
              max={stats.totalRoutines}
              color="#8B5CF6"
              label="Routines Completed"
              showPercentage={false}
            />

            <StatProgressBar
              value={stats.health}
              max={stats.maxHealth}
              color="#EF4444"
              label="Health Level"
            />
          </View>

          {/* Focus & Productivity */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>Focus & Productivity</Text>
            
            <View style={tw`flex-row justify-between mb-4`}>
              <View style={tw`flex-1 items-center`}>
                <View style={[
                  tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                  { backgroundColor: '#F59E0B20' }
                ]}>
                  <Ionicons name="timer-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={tw`text-white text-lg font-bold`}>{stats.focusSessionsToday}</Text>
                <Text style={tw`text-gray-400 text-sm text-center`}>Focus Sessions</Text>
              </View>
              
              <View style={tw`flex-1 items-center`}>
                <View style={[
                  tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                  { backgroundColor: '#EC489920' }
                ]}>
                  <Ionicons name="time-outline" size={24} color="#EC4899" />
                </View>
                <Text style={tw`text-white text-lg font-bold`}>{stats.totalFocusTime}m</Text>
                <Text style={tw`text-gray-400 text-sm text-center`}>Focus Time</Text>
              </View>
            </View>
          </View>

          {/* Weekly Summary */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>Weekly Summary</Text>
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-gray-400`}>Completion Rate</Text>
              <Text style={tw`text-white font-bold`}>{stats.weeklyCompletionRate}%</Text>
            </View>
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-gray-400`}>Current Streak</Text>
              <Text style={tw`text-white font-bold`}>{stats.currentStreak} days</Text>
            </View>
            
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-gray-400`}>Longest Streak</Text>
              <Text style={tw`text-white font-bold`}>{stats.longestStreak} days</Text>
            </View>
          </View>

          {/* Achievement Progress */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>Achievements</Text>
            
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-gray-400`}>Unlocked Achievements</Text>
              <Text style={tw`text-white font-bold`}>{stats.totalAchievements}</Text>
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
