"use client"

import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated"
import tw from "../lib/tailwind"

interface DraggableHabitItemProps {
  id: number
  title: string
  color: string
  subtext: string
  completed?: boolean
  streak?: number
  difficulty: 'easy' | 'medium' | 'hard'
  index: number
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onComplete: (id: number) => void
  onFail: (id: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export default function DraggableHabitItem({
  id,
  title,
  color,
  subtext,
  completed = false,
  streak = 0,
  difficulty,
  index,
  onEdit,
  onDelete,
  onComplete,
  onFail,
  onReorder,
}: DraggableHabitItemProps) {
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)
  const zIndex = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#10B981' // green
      case 'medium': return '#F59E0B' // yellow
      case 'hard': return '#EF4444' // red
      default: return '#6B7280' // gray
    }
  }

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case 'easy': return 'star'
      case 'medium': return 'star-half'
      case 'hard': return 'flame'
      default: return 'star'
    }
  }

  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'green-500': '#10B981',
      'blue-500': '#3B82F6',
      'yellow-500': '#F59E0B',
      'purple-500': '#8B5CF6',
      'red-500': '#EF4444',
      'pink-500': '#EC4899',
      'indigo-500': '#6366F1',
      'gray-500': '#6B7280',
    }
    return colorMap[colorName] || '#8B5CF6'
  }

  const handleReorderAction = (newIndex: number) => {
    if (newIndex !== index) {
      onReorder(index, newIndex)
    }
  }

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isDragging.value = true
      scale.value = withSpring(1.05)
      zIndex.value = 1000
    },
    onActive: (event) => {
      translateY.value = event.translationY
    },
    onEnd: (event) => {
      const moveThreshold = 80 // Height of one card approximately
      const moveDistance = Math.round(event.translationY / moveThreshold)
      const newIndex = Math.max(0, index + moveDistance)
      
      if (Math.abs(event.translationY) > moveThreshold) {
        runOnJS(handleReorderAction)(newIndex)
      }
      
      translateY.value = withSpring(0)
      scale.value = withSpring(1)
      zIndex.value = 0
      isDragging.value = false
    },
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    elevation: isDragging.value ? 10 : 2,
  }))

  const handleLongPress = () => {
    Alert.alert(
      "Habit Actions",
      `What would you like to do with "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: () => onEdit(id) },
        { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
      ]
    )
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={[
            tw`bg-gray-800 rounded-xl p-4 mb-3 shadow-lg`,
            {
              borderLeftWidth: 4,
              borderLeftColor: getColorValue(color),
              shadowColor: completed ? '#10B981' : getColorValue(color),
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
        >
          {/* Drag Handle */}
          <View style={tw`absolute right-3 top-3`}>
            <Ionicons name="reorder-three" size={16} color="#6B7280" />
          </View>

          {/* Habit Header */}
          <View style={tw`flex-row items-start justify-between mb-3`}>
            <View style={tw`flex-1 pr-6`}>
              <View style={tw`flex-row items-center mb-1`}>
                <View
                  style={[
                    tw`w-3 h-3 rounded-full mr-2`,
                    { backgroundColor: getColorValue(color) }
                  ]}
                />
                <Text style={tw`text-white font-bold text-base flex-1`} numberOfLines={2}>
                  {title}
                </Text>
              </View>
              
              <Text style={tw`text-gray-400 text-sm`} numberOfLines={2}>
                {subtext}
              </Text>
            </View>

            {/* Completion Status */}
            <View style={tw`items-center`}>
              {completed ? (
                <View style={tw`bg-green-500 bg-opacity-20 p-2 rounded-full`}>
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                </View>
              ) : (
                <View style={tw`bg-gray-700 p-2 rounded-full`}>
                  <Ionicons name="radio-button-off" size={20} color="#9CA3AF" />
                </View>
              )}
            </View>
          </View>

          {/* Habit Stats */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            {/* Difficulty & Streak */}
            <View style={tw`flex-row items-center`}>
              <View style={tw`flex-row items-center mr-4`}>
                <Ionicons
                  name={getDifficultyIcon(difficulty)}
                  size={14}
                  color={getDifficultyColor(difficulty)}
                  style={tw`mr-1`}
                />
                <Text style={tw`text-gray-400 text-xs capitalize`}>
                  {difficulty}
                </Text>
              </View>
              
              {streak > 0 && (
                <View style={tw`flex-row items-center bg-orange-500 bg-opacity-20 px-2 py-1 rounded-full`}>
                  <Ionicons name="flame" size={12} color="#F97316" style={tw`mr-1`} />
                  <Text style={tw`text-orange-400 text-xs font-bold`}>
                    {streak} days
                  </Text>
                </View>
              )}
            </View>

            {/* XP Preview */}
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-violet-400 text-xs font-bold`}>
                {difficulty === 'easy' ? '+5' : difficulty === 'medium' ? '+10' : '+15'} XP
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row justify-between`}>
            {!completed ? (
              <>
                <TouchableOpacity
                  style={tw`flex-1 bg-green-600 py-3 rounded-lg mr-2 items-center`}
                  onPress={() => onComplete(id)}
                >
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="checkmark" size={16} color="white" style={tw`mr-1`} />
                    <Text style={tw`text-white font-medium text-sm`}>Complete</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-1 bg-red-600 py-3 rounded-lg ml-2 items-center`}
                  onPress={() => onFail(id)}
                >
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="close" size={16} color="white" style={tw`mr-1`} />
                    <Text style={tw`text-white font-medium text-sm`}>Failed</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View style={tw`flex-1 bg-green-500 bg-opacity-20 py-3 rounded-lg items-center`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" style={tw`mr-1`} />
                  <Text style={tw`text-green-400 font-medium text-sm`}>Completed Today!</Text>
                </View>
              </View>
            )}
          </View>

          {/* Progress Indicator */}
          <View style={tw`mt-3 bg-gray-700 h-1 rounded-full overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: completed ? '100%' : `${Math.min((streak * 10), 100)}%`,
                  backgroundColor: completed ? '#10B981' : getColorValue(color),
                }
              ]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  )
}