"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput } from "react-native"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Avatar() {
  const router = useRouter()
  const { stats } = useStats()
  const { colors, currentTheme } = useTheme()
  const [username, setUsername] = useState("WhiteMisty")
  const [selectedAvatar, setSelectedAvatar] = useState("user-astronaut")
  const [selectedColor, setSelectedColor] = useState("#8B5CF6")

  const avatarOptions = [
    { icon: "user-astronaut", name: "Astronaut", unlocked: true },
    { icon: "user-ninja", name: "Ninja", unlocked: stats.level >= 5 },
    { icon: "user-tie", name: "Professional", unlocked: stats.level >= 10 },
    { icon: "user-secret", name: "Secret Agent", unlocked: stats.level >= 15 },
    { icon: "user-graduate", name: "Scholar", unlocked: stats.level >= 20 },
    { icon: "crown", name: "Royal", unlocked: stats.level >= 25 },
  ]

  const colorOptions = [
    "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", 
    "#EF4444", "#EC4899", "#06B6D4", "#84CC16"
  ]

  const handleSave = () => {
    // Save avatar customization logic here
    router.back()
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>Avatar</Text>
        </View>

        <ScrollView style={tw`flex-1 px-5 pt-4`} showsVerticalScrollIndicator={false}>
          {/* Avatar Display */}
          <View style={[tw`rounded-xl p-6 mb-4 items-center`, { backgroundColor: colors.card }]}>
            <View style={[
              tw`w-24 h-24 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.accent + '20' }
            ]}>
              <Text style={tw`text-4xl`}>🧙‍♂️</Text>
            </View>
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>Your Hero</Text>
            <Text style={[tw`text-center`, { color: colors.textSecondary }]}>
              Customize your character
            </Text>
          </View>

          {/* Avatar Options */}
          <Text style={[tw`text-lg font-bold mb-3`, { color: colors.text }]}>Choose Avatar</Text>
          
          <View style={tw`flex-row flex-wrap justify-between`}>
            {['🧙‍♂️', '🧙‍♀️', '👨‍💻', '👩‍💻', '🦸‍♂️', '🦸‍♀️'].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`w-20 h-20 rounded-xl items-center justify-center mb-3`,
                  { backgroundColor: colors.card }
                ]}
              >
                <Text style={tw`text-2xl`}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

