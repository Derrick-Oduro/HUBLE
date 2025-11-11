"use client"

import React from "react"
import { View, Text } from "react-native"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"

interface ProgressBarProps {
  value: number
  max: number
  color: string
  label: string
  showLevel?: boolean
  level?: number
  showPercentage?: boolean
  isCharacterStat?: boolean
}

export default function ProgressBar({ 
  value, 
  max, 
  color, 
  label, 
  showLevel = false, 
  level = 1,
  showPercentage = false,
  isCharacterStat = false
}: ProgressBarProps) {
  const { colors } = useTheme()
  const percentage = Math.min((value / max) * 100, 100)
  
  const getBarColor = () => {
    switch (color) {
      case 'red-500': return colors.error
      case 'yellow-500': return colors.warning
      case 'green-500': return colors.success
      case 'blue-500': return colors.accent
      case 'purple-500': return '#8B5CF6'
      case 'orange-500': return '#F97316'
      default: return colors.accent
    }
  }

  const getLabelIcon = () => {
    switch (label.toLowerCase()) {
      case 'health': return '❤️'
      case 'experience': return '⭐'
      case 'mana': return '💙'
      case 'energy': return '⚡'
      default: return '📊'
    }
  }

  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <View style={tw`flex-row items-center`}>
          {isCharacterStat && (
            <View style={[
              tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
              { backgroundColor: getBarColor() + '20' }
            ]}>
              <Text style={tw`text-sm`}>{getLabelIcon()}</Text>
            </View>
          )}
          <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
            {label} {showLevel && `(Level ${level})`}
          </Text>
        </View>
        
        <View style={tw`flex-row items-center`}>
          <Text style={[tw`font-bold mr-2`, { color: colors.text }]}>
            {value}/{max}
          </Text>
          {showPercentage && (
            <Text style={[tw`text-sm font-medium`, { color: colors.textSecondary }]}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={[
        tw`h-3 rounded-full overflow-hidden`,
        { 
          backgroundColor: colors.cardSecondary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }
      ]}>
        <View 
          style={[
            tw`h-full rounded-full`,
            { 
              width: `${percentage}%`,
              backgroundColor: getBarColor(),
              shadowColor: getBarColor(),
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 3,
              elevation: 3,
            }
          ]} 
        />
        
        {/* Gloss effect for character stats */}
        {isCharacterStat && percentage > 10 && (
          <View 
            style={[
              tw`absolute top-0 left-0 h-1 rounded-full`,
              {
                width: `${Math.max(percentage - 10, 0)}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                marginTop: 1,
                marginLeft: 2,
              }
            ]}
          />
        )}
      </View>

      {/* Character stat additional info */}
      {isCharacterStat && showLevel && (
        <View style={tw`flex-row justify-between items-center mt-2`}>
          <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
            Level {level} Character
          </Text>
          <Text style={[tw`text-xs font-medium`, { color: getBarColor() }]}>
            {label === 'Experience' 
              ? `${max - value} XP to Level ${level + 1}`
              : `Max: ${max}`
            }
          </Text>
        </View>
      )}
    </View>
  )
}
