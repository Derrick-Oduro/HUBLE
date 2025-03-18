"use client"

import { View, Text, TouchableOpacity, Switch, Alert } from "react-native"
import { useState } from "react"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsContext"

export default function Backup() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [cloudSync, setCloudSync] = useState(true)
  const { refreshStats } = useStats()

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
    <PageTemplate title="Data Backup & Sync">
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

        <View style={tw`flex-row justify-between items-center`}>
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
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Backup History</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Latest Backup</Text>
            <Text style={tw`text-gray-400 text-sm`}>Today, 10:30 AM</Text>
          </View>
          <TouchableOpacity style={tw`bg-violet-600 px-3 py-1 rounded-full`}>
            <Text style={tw`text-white text-xs`}>Restore</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Previous Backup</Text>
            <Text style={tw`text-gray-400 text-sm`}>Yesterday, 8:15 PM</Text>
          </View>
          <TouchableOpacity style={tw`bg-violet-600 px-3 py-1 rounded-full`}>
            <Text style={tw`text-white text-xs`}>Restore</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white`}>Weekly Backup</Text>
            <Text style={tw`text-gray-400 text-sm`}>March 15, 2025, 9:00 AM</Text>
          </View>
          <TouchableOpacity style={tw`bg-violet-600 px-3 py-1 rounded-full`}>
            <Text style={tw`text-white text-xs`}>Restore</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`flex-row justify-between mb-6`}>
        <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 flex-1 items-center mr-2`}>
          <Text style={tw`text-white font-medium`}>Backup Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`bg-gray-700 rounded-xl p-4 flex-1 items-center ml-2`}>
          <Text style={tw`text-white font-medium`}>Export Data</Text>
        </TouchableOpacity>
      </View>

      {/* Reset App Data Button */}
      <TouchableOpacity style={tw`bg-red-600 rounded-xl p-4 items-center mb-6`} onPress={resetAppData}>
        <Text style={tw`text-white font-medium`}>Reset App Data</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

