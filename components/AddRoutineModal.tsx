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

interface AddRoutineModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (routine: any) => void
}

export default function AddRoutineModal({ isVisible, onClose, onAdd }: AddRoutineModalProps) {
  const { colors } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("sunny")

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

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setIcon("sunny")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a routine title")
      return
    }

    const routine = {
      title: title.trim(),
      description: description.trim(),
      icon,
    }

    onAdd(routine)
    handleClose()
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
            New Routine
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
              Basic Information
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
