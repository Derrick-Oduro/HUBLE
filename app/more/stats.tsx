"use client"

import { useState, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, RefreshControl, Dimensions } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

const { width } = Dimensions.get('window')

// Gamified Progress Bar with XP-style animation
const GameProgressBar = ({ value, max, color, label, icon, showLevel = false, colors }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row items-center mb-2`}>
        <View style={[
          tw`w-8 h-8 rounded-lg items-center justify-center mr-3`,
          { backgroundColor: color + '20' }
        ]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={[tw`font-bold text-sm`, { color: colors.text }]}>{label}</Text>
            <Text style={[tw`text-xs font-bold`, { color: color }]}>
              {showLevel ? `LVL ${Math.floor(value / 100) + 1}` : `${value}/${max}`}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[
        tw`h-3 rounded-full overflow-hidden ml-11`,
        { 
          backgroundColor: colors.cardSecondary,
          borderWidth: 1,
          borderColor: color + '30'
        }
      ]}>
        <View
          style={[
            tw`h-full rounded-full`,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 8,
            }
          ]}
        />
      </View>
    </View>
  )
}

// Stat Card Component
const StatCard = ({ icon, label, value, color, subtitle, colors }) => (
  <View style={[
    tw`flex-1 rounded-xl p-3 mr-2 items-center`,
    {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: color + '30',
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }
  ]}>
    <View style={[
      tw`w-12 h-12 rounded-full items-center justify-center mb-2`,
      { 
        backgroundColor: color + '20',
        borderWidth: 2,
        borderColor: color + '50'
      }
    ]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={[tw`text-xl font-black`, { color: colors.text }]}>{value}</Text>
    <Text style={[tw`text-xs font-bold`, { color: color }]}>{label}</Text>
    {subtitle && (
      <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>{subtitle}</Text>
    )}
  </View>
)

// Achievement Badge Component
const AchievementBadge = ({ icon, title, progress, max, color, colors, unlocked = false }) => (
  <TouchableOpacity style={[
    tw`rounded-xl p-3 flex-row items-center mb-2`,
    {
      backgroundColor: unlocked ? color + '20' : colors.cardSecondary,
      borderWidth: 2,
      borderColor: unlocked ? color : colors.cardSecondary,
      opacity: unlocked ? 1 : 0.6,
    }
  ]}>
    <View style={[
      tw`w-12 h-12 rounded-full items-center justify-center mr-3`,
      { 
        backgroundColor: unlocked ? color : colors.textSecondary,
      }
    ]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={unlocked ? "white" : colors.text} 
      />
    </View>
    <View style={tw`flex-1`}>
      <Text style={[tw`font-bold`, { color: colors.text }]}>{title}</Text>
      <View style={[
        tw`h-1.5 rounded-full mt-1 overflow-hidden`,
        { backgroundColor: colors.cardSecondary }
      ]}>
        <View style={[
          tw`h-full rounded-full`,
          {
            width: `${(progress / max) * 100}%`,
            backgroundColor: unlocked ? color : colors.textSecondary,
          }
        ]} />
      </View>
      <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
        {progress}/{max}
      </Text>
    </View>
    {unlocked && (
      <MaterialCommunityIcons name="check-circle" size={20} color={color} />
    )}
  </TouchableOpacity>
)

export default function Stats() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const { stats } = useStats()

  // Add debug logging to see what stats we actually have
  console.log('🔍 Debug Stats:', {
    habitsCompleted: stats.habitsCompleted,
    totalHabits: stats.totalHabits,
    dailiesCompleted: stats.dailiesCompleted,
    totalDailies: stats.totalDailies,
    routinesCompleted: stats.routinesCompleted,
    totalRoutines: stats.totalRoutines,
    allStats: stats
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={tw`flex-row items-center px-5 pt-2 pb-4`}>
        <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-2xl font-black`, { color: colors.text }]}>⚔️ Player Stats</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.accent} 
            colors={[colors.accent]} 
          />
        }
        contentContainerStyle={tw`pb-6`}
      >
        {/* Character Level Card */}
        <View style={[
          tw`mx-5 mb-6 rounded-2xl p-6`,
          {
            backgroundColor: colors.card,
            borderWidth: 3,
            borderColor: '#8B5CF6',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }
        ]}>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={[
              tw`w-20 h-20 rounded-2xl items-center justify-center mr-4`,
              {
                backgroundColor: '#8B5CF620',
                borderWidth: 3,
                borderColor: '#8B5CF6',
              }
            ]}>
              <FontAwesome5 name="user-ninja" size={32} color="#8B5CF6" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-3xl font-black`, { color: colors.text }]}>LEVEL {stats.level}</Text>
              <Text style={[tw`text-lg font-bold`, { color: '#8B5CF6' }]}>HABIT MASTER</Text>
              <View style={tw`flex-row items-center mt-2`}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={[tw`text-sm font-bold ml-1`, { color: colors.textSecondary }]}>
                  {stats.experience} / {stats.maxExperience} XP
                </Text>
              </View>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={tw`mb-4`}>
            <View style={[
              tw`h-4 rounded-full overflow-hidden`,
              { 
                backgroundColor: colors.cardSecondary,
                borderWidth: 2,
                borderColor: '#8B5CF650'
              }
            ]}>
              <View style={[
                tw`h-full rounded-full`,
                {
                  width: `${(stats.experience / stats.maxExperience) * 100}%`,
                  background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
                  backgroundColor: '#8B5CF6',
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 8,
                }
              ]}>
                <View style={[
                  tw`h-full w-full rounded-full opacity-50`,
                  { backgroundColor: '#FFFFFF' }
                ]} />
              </View>
            </View>
          </View>

          {/* Currency Row */}
          <View style={tw`flex-row justify-between`}>
            <View style={tw`items-center`}>
              <Text style={[tw`text-2xl font-black`, { color: '#FFD700' }]}>{stats.gemsEarned}</Text>
              <Text style={[tw`text-xs font-bold`, { color: '#FFD700' }]}>💎 GEMS</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-2xl font-black`, { color: '#F59E0B' }]}>{stats.coinsEarned}</Text>
              <Text style={[tw`text-xs font-bold`, { color: '#F59E0B' }]}>🪙 COINS</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-2xl font-black`, { color: '#EF4444' }]}>{stats.health}</Text>
              <Text style={[tw`text-xs font-bold`, { color: '#EF4444' }]}>❤️ HP</Text>
            </View>
          </View>
        </View>

        {/* Daily Quest Progress */}
        <View style={[
          tw`mx-5 mb-6 rounded-2xl p-5`,
          { 
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: colors.accent + '50'
          }
        ]}>
          <View style={tw`flex-row items-center mb-4`}>
            <MaterialCommunityIcons name="sword-cross" size={24} color={colors.accent} />
            <Text style={[tw`text-xl font-black ml-2`, { color: colors.text }]}>DAILY QUESTS</Text>
          </View>
          
          <GameProgressBar
            value={stats.habitsCompleted}
            max={stats.totalHabits}
            color="#10B981"
            label="Habits Quest"
            icon="checkmark-circle"
            colors={colors}
          />

          <GameProgressBar
            value={stats.dailiesCompleted}
            max={stats.totalDailies}
            color="#3B82F6"
            label="Daily Tasks"
            icon="list"
            colors={colors}
          />

          <GameProgressBar
            value={stats.routinesCompleted}
            max={stats.totalRoutines}
            color="#8B5CF6"
            label="Routine Mastery"
            icon="repeat"
            colors={colors}
          />
        </View>

        {/* Combat Stats */}
        <View style={[
          tw`mx-5 mb-6 rounded-2xl p-5`,
          { 
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: '#F59E0B50'
          }
        ]}>
          <View style={tw`flex-row items-center mb-4`}>
            <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
            <Text style={[tw`text-xl font-black ml-2`, { color: colors.text }]}>BATTLE STATS</Text>
          </View>

          <View style={tw`flex-row mb-4`}>
            <StatCard
              icon="fire"
              label="STREAK"
              value={stats.currentStreak}
              color="#EF4444"
              subtitle="days"
              colors={colors}
            />
            <StatCard
              icon="target"
              label="ACCURACY"
              value={`${stats.weeklyCompletionRate}%`}
              color="#10B981"
              subtitle="weekly"
              colors={colors}
            />
          </View>

          <View style={tw`flex-row`}>
            <StatCard
              icon="timer"
              label="FOCUS"
              value={stats.focusSessionsToday}
              color="#8B5CF6"
              subtitle="sessions"
              colors={colors}
            />
            <StatCard
              icon="clock"
              label="TIME"
              value={`${stats.totalFocusTime}m`}
              color="#F59E0B"
              subtitle="focused"
              colors={colors}
            />
          </View>
        </View>

        {/* Achievement Unlocks */}
        <View style={[
          tw`mx-5 rounded-2xl p-5`,
          { 
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: '#FFD70050'
          }
        ]}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
              <Text style={[tw`text-xl font-black ml-2`, { color: colors.text }]}>ACHIEVEMENTS</Text>
            </View>
            <TouchableOpacity 
              style={[
                tw`px-3 py-2 rounded-lg`,
                { backgroundColor: colors.accent }
              ]}
              onPress={() => router.push('/more/achievements')}
            >
              <Text style={tw`text-white font-bold text-xs`}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <AchievementBadge
            icon="target"
            title="First Steps"
            progress={stats.habitsCompleted}
            max={10}
            color="#10B981"
            colors={colors}
            unlocked={stats.habitsCompleted >= 10}
          />

          <AchievementBadge
            icon="fire"
            title="Streak Master"
            progress={stats.currentStreak}
            max={7}
            color="#EF4444"
            colors={colors}
            unlocked={stats.currentStreak >= 7}
          />

          <AchievementBadge
            icon="brain"
            title="Focus Warrior"
            progress={stats.focusSessionsToday}
            max={5}
            color="#8B5CF6"
            colors={colors}
            unlocked={stats.focusSessionsToday >= 5}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
