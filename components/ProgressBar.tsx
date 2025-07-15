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
}

export default function ProgressBar({ 
  value, 
  max, 
  color, 
  label, 
  showLevel = false, 
  level = 1 
}: ProgressBarProps) {
  const { colors } = useTheme()
  const percentage = Math.min((value / max) * 100, 100)
  
  const getBarColor = () => {
    switch (color) {
      case 'red-500': return colors.error
      case 'yellow-500': return colors.warning
      case 'green-500': return colors.success
      case 'blue-500': return colors.accent
      default: return colors.accent
    }
  }

  return (
    <View style={tw`mb-3`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={[tw`font-medium`, { color: colors.text }]}>
          {label} {showLevel && `(Level ${level})`}
        </Text>
        <Text style={[tw`font-bold`, { color: colors.text }]}>
          {value}/{max}
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
              width: `${percentage}%`,
              backgroundColor: getBarColor(),
              shadowColor: getBarColor(),
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.6,
              shadowRadius: 2,
              elevation: 2,
            }
          ]} 
        />
      </View>
    </View>
  )
}
