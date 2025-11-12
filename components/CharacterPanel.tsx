import React from 'react'
import { View, Text } from 'react-native'
import tw from '../lib/tailwind'
import { useStats } from '../contexts/StatsProvider'
import { useTheme } from '../contexts/ThemeProvider'

interface CharacterPanelProps {
  completedCount: number
  totalCount: number
  taskType: 'habits' | 'dailies' | 'routines'
}

export default function CharacterPanel({ completedCount, totalCount, taskType }: CharacterPanelProps) {
  const { colors } = useTheme()
  const { stats } = useStats()

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
      tw`rounded-xl p-4 mb-3`, // Changed to match HabitItem style
      { 
        backgroundColor: colors.card,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    ]}>
      {/* Header with Level and Title */}
      <View style={tw`flex-row justify-between items-start mb-4`}>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
            Level {stats.level} Hero
          </Text>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            {completedCount}/{totalCount} {getTaskTypeText()} {getTaskTypeAction()} today
          </Text>
        </View>
        
        {/* Currency Display */}
        <View style={tw`items-end`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-lg mr-1`}>💎</Text>
            <Text style={[tw`text-sm font-bold`, { color: colors.text }]}>
              {stats.gemsEarned}
            </Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-lg mr-1`}>🪙</Text>
            <Text style={[tw`text-sm font-bold`, { color: colors.text }]}>
              {stats.coinsEarned}
            </Text>
          </View>
        </View>
      </View>

      {/* Character Avatar and Stats Row */}
      <View style={tw`flex-row items-center mb-4`}>
        {/* Avatar Section */}
        <View style={tw`mr-4`}>
          <View style={[
            tw`w-16 h-16 rounded-2xl items-center justify-center`,
            { 
              backgroundColor: colors.accent + '20',
              borderWidth: 3,
              borderColor: colors.accent + '40',
            }
          ]}>
            <Text style={tw`text-2xl`}>🧙‍♂️</Text>
          </View>
          
          {/* Streak indicator under avatar */}
          <View style={[
            tw`mt-2 px-2 py-1 rounded-full items-center`,
            { backgroundColor: colors.accent + '20' }
          ]}>
            <Text style={[tw`text-xs font-bold`, { color: colors.accent }]}>
              🔥 {stats.currentStreak}
            </Text>
          </View>
        </View>

        {/* Progress Bars Section */}
        <View style={tw`flex-1`}>
          {/* Health Bar */}
          <View style={tw`mb-3`}>
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-base mr-1`}>❤️</Text>
                <Text style={[tw`text-sm font-semibold`, { color: colors.text }]}>
                  Health
                </Text>
              </View>
              <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                {stats.health || 100}/{stats.maxHealth || 100}
              </Text>
            </View>
            
            <View style={[
              tw`h-3 rounded-full overflow-hidden`,
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
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-base mr-1`}>⚡</Text>
                <Text style={[tw`text-sm font-semibold`, { color: colors.text }]}>
                  Experience
                </Text>
              </View>
              <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                {(stats.experience || 0) % 100}/100
              </Text>
            </View>
            
            <View style={[
              tw`h-3 rounded-full overflow-hidden`,
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
          tw`p-3 rounded-xl`,
          { backgroundColor: colors.cardSecondary }
        ]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw`text-sm font-semibold`, { color: colors.text }]}>
              Today's Progress
            </Text>
            <Text style={[tw`text-sm font-bold`, { color: getProgressColor(completionPercentage) }]}>
              {completionPercentage}%
            </Text>
          </View>
          
          <View style={[
            tw`h-2 rounded-full overflow-hidden mb-1`,
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
              ? "🎉 Perfect day! All tasks completed!"
              : `${totalCount - completedCount} ${getTaskTypeText()}${totalCount - completedCount !== 1 ? (taskType === 'dailies' ? '' : 's') : ''} remaining`
            }
          </Text>
        </View>
      )}
    </View>
  )
}