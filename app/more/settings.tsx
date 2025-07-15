"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Switch, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

export default function Settings() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  
  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  const settingCategories = [
    {
      title: "Notifications",
      icon: "notifications-outline",
      items: [
        {
          title: "Push Notifications",
          description: "Receive habit reminders and updates",
          value: notifications,
          setter: setNotifications,
          icon: "notifications-outline",
          color: colors.accent
        },
        {
          title: "Sound",
          description: "Play sounds for notifications",
          value: sound,
          setter: setSound,
          icon: "volume-high-outline",
          color: colors.success
        },
        {
          title: "Vibration",
          description: "Vibrate for notifications",
          value: vibration,
          setter: setVibration,
          icon: "phone-portrait-outline",
          color: colors.warning
        }
      ]
    },
    {
      title: "Data & Privacy",
      icon: "shield-outline",
      items: [
        {
          title: "Auto Backup",
          description: "Automatically backup your data",
          value: autoBackup,
          setter: setAutoBackup,
          icon: "cloud-upload-outline",
          color: "#06B6D4"
        },
        {
          title: "Analytics",
          description: "Help improve the app with usage data",
          value: analytics,
          setter: setAnalytics,
          icon: "analytics-outline",
          color: "#8B5CF6"
        }
      ]
    },
    {
      title: "Advanced",
      icon: "settings-outline",
      items: [
        {
          title: "Reset All Data",
          description: "Clear all habits, dailies, and progress",
          action: () => {
            Alert.alert(
              "Reset All Data",
              "This will permanently delete all your data including habits, dailies, routines, and progress. This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await AsyncStorage.multiRemove([
                        "habitsData",
                        "dailiesData", 
                        "routinesData",
                        "statsData"
                      ])
                      Alert.alert("Success", "All data has been reset.")
                    } catch (error) {
                      Alert.alert("Error", "Failed to reset data.")
                    }
                  }
                }
              ]
            )
          },
          color: colors.error
        }
      ]
    }
  ]

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {settingCategories.map((category, categoryIndex) => (
            <View key={categoryIndex} style={tw`mb-6`}>
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                {category.title}
              </Text>
              
              <View style={[tw`rounded-2xl overflow-hidden`, { backgroundColor: colors.card }]}>
                {category.items.map((item, itemIndex) => (
                  <View key={itemIndex}>
                    <TouchableOpacity
                      style={[
                        tw`p-4 flex-row items-center`,
                        itemIndex !== category.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardSecondary }
                      ]}
                      onPress={item.action || (() => {})}
                      disabled={!item.action}
                    >
                      <View style={[
                        tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                        { backgroundColor: `${item.color}20` }
                      ]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      
                      <View style={tw`flex-1 mr-3`}>
                        <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                          {item.title}
                        </Text>
                        <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                          {item.description}
                        </Text>
                      </View>
                      
                      {item.setter ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.setter}
                          trackColor={{ false: colors.cardSecondary, true: item.color + '80' }}
                          thumbColor={item.value ? item.color : colors.textSecondary}
                        />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>About</Text>
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw``, { color: colors.textSecondary }]}>Version</Text>
                <Text style={[tw`font-semibold`, { color: colors.text }]}>1.0.0</Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw``, { color: colors.textSecondary }]}>Build</Text>
                <Text style={[tw`font-semibold`, { color: colors.text }]}>2025.1.15</Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={[tw``, { color: colors.textSecondary }]}>Developer</Text>
                <Text style={[tw`font-semibold`, { color: colors.text }]}>HUBLE Team</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
