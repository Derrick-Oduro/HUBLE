"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

export default function More() {
  const router = useRouter()

  // Function to navigate to a specific page
  const navigateTo = (path) => {
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

  // Simplified grid items data
  const gridItems = [
    {
      icon: <Ionicons name="stats-chart" size={28} color="white" />,
      label: "Stats",
      path: "stats",
    },
    {
      icon: <MaterialCommunityIcons name="trophy-award" size={28} color="white" />,
      label: "Achievements",
      path: "achievements",
    },
    {
      icon: <FontAwesome5 name="user-astronaut" size={28} color="white" />,
      label: "Avatar",
      path: "avatar",
    },
    {
      icon: <Ionicons name="color-palette" size={28} color="white" />,
      label: "Themes",
      path: "themes",
    },
    {
      icon: <Ionicons name="settings-outline" size={28} color="white" />,
      label: "Settings",
      path: "settings",
    },
    {
      icon: <Ionicons name="help-circle-outline" size={28} color="white" />,
      label: "Help",
      path: "help",
    },
  ]

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={tw`flex-row items-center justify-between px-5 py-4 mb-4`}>
          <View style={tw`flex-row items-center`}>
            <Image
              source={{ uri: "/placeholder.svg?height=50&width=50" }}
              style={tw`w-12 h-12 rounded-full mr-3 bg-gray-700`}
            />
            <View>
              <Text style={tw`text-white text-xl font-bold`}>WhiteMisty</Text>
              <Text style={tw`text-gray-400`}>@WhiteMisty</Text>
            </View>
          </View>

          <View style={tw`flex-row items-center`}>
            <View style={tw`relative mr-4`}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
              <View style={tw`absolute -top-1 -right-1 bg-violet-600 rounded-full w-4 h-4 items-center justify-center`}>
                <Text style={tw`text-white text-xs`}>2</Text>
              </View>
            </View>
            <Ionicons name="mail-outline" size={24} color="white" />
          </View>
        </View>

        {/* Grid Layout */}
        <View style={tw`flex-row flex-wrap px-2 pb-10`}>
          {gridItems.map((item, index) => (
            <TouchableOpacity key={index} style={tw`w-1/3 p-2`} onPress={() => navigateTo(item.path)}>
              <View style={tw`bg-gray-800 rounded-xl p-4 items-center justify-center aspect-square`}>
                <View style={tw`relative`}>{item.icon}</View>
                <Text style={tw`text-white text-sm mt-2 text-center`}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={tw`px-4 pb-6 mt-4`}>
          <TouchableOpacity style={tw`bg-red-600 rounded-xl p-4 items-center`} onPress={handleLogout}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="log-out-outline" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-medium text-lg`}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
