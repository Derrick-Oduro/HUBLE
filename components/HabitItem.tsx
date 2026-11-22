"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Pressable,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Pill, tint } from "./ui"
import { useTheme } from "../contexts/ThemeProvider"
import { formatFocusMinutes } from "../lib/focusLinks"


interface HabitItemProps {
  id: number
  title: string
  color: string
  subtext: string
  completed?: boolean
  streak?: number
  focusMinutes?: number // minutes focused on this habit today (linked focus sessions)
  onFocus?: (id: number) => void // open the Focus timer linked to this habit
  onEdit: (id: number) => void
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
  focusMinutes = 0,
  onFocus,
  onEdit,
  onComplete,
  onFail,
}: HabitItemProps) {
  const { colors } = useTheme()
  const [scaleAnim] = useState(new Animated.Value(1))

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

  const habitColor = getThemeColor(color)

  const handlePress = () => {
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

    onEdit(id)
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
    <Animated.View style={{ marginBottom: 8, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 16,
          backgroundColor: completed ? tint(habitColor, 0.08) : colors.card,
          borderWidth: 1,
          borderColor: completed ? tint(habitColor, 0.3) : tint(colors.cardSecondary, 0.6),
        }}
      >
        {/* Complete */}
        <TouchableOpacity
          onPress={handleComplete}
          accessibilityLabel={completed ? `${title} completed` : `Complete ${title}`}
          hitSlop={8}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 2,
            borderColor: habitColor,
            backgroundColor: completed ? habitColor : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {completed && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Title + meta */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: completed ? colors.textSecondary : colors.text,
              textDecorationLine: completed ? "line-through" : "none",
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {streak > 0 && <Pill label={streak} icon="flame" color={colors.warning} />}
            {focusMinutes > 0 && <Pill label={formatFocusMinutes(focusMinutes)} icon="timer-outline" color={colors.accent} />}
            {!!subtext && (
              <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
                {subtext}
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        {onFocus && !completed && (
          <TouchableOpacity
            onPress={() => onFocus(id)}
            accessibilityLabel={`Focus on ${title}`}
            hitSlop={6}
            style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: tint(colors.accent, 0.12) }}
          >
            <Ionicons name="timer-outline" size={17} color={colors.accent} />
          </TouchableOpacity>
        )}
        {!completed && (
          <TouchableOpacity
            onPress={handleFail}
            accessibilityLabel={`Mark ${title} as failed`}
            hitSlop={6}
            style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: tint(colors.error, 0.1) }}
          >
            <Ionicons name="remove" size={17} color={colors.error} />
          </TouchableOpacity>
        )}
      </Pressable>
    </Animated.View>
  )
}
