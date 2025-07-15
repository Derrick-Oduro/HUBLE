"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput } from "react-native"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Avatar() {
  const router = useRouter()
  const { stats } = useStats()
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
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Customize Avatar</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar Preview */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-8 mb-6 items-center`,
            { backgroundColor: '#1F2937' }
          ]}>
            <View style={[
              tw`w-32 h-32 rounded-3xl items-center justify-center mb-4`,
              {
                backgroundColor: `${selectedColor}20`,
                borderWidth: 3,
                borderColor: selectedColor,
                shadowColor: selectedColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }
            ]}>
              <FontAwesome5 name={selectedAvatar} size={48} color={selectedColor} />
            </View>
            <Text style={tw`text-white text-2xl font-bold mb-2`}>{username}</Text>
            <Text style={tw`text-gray-400`}>Level {stats.level} • {stats.experience} XP</Text>
          </View>

          {/* Username Section */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Username</Text>
            <TextInput
              style={[
                tw`bg-gray-700 text-white p-4 rounded-xl text-lg`,
                { borderWidth: 1, borderColor: '#374151' }
              ]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#9CA3AF"
              maxLength={20}
            />
          </View>

          {/* Avatar Selection */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Avatar Style</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {avatarOptions.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-20 h-20 rounded-xl items-center justify-center mb-4`,
                    {
                      backgroundColor: selectedAvatar === avatar.icon ? `${selectedColor}20` : '#374151',
                      borderWidth: selectedAvatar === avatar.icon ? 2 : 1,
                      borderColor: selectedAvatar === avatar.icon ? selectedColor : '#4B5563',
                      opacity: avatar.unlocked ? 1 : 0.5,
                    }
                  ]}
                  onPress={() => avatar.unlocked && setSelectedAvatar(avatar.icon)}
                  disabled={!avatar.unlocked}
                >
                  <FontAwesome5 
                    name={avatar.icon} 
                    size={24} 
                    color={selectedAvatar === avatar.icon ? selectedColor : '#9CA3AF'} 
                  />
                  {!avatar.unlocked && (
                    <Ionicons 
                      name="lock-closed" 
                      size={12} 
                      color="#6B7280" 
                      style={tw`absolute -top-1 -right-1`}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={tw`text-gray-400 text-sm`}>
              Unlock more avatars by leveling up!
            </Text>
          </View>

          {/* Color Selection */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Color Theme</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {colorOptions.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-12 h-12 rounded-full mb-3`,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 1,
                      borderColor: selectedColor === color ? 'white' : '#4B5563',
                      shadowColor: color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedColor === color ? 0.5 : 0,
                      shadowRadius: 4,
                      elevation: selectedColor === color ? 4 : 0,
                    }
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              tw`bg-violet-600 rounded-2xl p-4 mb-4`,
              {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]} 
            onPress={handleSave}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

