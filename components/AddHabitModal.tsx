"use client"

import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"

interface AddHabitModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (habit: any) => void
  initialValues?: any
}

export default function AddHabitModal({ isVisible, onClose, onAdd, initialValues }: AddHabitModalProps) {
  const { colors } = useTheme()
  
  const habitColors = [
    colors.accent,
    colors.success, 
    colors.warning,
    colors.error
  ]
  
  const [title, setTitle] = useState(initialValues?.title || "")
  const [description, setDescription] = useState(initialValues?.description || "")
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialValues?.difficulty || 'medium')
  const [selectedColor, setSelectedColor] = useState(habitColors[0])
  
  // Debug: Log when colors change
  useEffect(() => {
    console.log('Theme colors:', habitColors)
    console.log('Selected color:', selectedColor)
  }, [habitColors, selectedColor])
  
  // Fix: Reset selectedColor when modal opens or theme changes
  useEffect(() => {
    if (isVisible) {
      if (initialValues?.color) {
        setSelectedColor(initialValues.color)
      } else {
        setSelectedColor(habitColors[0]) // Always use theme's accent as default
      }
    }
  }, [isVisible, initialValues])
  
  const [targetDays, setTargetDays] = useState([1, 2, 3, 4, 5, 6, 0]) // 0 = Sunday

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "")
      setDescription(initialValues.description || "")
      setDifficulty(initialValues.difficulty || 'medium')
      setSelectedColor(initialValues.color || habitColors[0])
      setTargetDays(initialValues.targetDays || [1, 2, 3, 4, 5, 6, 0])
    }
  }, [initialValues])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDifficulty('medium')
    setSelectedColor(habitColors[0])
    setTargetDays([1, 2, 3, 4, 5, 6, 0])
  }

  const handleClose = () => {
    if (!initialValues) {
      resetForm()
    }
    onClose()
  }

  const isFormValid = title.trim() !== "" && targetDays.length > 0

  const handleSubmit = () => {
    if (!isFormValid) return

    console.log('🔥 SUBMITTING HABIT:')
    console.log('Selected color state:', selectedColor)
    console.log('Title:', title.trim())
    
    const habitData = {
      id: initialValues?.id || Date.now(),
      title: title.trim(),
      description: description.trim(),
      difficulty,
      color: selectedColor, // Make sure this line is here
      targetDays,
      completed: false,
      streak: initialValues?.streak || 0,
    }
    
    console.log('Final habit data:', habitData)
    onAdd(habitData)
    onClose()
  }

  const toggleDay = (dayIndex: number) => {
    if (targetDays.includes(dayIndex)) {
      setTargetDays(targetDays.filter(d => d !== dayIndex))
    } else {
      setTargetDays([...targetDays, dayIndex])
    }
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'hard': return colors.error
      case 'medium': return colors.warning
      case 'easy': return colors.success
      default: return colors.textSecondary
    }
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={[tw`flex-1`, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[
          tw`flex-row items-center justify-between p-5 border-b`,
          { borderColor: colors.cardSecondary }
        ]}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
            {initialValues ? "Edit Habit" : "New Habit"}
          </Text>
          
          <TouchableOpacity
            style={[
              tw`px-4 py-2 rounded-lg`,
              { backgroundColor: colors.accent }
            ]}
            onPress={handleSubmit}
          >
            <Text style={tw`text-white font-bold`}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={tw`flex-1 p-5`} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Habit Details
            </Text>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>
                Habit Title *
              </Text>
              <TextInput
                style={[
                  tw`rounded-xl p-4 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                  }
                ]}
                placeholder="Enter habit title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={60}
              />
            </View>

            <View>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  tw`rounded-xl p-4 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                    minHeight: 80,
                  }
                ]}
                placeholder="Describe your habit"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={150}
              />
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Difficulty Level
            </Text>
            
            <View style={tw`space-y-3`}>
              {[
                { key: 'easy', label: 'Easy', icon: 'leaf-outline', xp: '+5 XP', desc: 'Simple daily habit' },
                { key: 'medium', label: 'Medium', icon: 'flash-outline', xp: '+10 XP', desc: 'Moderate effort required' },
                { key: 'hard', label: 'Hard', icon: 'diamond-outline', xp: '+15 XP', desc: 'Challenging commitment' }
              ].map((d) => (
                <View key={d.key} style={tw`mb-3`}>
                  <TouchableOpacity
                    style={[
                      tw`rounded-xl p-4 flex-row items-center`,
                      {
                        backgroundColor: difficulty === d.key ? getDifficultyColor(d.key) + '20' : colors.cardSecondary,
                        borderWidth: 2,
                        borderColor: difficulty === d.key ? getDifficultyColor(d.key) : 'transparent',
                      }
                    ]}
                    onPress={() => setDifficulty(d.key as any)}
                  >
                    <View style={[
                      tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
                      { backgroundColor: difficulty === d.key ? getDifficultyColor(d.key) : getDifficultyColor(d.key) + '30' }
                    ]}>
                      <Ionicons 
                        name={d.icon} 
                        size={20} 
                        color={difficulty === d.key ? "white" : getDifficultyColor(d.key)}
                      />
                    </View>
                    
                    <View style={tw`flex-1`}>
                      <View style={tw`flex-row items-center justify-between mb-1`}>
                        <Text style={[
                          tw`font-bold text-base`,
                          { color: difficulty === d.key ? getDifficultyColor(d.key) : colors.text }
                        ]}>
                          {d.label}
                        </Text>
                        <Text style={[
                          tw`text-sm font-medium`,
                          { color: difficulty === d.key ? getDifficultyColor(d.key) : colors.textSecondary }
                        ]}>
                          {d.xp}
                        </Text>
                      </View>
                      <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                        {d.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={tw`mb-6`}>
            <Text style={[tw`text-lg font-semibold mb-3`, { color: colors.text }]}>
              Color (Current: {selectedColor})
            </Text>
            <View style={tw`flex-row justify-between`}>
              {habitColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-16 h-16 rounded-2xl items-center justify-center`,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 0,
                      borderColor: colors.text,
                    }
                  ]}
                  onPress={() => {
                    console.log('🎨 Color clicked:', color)
                    console.log('Previous selected:', selectedColor)
                    setSelectedColor(color)
                  }}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Target Days */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Target Days
            </Text>
            
            <View style={tw`flex-row justify-between flex-wrap`}>
              {dayNames.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`rounded-xl items-center justify-center mb-2`,
                    {
                      backgroundColor: targetDays.includes(index) ? colors.accent : colors.cardSecondary,
                      width: '13%',
                      aspectRatio: 1,
                      minWidth: 40,
                      minHeight: 40,
                    }
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[
                    tw`font-bold text-xs`,
                    { color: targetDays.includes(index) ? "white" : colors.text }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[tw`text-sm mt-3 text-center`, { color: colors.textSecondary }]}>
              Select the days you want to practice this habit
            </Text>
          </View>

          {/* Tips */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              💡 Habit Building Tips
            </Text>
            
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>🎯</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Start small and be consistent rather than ambitious and inconsistent
                </Text>
              </View>
              
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>⏰</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Link new habits to existing routines for better success
                </Text>
              </View>
              
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>🔥</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Track your streaks to stay motivated and build momentum
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

