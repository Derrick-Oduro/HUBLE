"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

export default function More() {
  const router = useRouter()
  const { stats } = useStats()
  const { colors, currentTheme } = useTheme()

  // Function to navigate to a specific page
  const navigateTo = (path: string) => {
    router.push(`/more/${path}`)
  }

  const handleLogout = async () => {
    try {
      // Clear the authentication token
      await AsyncStorage.removeItem("userToken")
      // Navigate back to login screen
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to logout. Please try again.")
    }
  }

  // Enhanced grid items with categories - Added Social
  const accountItems = [
    {
      icon: <FontAwesome5 name="user-astronaut" size={24} color={colors.accent} />,
      label: "Avatar",
      path: "avatar",
      description: "Customize your profile",
      color: colors.accent,
    },
    {
      icon: <Ionicons name="stats-chart" size={24} color={colors.success} />,
      label: "Stats",
      path: "stats",
      description: "View your progress",
      color: colors.success,
    },
    {
      icon: <MaterialCommunityIcons name="trophy-award" size={24} color={colors.warning} />,
      label: "Achievements",
      path: "achievements",
      description: "Unlock badges & rewards",
      color: colors.warning,
    },
    {
      icon: <Ionicons name="people" size={24} color="#EC4899" />,
      label: "Social",
      path: "social",
      description: "Friends, parties & challenges",
      color: "#EC4899",
    },
  ]

  const appItems = [
    {
      icon: <Ionicons name="color-palette" size={24} color="#06B6D4" />,
      label: "Themes",
      path: "themes",
      description: "Customize appearance",
      color: "#06B6D4",
    },
    {
      icon: <Ionicons name="settings-outline" size={24} color="#6B7280" />,
      label: "Settings",
      path: "settings",
      description: "App preferences",
      color: "#6B7280",
    },
    {
      icon: <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />,
      label: "Security",
      path: "security",
      description: "Privacy & security",
      color: "#3B82F6",
    },
    {
      icon: <Ionicons name="help-circle-outline" size={24} color={colors.error} />,
      label: "Help",
      path: "help",
      description: "Support & FAQ",
      color: colors.error,
    },
  ]

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
        
        {/* Enhanced Header */}
        <View style={tw`px-5 pt-4 mb-6`}>
          <Text style={[tw`text-3xl font-bold mb-2`, { color: colors.text }]}>Profile</Text>
          <Text style={[tw`text-base`, { color: colors.textSecondary }]}>Manage your account and preferences</Text>
        </View>

        {/* Enhanced User Profile Card */}
        <View style={[
          tw`mx-5 mb-6 rounded-2xl p-6`,
          {
            backgroundColor: colors.card,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }
        ]}>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={[
              tw`w-16 h-16 rounded-2xl mr-4 items-center justify-center`,
              {
                backgroundColor: colors.accent + '20',
                borderWidth: 2,
                borderColor: colors.accent,
              }
            ]}>
              <FontAwesome5 name="user-astronaut" size={24} color={colors.accent} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>WhiteMisty</Text>
              <Text style={[tw`text-base`, { color: colors.textSecondary }]}>@WhiteMisty</Text>
              <View style={tw`flex-row items-center mt-2`}>
                <View style={[
                  tw`px-3 py-1 rounded-full mr-2`,
                  { backgroundColor: colors.accent + '20' }
                ]}>
                  <Text style={[tw`text-sm font-bold`, { color: colors.accent }]}>Level {stats.level}</Text>
                </View>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                  {stats.experience}/{stats.maxExperience} XP
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                tw`p-3 rounded-xl`,
                { backgroundColor: colors.cardSecondary }
              ]}
              onPress={() => navigateTo('avatar')}
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={[tw`flex-row justify-between pt-4 border-t`, { borderColor: colors.cardSecondary }]}>
            <View style={tw`items-center`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.habitsCompleted}</Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Habits</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.dailiesCompleted}</Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Dailies</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.routinesCompleted}</Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Routines</Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{stats.focusSessionsToday}</Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Focus</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={tw`px-5 mb-6`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Account</Text>
          <View style={tw`space-y-3`}>
            {accountItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`rounded-2xl p-4 flex-row items-center`,
                  {
                    backgroundColor: colors.card,
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                ]}
                onPress={() => navigateTo(item.path)}
                activeOpacity={0.8}
              >
                <View style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center mr-4`,
                  { backgroundColor: `${item.color}20` }
                ]}>
                  {item.icon}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-lg font-semibold`, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Settings Section */}
        <View style={tw`px-5 mb-6`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>App Settings</Text>
          <View style={[tw`rounded-2xl overflow-hidden`, { backgroundColor: colors.card }]}>
            {appItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`p-4 flex-row items-center`,
                  index !== appItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardSecondary }
                ]}
                onPress={() => navigateTo(item.path)}
                activeOpacity={0.8}
              >
                <View style={[
                  tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                  { backgroundColor: `${item.color}20` }
                ]}>
                  {item.icon}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Logout Section */}
        <View style={tw`px-5`}>
          <TouchableOpacity 
            style={[
              tw`rounded-2xl p-4 flex-row items-center justify-center`,
              {
                backgroundColor: colors.error,
                shadowColor: colors.error,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-bold text-lg`}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
