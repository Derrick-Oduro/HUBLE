"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { authAPI, configAPI } from "../../lib/api"

const defaultAvatarOptions = [
  { emoji: "🧙‍♂️", name: "Wizard", unlocked: true, level: 1 },
  { emoji: "🧙‍♀️", name: "Sorceress", unlocked: true, level: 1 },
  { emoji: "👨‍💻", name: "Developer", unlocked: true, level: 3 },
  { emoji: "👩‍💻", name: "Coder", unlocked: true, level: 3 },
  { emoji: "🦸‍♂️", name: "Hero", unlocked: true, level: 5 },
  { emoji: "🦸‍♀️", name: "Heroine", unlocked: true, level: 5 },
  { emoji: "🥷", name: "Ninja", unlocked: true, level: 10 },
  { emoji: "🤴", name: "Prince", unlocked: true, level: 15 },
  { emoji: "👸", name: "Princess", unlocked: true, level: 15 },
  { emoji: "🧠", name: "Mastermind", unlocked: true, level: 20 },
  { emoji: "⚡", name: "Lightning", unlocked: true, level: 25 },
  { emoji: "🔥", name: "Fire Master", unlocked: true, level: 30 },
]

export default function Avatar() {
  const router = useRouter()
  const { stats } = useStats()
  const { colors, currentTheme } = useTheme()
  
  // Avatar state
  const [username, setUsername] = useState("WhiteMisty")
  const [selectedAvatar, setSelectedAvatar] = useState("🧙‍♂️")
  const [selectedColor, setSelectedColor] = useState("#8B5CF6")
  const [selectedBorder, setSelectedBorder] = useState("normal")
  const [avatarOptions, setAvatarOptions] = useState(defaultAvatarOptions)

  // Color options
  const colorOptions = [
    { color: "#8B5CF6", name: "Purple" },
    { color: "#10B981", name: "Green" },
    { color: "#3B82F6", name: "Blue" },
    { color: "#F59E0B", name: "Orange" },
    { color: "#EF4444", name: "Red" },
    { color: "#EC4899", name: "Pink" },
    { color: "#06B6D4", name: "Cyan" },
    { color: "#84CC16", name: "Lime" },
  ]

  // Border styles
  const borderOptions = [
    { id: "normal", name: "Normal", unlocked: true },
    { id: "glow", name: "Glow", unlocked: stats.level >= 5 },
    { id: "rainbow", name: "Rainbow", unlocked: stats.level >= 10 },
    { id: "legendary", name: "Legendary", unlocked: stats.level >= 20 },
  ]

  const loadAvatarData = useCallback(async () => {
    try {
      try {
        const [profileResponse, avatarsResponse] = await Promise.all([
          authAPI.getProfile(),
          configAPI.getAvatars(),
        ])

        if (avatarsResponse?.avatars?.length) {
          setAvatarOptions(
            avatarsResponse.avatars.map((option: any) => ({
              emoji: option.emoji,
              name: option.name,
              unlocked: stats.level >= (option.unlock_level || 1),
              level: option.unlock_level || 1,
            })),
          )
        }

        if (profileResponse?.user) {
          setUsername(profileResponse.user.username || "WhiteMisty")
          setSelectedAvatar(profileResponse.user.avatar || "🧙‍♂️")
          setSelectedColor(profileResponse.user.avatar_color || "#8B5CF6")
          setSelectedBorder(profileResponse.user.avatar_border || "normal")
        }
      } catch (profileError) {
        console.log('Backend profile load failed, falling back to local avatar data:', profileError)
      }

      const savedData = await AsyncStorage.getItem('avatarData')
      if (savedData) {
        const { username: savedUsername, avatar, color, border } = JSON.parse(savedData)
        setUsername(savedUsername || "WhiteMisty")
        setSelectedAvatar(avatar || "🧙‍♂️")
        setSelectedColor(color || "#8B5CF6")
        setSelectedBorder(border || "normal")
      }
    } catch (error) {
      console.log('Error loading avatar data:', error)
    }
  }, [stats.level])

  useEffect(() => {
    loadAvatarData()
  }, [loadAvatarData])

  const handleSave = async () => {
    try {
      const avatarData = {
        username,
        avatar: selectedAvatar,
        color: selectedColor,
        border: selectedBorder
      }
      await authAPI.updateProfile({
        username,
        avatar: selectedAvatar,
        avatar_color: selectedColor,
        avatar_border: selectedBorder,
      })
      await AsyncStorage.setItem('avatarData', JSON.stringify(avatarData))
      
      Alert.alert(
        "✨ Avatar Saved!",
        "Your character has been updated successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      )
    } catch {
      Alert.alert("Error", "Failed to save avatar data")
    }
  }

  const getBorderStyle = (borderType: string, isSelected: boolean = false) => {
    const baseStyle = {
      borderWidth: isSelected ? 3 : 2,
    }

    switch (borderType) {
      case "glow":
        return {
          ...baseStyle,
          borderColor: selectedColor,
          shadowColor: selectedColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 8,
        }
      case "rainbow":
        return {
          ...baseStyle,
          borderColor: selectedColor,
          borderWidth: 4,
        }
      case "legendary":
        return {
          ...baseStyle,
          borderColor: "#FFD700",
          borderWidth: 4,
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 12,
        }
      default:
        return {
          ...baseStyle,
          borderColor: isSelected ? selectedColor : colors.cardSecondary,
        }
    }
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      
      {/* Header */}
      <View style={tw`flex-row items-center px-5 pt-2 pb-4 justify-between`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>⚔️ Character</Text>
        </View>
        
        <TouchableOpacity 
          style={[tw`px-4 py-2 rounded-xl`, { backgroundColor: colors.accent }]}
          onPress={handleSave}
        >
          <Text style={tw`text-white font-bold`}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-5`} showsVerticalScrollIndicator={false}>
        {/* Avatar Preview */}
        <View style={[
          tw`rounded-2xl p-6 mb-6 items-center`,
          { 
            backgroundColor: colors.card,
            ...getBorderStyle(selectedBorder),
          }
        ]}>
          <View style={[
            tw`w-28 h-28 rounded-full items-center justify-center mb-4`,
            { 
              backgroundColor: selectedColor + '20',
              ...getBorderStyle(selectedBorder),
            }
          ]}>
            <Text style={tw`text-6xl`}>{selectedAvatar}</Text>
          </View>
          
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[
              tw`text-xl font-bold mb-2 text-center px-4 py-2 rounded-lg`,
              { 
                color: colors.text,
                backgroundColor: colors.cardSecondary,
                minWidth: 150,
              }
            ]}
            placeholder="Enter username"
            placeholderTextColor={colors.textSecondary}
            maxLength={20}
          />
          
          <View style={tw`flex-row items-center mt-2`}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={[tw`text-sm font-bold ml-1`, { color: colors.textSecondary }]}>
              Level {stats.level} • {stats.experience} XP
            </Text>
          </View>
        </View>

        {/* Avatar Selection */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-4`}>
            <Ionicons name="happy" size={24} color={colors.accent} style={tw`mr-2`} />
            <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>Choose Avatar</Text>
          </View>
          
          <View style={tw`flex-row flex-wrap justify-between`}>
            {avatarOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`w-20 h-20 rounded-xl items-center justify-center mb-3 relative`,
                  { 
                    backgroundColor: selectedAvatar === option.emoji ? selectedColor + '20' : colors.card,
                    borderWidth: selectedAvatar === option.emoji ? 2 : 1,
                    borderColor: selectedAvatar === option.emoji ? selectedColor : colors.cardSecondary,
                    opacity: option.unlocked ? 1 : 0.5,
                  }
                ]}
                onPress={() => {
                  if (option.unlocked) {
                    setSelectedAvatar(option.emoji)
                  } else {
                    Alert.alert(
                      "Locked",
                      `Reach level ${option.level} to unlock ${option.name}`
                    )
                  }
                }}
                disabled={!option.unlocked}
              >
                <Text style={tw`text-2xl mb-1`}>{option.emoji}</Text>
                <Text style={[tw`text-xs font-bold`, { color: colors.textSecondary }]}>
                  {option.name}
                </Text>
                
                {!option.unlocked && (
                  <View style={[
                    tw`absolute top-1 right-1 w-5 h-5 rounded-full items-center justify-center`,
                    { backgroundColor: colors.error }
                  ]}>
                    <Ionicons name="lock-closed" size={10} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row items-center mb-4`}>
            <Ionicons name="color-palette" size={24} color={colors.accent} style={tw`mr-2`} />
            <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>Choose Color</Text>
          </View>
          
          <View style={tw`flex-row flex-wrap justify-between`}>
            {colorOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`w-16 h-16 rounded-xl mb-3 items-center justify-center`,
                  {
                    backgroundColor: option.color,
                    borderWidth: selectedColor === option.color ? 4 : 2,
                    borderColor: selectedColor === option.color ? colors.text : colors.cardSecondary,
                  }
                ]}
                onPress={() => setSelectedColor(option.color)}
              >
                {selectedColor === option.color && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Border Selection */}
        <View style={tw`mb-8`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>✨ Choose Border</Text>
          
          <View style={tw`space-y-3`}>
            {borderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  tw`rounded-xl p-4 flex-row items-center justify-between`,
                  {
                    backgroundColor: selectedBorder === option.id ? selectedColor + '20' : colors.card,
                    borderWidth: selectedBorder === option.id ? 2 : 1,
                    borderColor: selectedBorder === option.id ? selectedColor : colors.cardSecondary,
                    opacity: option.unlocked ? 1 : 0.5,
                  }
                ]}
                onPress={() => {
                  if (option.unlocked) {
                    setSelectedBorder(option.id)
                  } else {
                    Alert.alert("Locked", "Level up to unlock this border style!")
                  }
                }}
                disabled={!option.unlocked}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={[
                    tw`w-12 h-12 rounded-full mr-3`,
                    { backgroundColor: selectedColor + '20' },
                    getBorderStyle(option.id)
                  ]}>
                    <Text style={tw`text-lg text-center leading-12`}>{selectedAvatar}</Text>
                  </View>
                  <View>
                    <Text style={[tw`font-bold`, { color: colors.text }]}>{option.name}</Text>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                      {option.unlocked ? "Unlocked" : "Locked"}
                    </Text>
                  </View>
                </View>
                
                {selectedBorder === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color={selectedColor} />
                )}
                
                {!option.unlocked && (
                  <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


