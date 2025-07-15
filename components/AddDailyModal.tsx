"use client"

import React, { useState } from "react"
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

interface AddDailyModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (daily: any) => void
}

export default function AddDailyModal({ isVisible, onClose, onAdd }: AddDailyModalProps) {
  const { colors } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [category, setCategory] = useState("")

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority('medium')
    setDifficulty('medium')
    setCategory("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title")
      return
    }

    const daily = {
      title: title.trim(),
      description: description.trim(),
      priority,
      difficulty,
      category: category.trim() || "General"
    }

    onAdd(daily)
    handleClose()
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return colors.error
      case 'medium': return colors.warning
      case 'low': return colors.success
      default: return colors.textSecondary
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
            New Daily Task
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
              Task Details
            </Text>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>
                Task Title *
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
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
            </View>

            <View style={tw`mb-4`}>
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
                placeholder="Describe your task"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={200}
              />
            </View>

            <View>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>
                Category
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
                placeholder="e.g., Work, Personal, Health"
                placeholderTextColor={colors.textSecondary}
                value={category}
                onChangeText={setCategory}
                maxLength={30}
              />
            </View>
          </View>

          {/* Priority Selection */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Priority Level
            </Text>
            
            <View style={tw`space-y-3`}>
              {[
                { key: 'low', label: 'Low Priority', icon: 'remove-circle-outline', desc: 'Can be done later' },
                { key: 'medium', label: 'Medium Priority', icon: 'ellipse-outline', desc: 'Important but not urgent' },
                { key: 'high', label: 'High Priority', icon: 'alert-circle-outline', desc: 'Urgent and important' }
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    tw`rounded-xl p-4 flex-row items-center`,
                    {
                      backgroundColor: priority === p.key ? getPriorityColor(p.key) + '20' : colors.cardSecondary,
                      borderWidth: 2,
                      borderColor: priority === p.key ? getPriorityColor(p.key) : 'transparent',
                    }
                  ]}
                  onPress={() => setPriority(p.key as any)}
                >
                  <Ionicons 
                    name={p.icon} 
                    size={24} 
                    color={priority === p.key ? getPriorityColor(p.key) : colors.textSecondary}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[
                      tw`font-bold`,
                      { color: priority === p.key ? getPriorityColor(p.key) : colors.text }
                    ]}>
                      {p.label}
                    </Text>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                      {p.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Difficulty Level
            </Text>
            
            <View style={tw`space-y-3`}>
              {[
                { key: 'easy', label: 'Easy', icon: 'leaf-outline', xp: '+3 XP', desc: 'Quick and simple' },
                { key: 'medium', label: 'Medium', icon: 'flash-outline', xp: '+6 XP', desc: 'Moderate effort' },
                { key: 'hard', label: 'Hard', icon: 'diamond-outline', xp: '+10 XP', desc: 'Challenging task' }
              ].map((d) => (
                <TouchableOpacity
                  key={d.key}
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
                    { backgroundColor: difficulty === d.key ? getDifficultyColor(d.key) : colors.cardSecondary }
                  ]}>
                    <Ionicons 
                      name={d.icon} 
                      size={20} 
                      color={difficulty === d.key ? "white" : getDifficultyColor(d.key)}
                    />
                  </View>
                  
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center justify-between`}>
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
                    <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                      {d.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              💡 Daily Task Tips
            </Text>
            
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>🎯</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Be specific about what you want to accomplish
                </Text>
              </View>
              
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>⚡</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Higher difficulty tasks give more XP rewards
                </Text>
              </View>
              
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-lg mr-3`}>📅</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Daily tasks reset every day at midnight
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

