import React, { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import tw from '../lib/tailwind'
import { useStats } from '../contexts/StatsProvider'
import { useTheme } from '../contexts/ThemeProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CharacterPanelProps {
  completedCount: number
  totalCount: number
  taskType: 'habits' | 'dailies' | 'routines'
}

export default function CharacterPanel({ completedCount, totalCount, taskType }: CharacterPanelProps) {
  const { colors, isGlowEnabled } = useTheme()
  const { stats } = useStats()
  const [avatarData, setAvatarData] = useState({
    avatar: "🧙‍♂️",
    color: "#8B5CF6",
    border: "normal"
  })

  // Load avatar data
  useEffect(() => {
    loadAvatarData()
    // Refresh avatar every few seconds in case it was updated
    const interval = setInterval(loadAvatarData, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadAvatarData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('avatarData')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setAvatarData({
          avatar: parsed.avatar || "🧙‍♂️",
          color: parsed.color || "#8B5CF6",
          border: parsed.border || "normal"
        })
      }
    } catch (error) {
      console.log('Error loading avatar data:', error)
    }
  }

  // Smart color functions for progress bars
  const getHealthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage > 70) return '#22c55e' // green-500
    if (percentage > 40) return '#eab308' // yellow-500
    if (percentage > 15) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const getExpColor = (progress: number) => {
    if (progress > 80) return '#8b5cf6' // violet-500
    if (progress > 50) return '#3b82f6' // blue-500
    return '#eab308' // yellow-500
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return colors.success
    if (percentage > 70) return '#22c55e' // green-500
    if (percentage > 40) return colors.accent
    return '#f97316' // orange-500
  }

  // Calculate completion percentage
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Get task type display text
  const getTaskTypeText = () => {
    switch (taskType) {
      case 'habits':
        return 'habits'
      case 'dailies':
        return 'dailies'
      case 'routines':
        return 'routines'
      default:
        return 'tasks'
    }
  }

  const getTaskTypeAction = () => {
    switch (taskType) {
      case 'habits':
        return 'completed'
      case 'dailies':
        return 'completed'
      case 'routines':
        return 'completed'
      default:
        return 'done'
    }
  }

  return (
    <View style={[
      tw`rounded-xl p-3 mb-3`, // Compact padding
      { 
        backgroundColor: colors.card,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isGlowEnabled ? 0.1 : 0,
        shadowRadius: isGlowEnabled ? 4 : 0,
        elevation: isGlowEnabled ? 3 : 0,
      }
    ]}>
      {/* Header with Level and Title */}
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
            Level {stats.level} Hero
          </Text>
          <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
            {completedCount}/{totalCount} {getTaskTypeText()} {getTaskTypeAction()} today
          </Text>
        </View>
        
        {/* Currency Display */}
        <View style={tw`items-end`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Ionicons name="diamond" size={14} color="#A78BFA" style={tw`mr-1`} />
            <Text style={[tw`text-xs font-bold`, { color: colors.text }]}>
              {stats.gemsEarned}
            </Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="logo-usd" size={14} color="#F59E0B" style={tw`mr-1`} />
            <Text style={[tw`text-xs font-bold`, { color: colors.text }]}>
              {stats.coinsEarned}
            </Text>
          </View>
        </View>
      </View>

      {/* Character Avatar and Stats Row */}
      <View style={tw`flex-row items-center mb-3`}>
        {/* Avatar Section */}
        <View style={tw`mr-3`}>
          <View style={[
            tw`w-14 h-14 rounded-2xl items-center justify-center`,
            { 
              backgroundColor: avatarData.color + '20',
              borderWidth: avatarData.border === 'glow' ? 3 : avatarData.border === 'rainbow' ? 2.5 : 2,
              borderColor: avatarData.color,
              shadowColor: isGlowEnabled && avatarData.border === 'glow' ? avatarData.color : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isGlowEnabled ? 0.8 : 0,
              shadowRadius: isGlowEnabled ? 10 : 0,
            }
          ]}>
            <Text style={tw`text-3xl`}>{avatarData.avatar}</Text>
          </View>
          
          {/* Streak indicator under avatar */}
          <View style={[
            tw`mt-1.5 px-1.5 py-0.5 rounded-full items-center flex-row`,
            { backgroundColor: avatarData.color + '20' }
          ]}>
            <Ionicons name="flame" size={10} color={avatarData.color} style={tw`mr-0.5`} />
            <Text style={[tw`text-xs font-bold`, { color: avatarData.color }]}>
              {stats.currentStreak}
            </Text>
          </View>
        </View>

        {/* Progress Bars Section */}
        <View style={tw`flex-1`}>
          {/* Health Bar */}
          <View style={tw`mb-2`}>
            <View style={tw`flex-row justify-between items-center mb-0.5`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="heart" size={12} color="#EF4444" style={tw`mr-1`} />
                <Text style={[tw`text-xs font-semibold`, { color: colors.text }]}>
                  Health
                </Text>
              </View>
              <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                {stats.health || 100}/{stats.maxHealth || 100}
              </Text>
            </View>
            
            <View style={[
              tw`h-2 rounded-full overflow-hidden`,
              { backgroundColor: colors.cardSecondary }
            ]}>
              <View
                style={[
                  tw`h-full rounded-full transition-all`,
                  {
                    width: `${Math.min(((stats.health || 100) / (stats.maxHealth || 100)) * 100, 100)}%`,
                    backgroundColor: getHealthColor(stats.health || 100, stats.maxHealth || 100),
                  }
                ]}
              />
            </View>
          </View>

          {/* Experience Bar */}
          <View>
            <View style={tw`flex-row justify-between items-center mb-0.5`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="flash" size={12} color="#F59E0B" style={tw`mr-1`} />
                <Text style={[tw`text-xs font-semibold`, { color: colors.text }]}>
                  Experience
                </Text>
              </View>
              <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                {(stats.experience || 0) % 100}/100
              </Text>
            </View>
            
            <View style={[
              tw`h-2 rounded-full overflow-hidden`,
              { backgroundColor: colors.cardSecondary }
            ]}>
              <View
                style={[
                  tw`h-full rounded-full`,
                  {
                    width: `${((stats.experience || 0) % 100)}%`,
                    backgroundColor: getExpColor((stats.experience || 0) % 100),
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Daily Progress Summary */}
      {totalCount > 0 && (
        <View style={[
          tw`p-2.5 rounded-xl`,
          { backgroundColor: colors.cardSecondary }
        ]}>
          <View style={tw`flex-row justify-between items-center mb-1.5`}>
            <Text style={[tw`text-xs font-semibold`, { color: colors.text }]}>
              Today&apos;s Progress
            </Text>
            <Text style={[tw`text-xs font-bold`, { color: getProgressColor(completionPercentage) }]}>
              {completionPercentage}%
            </Text>
          </View>
          
          <View style={[
            tw`h-1.5 rounded-full overflow-hidden mb-1`,
            { backgroundColor: colors.background }
          ]}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor: getProgressColor(completionPercentage),
                }
              ]}
            />
          </View>
          
          <Text style={[tw`text-xs text-center`, { color: colors.textSecondary }]}>
            {completedCount === totalCount && totalCount > 0
              ? "Perfect day! All tasks completed!"
              : `${totalCount - completedCount} ${getTaskTypeText()}${totalCount - completedCount !== 1 ? (taskType === 'dailies' ? '' : 's') : ''} remaining`
            }
          </Text>
        </View>
      )}
    </View>
  )
}