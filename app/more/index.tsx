"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"

export default function More() {
  const router = useRouter()

  // Function to reset app data
  const resetAppData = () => {
    // Reset functionality would go here
    console.log("App data reset")
  }

  // Function to navigate to a specific page
  const navigateTo = (path) => {
    router.push(`/more/${path}`)
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={tw`flex-row items-center justify-between px-5 py-4`}>
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

        {/* 1️⃣ User Progress & Stats */}
        <View style={tw`mx-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="stats-chart" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white text-lg font-medium`}>User Progress & Stats</Text>
          </View>

          <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("stats")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Stats & Analytics</Text>
                <Text style={tw`text-gray-400 text-sm`}>Track XP, habit streaks, and progress</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4`}
              onPress={() => navigateTo("achievements")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Achievements & Badges</Text>
                <Text style={tw`text-gray-400 text-sm`}>Unlockable rewards for consistency</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2️⃣ Inventory & Customization */}
        <View style={tw`mx-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <FontAwesome5 name="suitcase" size={16} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white text-lg font-medium`}>Inventory & Customization</Text>
          </View>

          <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("avatar")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Customize Avatar</Text>
                <Text style={tw`text-gray-400 text-sm`}>Change profile appearance</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4`}
              onPress={() => navigateTo("equipment")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Equipment & Items</Text>
                <Text style={tw`text-gray-400 text-sm`}>Collectible rewards or boosters</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3️⃣ Shops & Rewards */}
        <View style={tw`mx-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <MaterialCommunityIcons name="shopping-outline" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white text-lg font-medium`}>Shops & Rewards</Text>
          </View>

          <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("market")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Market</Text>
                <Text style={tw`text-gray-400 text-sm`}>Buy rewards using in-game currency</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4`}
              onPress={() => navigateTo("quests")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Quests</Text>
                <Text style={tw`text-gray-400 text-sm`}>Special challenges for extra motivation</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-violet-600 rounded-full px-3 py-1 mr-2`}>
                  <Text style={tw`text-white text-xs`}>New</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4️⃣ Settings & Customization */}
        <View style={tw`mx-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="settings-outline" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white text-lg font-medium`}>Settings & Customization</Text>
          </View>

          <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("themes")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Themes & Dark Mode</Text>
                <Text style={tw`text-gray-400 text-sm`}>UI personalization</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("notifications")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Notifications & Reminders</Text>
                <Text style={tw`text-gray-400 text-sm`}>Habit and daily task alerts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("backup")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Data Backup & Sync</Text>
                <Text style={tw`text-gray-400 text-sm`}>Cloud or local backups</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4`}
              onPress={() => navigateTo("security")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Security & Privacy</Text>
                <Text style={tw`text-gray-400 text-sm`}>PIN lock, biometric authentication</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5️⃣ Help & Support */}
        <View style={tw`mx-5 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Feather name="help-circle" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white text-lg font-medium`}>Help & Support</Text>
          </View>

          <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("help")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Help & Tutorials</Text>
                <Text style={tw`text-gray-400 text-sm`}>Guide for new users</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4 border-b border-gray-700`}
              onPress={() => navigateTo("news")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>News & Updates</Text>
                <Text style={tw`text-gray-400 text-sm`}>Announcements for new features</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center p-4`}
              onPress={() => navigateTo("feedback")}
            >
              <View>
                <Text style={tw`text-white text-lg`}>Feedback & Support</Text>
                <Text style={tw`text-gray-400 text-sm`}>Contact support or send suggestions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button - REMOVED */}
        <View style={tw`mx-5 mb-10`}>{/* Reset button removed - functionality moved to Backup & Sync page */}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

