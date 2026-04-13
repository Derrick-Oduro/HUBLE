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

interface EditRoutineModalProps {
  isVisible: boolean
  onClose: () => void
  onSave: (routine: any) => void
  routine: any
}

export default function EditRoutineModal({ isVisible, onClose, onSave, routine }: EditRoutineModalProps) {
  const { colors } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("sunny")
  const [timeOfDay, setTimeOfDay] = useState("morning")
  const [anchorTime, setAnchorTime] = useState("07:00")

  const iconOptions = [
    { name: "sunny", label: "Morning" },
    { name: "partly-sunny", label: "Afternoon" },
    { name: "moon", label: "Evening" },
    { name: "fitness", label: "Exercise" },
    { name: "book", label: "Study" },
    { name: "cafe", label: "Work" },
    { name: "leaf", label: "Health" },
    { name: "heart", label: "Self-care" },
  ]

  const timeOfDayOptions = [
    { id: "morning", label: "Morning", icon: "sunny-outline" },
    { id: "afternoon", label: "Afternoon", icon: "partly-sunny-outline" },
    { id: "evening", label: "Evening", icon: "moon-outline" },
  ]

  useEffect(() => {
    if (routine) {
      setTitle(routine.title || "")
      setDescription(routine.description || "")
      setIcon(routine.icon || "sunny")
      setTimeOfDay(routine.timeOfDay || "morning")
      setAnchorTime(routine.anchorTime || "07:00")
    }
  }, [routine])

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a routine title")
      return
    }

    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(anchorTime.trim())
    if (!isValidTime) {
      Alert.alert("Invalid time", "Use 24-hour format HH:MM, for example 21:30")
      return
    }

    const updatedRoutine = {
      ...routine,
      title: title.trim(),
      description: description.trim(),
      icon,
      timeOfDay,
      anchorTime: anchorTime.trim(),
    }

    onSave(updatedRoutine)
    onClose()
  }

  const handleClose = () => {
    onClose()
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
            Edit Routine
          </Text>
          
          <TouchableOpacity
            style={[
              tw`px-4 py-2 rounded-lg`,
              { backgroundColor: colors.accent }
            ]}
            onPress={handleSave}
          >
            <Text style={tw`text-white font-bold`}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={tw`flex-1 p-5`} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Routine Information
            </Text>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>
                Routine Title *
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
                placeholder="Enter routine name"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
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
                placeholder="Describe your routine"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={200}
              />
            </View>
          </View>

          {/* Icon Selection */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Choose Icon
            </Text>
            
            <View style={tw`flex-row flex-wrap`}>
              {iconOptions.map((iconOption) => (
                <TouchableOpacity
                  key={iconOption.name}
                  style={[
                    tw`rounded-xl p-4 mr-3 mb-3 items-center`,
                    {
                      backgroundColor: icon === iconOption.name ? colors.accent : colors.cardSecondary,
                      minWidth: 80,
                    }
                  ]}
                  onPress={() => setIcon(iconOption.name)}
                >
                  <Ionicons 
                    name={iconOption.name} 
                    size={24} 
                    color={icon === iconOption.name ? "white" : colors.text}
                    style={tw`mb-1`}
                  />
                  <Text style={[
                    tw`text-xs font-medium text-center`,
                    { color: icon === iconOption.name ? "white" : colors.text }
                  ]}>
                    {iconOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Routine Anchor */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}> 
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}> 
              Routine Anchor
            </Text>
            <Text style={[tw`text-sm mb-4`, { color: colors.textSecondary }]}> 
              Keep this routine tied to a clear time-of-day anchor.
            </Text>

            <View style={tw`flex-row mb-4`}>
              {timeOfDayOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    tw`flex-1 mr-2 rounded-xl py-3 px-2 items-center`,
                    {
                      backgroundColor: timeOfDay === option.id ? colors.accent : colors.cardSecondary,
                    },
                  ]}
                  onPress={() => setTimeOfDay(option.id)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={18}
                    color={timeOfDay === option.id ? "white" : colors.text}
                    style={tw`mb-1`}
                  />
                  <Text style={[tw`text-xs font-semibold`, { color: timeOfDay === option.id ? "white" : colors.text }]}> 
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Anchor Time (HH:MM)</Text>
              <TextInput
                style={[
                  tw`rounded-xl p-4 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                  },
                ]}
                placeholder="07:00"
                placeholderTextColor={colors.textSecondary}
                value={anchorTime}
                onChangeText={setAnchorTime}
                autoCapitalize="none"
                maxLength={5}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

