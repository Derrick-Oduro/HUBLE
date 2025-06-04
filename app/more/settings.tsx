"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Settings() {
  const { refreshStats } = useStats()

  // Notification settings
  const [dailyReminders, setDailyReminders] = useState(true)
  const [habitReminders, setHabitReminders] = useState(true)
  const [routineReminders, setRoutineReminders] = useState(true)
  const [achievementNotifications, setAchievementNotifications] = useState(true)

  // Backup settings
  const [autoBackup, setAutoBackup] = useState(true)
  const [cloudSync, setCloudSync] = useState(false)

  // App settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  // Reset function to clear all app data
  const resetAppData = async () => {
    Alert.alert(
      "Reset App Data",
      "This will reset all your data including habits, dailies, routines, and timer settings. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all app data from AsyncStorage
              await AsyncStorage.removeItem("habitsData")
              await AsyncStorage.removeItem("dailiesData")
              await AsyncStorage.removeItem("routinesData")
              await AsyncStorage.removeItem("routineTasksState")
              await AsyncStorage.removeItem("timerPreferences")
              await AsyncStorage.removeItem("timerStats")
              await AsyncStorage.removeItem("userStats")

              // Refresh stats to reflect the reset
              await refreshStats()

              Alert.alert("Success", "All app data has been reset successfully.")
            } catch (error) {
              console.error("Failed to reset app data:", error)
              Alert.alert("Error", "Failed to reset app data. Please try again.")
            }
          },
        },
      ],
    )
  }

  return (
    <PageTemplate title="Settings">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <Text style={tw`text-white text-lg font-bold mb-3`}>Notifications</Text>
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Daily Task Reminders</Text>
              <Text style={tw`text-gray-400 text-sm`}>Remind you of incomplete daily tasks</Text>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={dailyReminders ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Habit Reminders</Text>
              <Text style={tw`text-gray-400 text-sm`}>Remind you to complete your habits</Text>
            </View>
            <Switch
              value={habitReminders}
              onValueChange={setHabitReminders}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={habitReminders ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Routine Reminders</Text>
              <Text style={tw`text-gray-400 text-sm`}>Remind you of your routines</Text>
            </View>
            <Switch
              value={routineReminders}
              onValueChange={setRoutineReminders}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={routineReminders ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-white text-lg`}>Achievement Notifications</Text>
              <Text style={tw`text-gray-400 text-sm`}>Notify when you earn achievements</Text>
            </View>
            <Switch
              value={achievementNotifications}
              onValueChange={setAchievementNotifications}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={achievementNotifications ? "#ffffff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Data & Backup Section */}
        <Text style={tw`text-white text-lg font-bold mb-3`}>Data & Backup</Text>
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Auto Backup</Text>
              <Text style={tw`text-gray-400 text-sm`}>Automatically backup your data</Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={autoBackup ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Cloud Sync</Text>
              <Text style={tw`text-gray-400 text-sm`}>Sync data across devices</Text>
            </View>
            <Switch
              value={cloudSync}
              onValueChange={setCloudSync}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={cloudSync ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            style={tw`flex-row justify-between items-center`}
            onPress={() => Alert.alert("Export Data", "Your data will be exported as a JSON file.")}
          >
            <View>
              <Text style={tw`text-white text-lg`}>Export Data</Text>
              <Text style={tw`text-gray-400 text-sm`}>Export your data as a file</Text>
            </View>
            <Ionicons name="download-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <Text style={tw`text-white text-lg font-bold mb-3`}>App Settings</Text>
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Sound Effects</Text>
              <Text style={tw`text-gray-400 text-sm`}>Enable sound effects in the app</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={soundEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
            <View>
              <Text style={tw`text-white text-lg`}>Vibration</Text>
              <Text style={tw`text-gray-400 text-sm`}>Enable vibration feedback</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
              thumbColor={vibrationEnabled ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            style={tw`flex-row justify-between items-center`}
            onPress={() => Alert.alert("About", "HUBLE App\nVersion 1.0.0\n\nA habit tracking and productivity app.")}
          >
            <View>
              <Text style={tw`text-white text-lg`}>About</Text>
              <Text style={tw`text-gray-400 text-sm`}>App version and information</Text>
            </View>
            <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Reset App Data Button */}
        <TouchableOpacity style={tw`bg-red-600 rounded-xl p-4 items-center mb-6`} onPress={resetAppData}>
          <Text style={tw`text-white font-medium`}>Reset App Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </PageTemplate>
  )
}
