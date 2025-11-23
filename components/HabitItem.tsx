"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Pressable,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"
import React from "react"

interface HabitItemProps {
  id: number
  title: string
  color: string
  subtext: string
  completed?: boolean
  streak?: number
  difficulty: 'easy' | 'medium' | 'hard'
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onComplete: (id: number) => void
  onFail: (id: number) => void
}

export default function HabitItem({
  id,
  title,
  color,
  subtext,
  completed = false,
  streak = 0,
  difficulty,
  onEdit,
  onDelete,
  onComplete,
  onFail,
}: HabitItemProps) {
  const { colors } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [scaleAnim] = useState(new Animated.Value(1))
  const [slideAnim] = useState(new Animated.Value(0))

  const getColorValue = (colorInput: string) => {
    // If it's already a hex color, return it
    if (colorInput?.startsWith('#')) {
      return colorInput
    }
    
    // Handle old Tailwind colors for backward compatibility
    const colorMap: { [key: string]: string } = {
      'green-500': '#10B981',
      'blue-500': '#3B82F6', 
      'yellow-500': '#F59E0B',
      'purple-500': '#8B5CF6',
      'red-500': '#EF4444',
      'pink-500': '#EC4899',
    }
    
    return colorMap[colorInput] || colors.accent
  }

  const getDifficultyInfo = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { icon: 'leaf', color: colors.success, label: 'Easy', emoji: '🌱' }
      case 'medium':
        return { icon: 'flash', color: colors.warning, label: 'Medium', emoji: '⚡' }
      case 'hard':
        return { icon: 'diamond', color: colors.error, label: 'Hard', emoji: '💎' }
      default:
        return { icon: 'leaf', color: colors.success, label: 'Easy', emoji: '🌱' }
    }
  }

  const getThemeColor = (savedColor: string) => {
    // Current theme palette
    const currentPalette = [colors.accent, colors.success, colors.warning, colors.error]
    
    // All possible theme color palettes - UPDATED with all themes
    const allThemePalettes = [
      // Light theme
      ["#8B5CF6", "#059669", "#D97706", "#DC2626"],
      // Dark theme  
      ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
      // Christmas theme
      ["#B91C1C", "#047857", "#92400E", "#7C2D12"],
      // Solo Leveling theme - ADD THIS
      ["#6C5CE7", "#00D9FF", "#FFD700", "#FF6B6B"],
      // Ocean theme
      ["#06B6D4", "#10B981", "#F59E0B", "#EF4444"],
      // Forest theme
      ["#10B981", "#059669", "#F59E0B", "#EF4444"],
      // Sunset theme
      ["#F59E0B", "#10B981", "#F59E0B", "#EF4444"],
      // Royal theme
      ["#A855F7", "#10B981", "#F59E0B", "#EF4444"],
      // Cyber theme
      ["#00FF88", "#00FF88", "#FFD700", "#FF0040"],
      // Rose theme
      ["#EC4899", "#059669", "#D97706", "#DC2626"],
      // Paper theme
      ["#2C2C2E", "#4A5D23", "#8B4513", "#8B1A1A"],
      // Vintage Paper theme
      ["#1F1F1F", "#355C2B", "#A0620E", "#7A1A1A"],
      // Notebook theme
      ["#1E3A8A", "#166534", "#B45309", "#DC2626"],
    ]
    
    // Check which position the saved color was in ANY theme palette
    for (const palette of allThemePalettes) {
      const position = palette.indexOf(savedColor)
      if (position !== -1) {
        // Return the color at the SAME POSITION in current theme
        return currentPalette[position]
      }
    }
    
    // Handle legacy colors by position
    const legacyColorPositions: { [key: string]: number } = {
      'purple-500': 0, // accent position
      'green-500': 1,  // success position  
      'yellow-500': 2, // warning position
      'red-500': 3,    // error position
      'blue-500': 0,   // accent position
      'pink-500': 3,   // error position
    }
    
    if (legacyColorPositions[savedColor] !== undefined) {
      return currentPalette[legacyColorPositions[savedColor]]
    }
    
    // If no match found, return the saved color or default to accent
    return savedColor || colors.accent
  }

  const difficultyInfo = getDifficultyInfo(difficulty)
  const habitColor = getThemeColor(color)

  const handlePress = () => {
    // Animate scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Toggle expanded
    setIsExpanded(!isExpanded)
    Animated.timing(slideAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start()
  }

  const handleComplete = () => {
    if (completed) {
      Alert.alert("Already Completed", "You've already completed this habit today!")
      return
    }
    
    // Celebration animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
    
    onComplete(id)
  }

  const handleFail = () => {
    Alert.alert(
      "Mark as Failed",
      "This will apply XP and health penalties. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark Failed", style: "destructive", onPress: () => onFail(id) }
      ]
    )
  }

  return (
    <Animated.View 
      style={[
        tw`mb-3`,
        {
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      {/* Main Card - Compact Design */}
      <Pressable
        onPress={handlePress}
        style={[
          tw`rounded-2xl p-2`,
          {
            borderLeftWidth: 8,
            borderLeftColor: habitColor,
            backgroundColor: completed ? colors.cardSecondary : colors.card,
            opacity: completed ? 0.7 : 1.0,
            shadowColor: habitColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: completed ? 0.1 : 0.25,
            shadowRadius: 6,
            elevation: 6,
          }
        ]}
      >
        {/* Compact Header Row */}
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 mr-3`}>
            {/* Title with small emoji */}
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-8 h-8 rounded-xl items-center justify-center mr-3`,
                  { backgroundColor: `${habitColor}20` }
                ]}
              >
                <Text style={tw`text-lg`}>{difficultyInfo.emoji}</Text>
              </View>
              
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    tw`font-bold text-base`,
                    {
                      color: completed ? colors.textSecondary : colors.text,
                      textDecorationLine: completed ? 'line-through' : 'none',
                    }
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                
                {/* Compact subtitle */}
                <Text
                  style={[
                    tw`text-xs mt-1`,
                    { color: colors.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {subtext}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Side - Compact Status & Actions */}
          <View style={tw`flex-row items-center`}>
            {/* Streak Badge */}
            {streak > 0 && (
              <View
                style={[
                  tw`px-2 py-1 rounded-full mr-2`,
                  { backgroundColor: `${habitColor}25` }
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-bold`,
                    { color: habitColor }
                  ]}
                >
                  🔥{streak}
                </Text>
              </View>
            )}

            {/* Compact Completion Button */}
            <TouchableOpacity onPress={handleComplete} style={tw`mr-2`}>
              <View
                style={[
                  tw`w-7 h-7 rounded-xl border-2 items-center justify-center`,
                  {
                    backgroundColor: completed ? habitColor : 'transparent',
                    borderColor: habitColor,
                  }
                ]}
              >
                {completed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>

            {/* Expand Arrow */}
            <TouchableOpacity onPress={handlePress}>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ultra-Thin Modern Progress Bar */}
        <View style={tw`mt-2 ml-11 mr-2`}>
          <View style={[
            tw`h-1 rounded-full overflow-hidden`,
            { backgroundColor: colors.cardSecondary }
          ]}>
            <Animated.View
              style={[
                tw`h-full rounded-full`,
                {
                  backgroundColor: habitColor,
                  width: completed ? '100%' : '0%',
                }
              ]}
            />
          </View>
        </View>
      </Pressable>

      {/* Compact Expanded Actions */}
      <Animated.View
        style={[
          tw`overflow-hidden rounded-b-2xl`,
          {
            maxHeight: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 65],
            }),
            opacity: slideAnim,
          }
        ]}
      >
        <View style={[
          tw`px-3 py-2 flex-row justify-around`,
          { 
            backgroundColor: colors.cardSecondary,
            marginTop: -6, 
            paddingTop: 10, 
            borderBottomLeftRadius: 16, 
            borderBottomRightRadius: 16 
          }
        ]}>
          {/* Complete Button */}
          <TouchableOpacity
            onPress={handleComplete}
            style={[
              tw`flex-1 py-2 rounded-xl mx-1 items-center`,
              { backgroundColor: `${habitColor}25` }
            ]}
            disabled={completed}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={completed ? colors.textSecondary : habitColor}
            />
            <Text
              style={[
                tw`text-xs mt-1 font-medium`,
                { color: completed ? colors.textSecondary : habitColor }
              ]}
            >
              {completed ? 'Done' : 'Complete'}
            </Text>
          </TouchableOpacity>

          {/* Fail Button */}
          <TouchableOpacity
            onPress={handleFail}
            style={[
              tw`flex-1 py-2 rounded-xl mx-1 items-center`,
              { backgroundColor: colors.error + '25' }
            ]}
          >
            <Ionicons name="close-circle" size={16} color={colors.error} />
            <Text style={[tw`text-xs mt-1 font-medium`, { color: colors.error }]}>Failed</Text>
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => onEdit(id)}
            style={[
              tw`flex-1 py-2 rounded-xl mx-1 items-center`,
              { backgroundColor: colors.textSecondary + '25' }
            ]}
          >
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            <Text style={[tw`text-xs mt-1 font-medium`, { color: colors.textSecondary }]}>Edit</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => onDelete(id)}
            style={[
              tw`flex-1 py-2 rounded-xl mx-1 items-center`,
              { backgroundColor: colors.error + '25' }
            ]}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
            <Text style={[tw`text-xs mt-1 font-medium`, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  )
}
