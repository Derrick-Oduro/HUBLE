"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React, { useState, useEffect } from "react"

export default function More() {
  const router = useRouter()
  const { stats } = useStats()
  const { colors, currentTheme } = useTheme()
  
  // Add state for user data
  const [userData, setUserData] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user data when component mounts
  useEffect(() => {
    loadUserData()
  }, [])

  // Update the loadUserData function with more logging:
  const loadUserData = async () => {
    try {
      console.log('🔍 Loading user data from AsyncStorage...');
      
      const userDataString = await AsyncStorage.getItem("userData")
      const guestStatus = await AsyncStorage.getItem("isGuest")
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn")
      const userToken = await AsyncStorage.getItem("userToken")
      
      console.log('📥 Raw userData:', userDataString);
      console.log('📥 Guest status:', guestStatus);
      console.log('📥 Is logged in:', isLoggedIn);
      console.log('📥 User token:', userToken ? 'Present' : 'Missing');
      
      if (userDataString) {
        const user = JSON.parse(userDataString)
        console.log('✅ Parsed user data:', user);
        setUserData(user)
      } else {
        console.log('❌ No user data found in AsyncStorage');
      }
      
      setIsGuest(guestStatus === "true")
    } catch (error) {
      console.error("❌ Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to navigate to a specific page
  const navigateTo = (path: string) => {
    router.push(`/more/${path}`)
  }

  const handleLogout = async () => {
    try {
      // Clear all authentication data
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userData")
      await AsyncStorage.removeItem("isLoggedIn")
      await AsyncStorage.removeItem("isGuest")
      
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

  // Show loading state while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center`, { backgroundColor: colors.background }]}>
        <Text style={[tw`text-lg`, { color: colors.text }]}>Loading...</Text>
      </SafeAreaView>
    )
  }

  // Get display values with fallbacks
  const displayName = userData?.username || "Guest User"
  const displayEmail = userData?.email || "guest@huble.app"
  const userHandle = isGuest ? "@Guest" : `@${userData?.username || "user"}`

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
        
        {/* Profile Card - slightly more compact */}
        <View style={[
          tw`mx-5 mb-6 rounded-2xl p-5`, // p-6 → p-5
          {
            backgroundColor: colors.card,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 }, // reduced from height: 4
            shadowOpacity: 0.08, // reduced from 0.1
            shadowRadius: 8, // reduced from 12
            elevation: 4, // reduced from 8
          }
        ]}>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={[
              tw`w-14 h-14 rounded-2xl mr-4 items-center justify-center`, // w-16 h-16 → w-14 h-14
              {
                backgroundColor: colors.accent + '20',
                borderWidth: 2,
                borderColor: colors.accent,
              }
            ]}>
              <FontAwesome5 name="user-astronaut" size={22} color={colors.accent} /> {/* size 24 → 22 */}
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Text style={[tw`text-xl font-bold mr-2`, { color: colors.text }]}>{displayName}</Text> {/* text-2xl → text-xl */}
                {isGuest && (
                  <View style={[
                    tw`px-2 py-1 rounded-full`,
                    { backgroundColor: colors.warning + '20' }
                  ]}>
                    <Text style={[tw`text-xs font-bold`, { color: colors.warning }]}>GUEST</Text>
                  </View>
                )}
              </View>
              <Text style={[tw`text-sm mb-1`, { color: colors.textSecondary }]}>{userHandle}</Text> {/* text-base → text-sm */}
              <Text style={[tw`text-xs mb-2`, { color: colors.textSecondary }]}>{displayEmail}</Text> {/* text-sm → text-xs */}
              <View style={tw`flex-row items-center`}>
                <View style={[
                  tw`px-3 py-1 rounded-full mr-2`,
                  { backgroundColor: colors.accent + '20' }
                ]}>
                  <Text style={[tw`text-sm font-bold`, { color: colors.accent }]}>Level {stats.level}</Text>
                </View>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}> {/* text-sm → text-xs */}
                  {stats.experience}/{stats.maxExperience} XP
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                tw`p-2 rounded-xl`, // p-3 → p-2
                { backgroundColor: colors.cardSecondary }
              ]}
              onPress={() => navigateTo('avatar')}
            >
              <Ionicons name="create-outline" size={18} color={colors.text} /> {/* size 20 → 18 */}
            </TouchableOpacity>
          </View>

          {/* User ID & Join Date - more compact */}
          {userData?.id && (
            <View style={[tw`mb-3 p-3 rounded-lg`, { backgroundColor: colors.cardSecondary }]}> {/* mb-4 → mb-3 */}
              <Text style={[tw`text-xs font-bold mb-1`, { color: colors.textSecondary }]}>USER ID</Text>
              <Text style={[tw`text-sm font-mono`, { color: colors.text }]}>#{userData.id}</Text>
              {userData.createdAt && (
                <>
                  <Text style={[tw`text-xs font-bold mt-2 mb-1`, { color: colors.textSecondary }]}>MEMBER SINCE</Text>
                  <Text style={[tw`text-sm`, { color: colors.text }]}>
                    {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Quick Stats - unchanged */}
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

        {/* Account Section - slightly more compact */}
        <View style={tw`px-5 mb-5`}> {/* mb-6 → mb-5 */}
          <Text style={[tw`text-xl font-bold mb-3`, { color: colors.text }]}>Account</Text> {/* mb-4 → mb-3 */}
          <View style={tw`space-y-2`}> {/* space-y-3 → space-y-2 */}
            {accountItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`rounded-xl p-4 flex-row items-center`, // rounded-2xl → rounded-xl
                  {
                    backgroundColor: colors.card,
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 1 }, // reduced from height: 2
                    shadowOpacity: 0.08, // reduced from 0.1
                    shadowRadius: 4, // reduced from 8
                    elevation: 2, // reduced from 4
                  }
                ]}
                onPress={() => navigateTo(item.path)}
                activeOpacity={0.8}
              >
                <View style={[
                  tw`w-11 h-11 rounded-xl items-center justify-center mr-4`, // w-12 h-12 → w-11 h-11
                  { backgroundColor: `${item.color}20` }
                ]}>
                  {React.cloneElement(item.icon, { size: 22 })} {/* size 24 → 22 */}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-base font-semibold`, { color: colors.text }]}>{item.label}</Text> {/* text-lg → text-base */}
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>{item.description}</Text> {/* text-sm → text-xs */}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /> {/* size 20 → 18 */}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Settings Section - slightly more compact */}
        <View style={tw`px-5 mb-5`}> {/* mb-6 → mb-5 */}
          <Text style={[tw`text-xl font-bold mb-3`, { color: colors.text }]}>App Settings</Text> {/* mb-4 → mb-3 */}
          <View style={[tw`rounded-xl overflow-hidden`, { backgroundColor: colors.card }]}> {/* rounded-2xl → rounded-xl */}
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
                  tw`w-9 h-9 rounded-lg items-center justify-center mr-4`, // w-10 h-10 → w-9 h-9
                  { backgroundColor: `${item.color}20` }
                ]}>
                  {React.cloneElement(item.icon, { size: 20 })} {/* size 24 → 20 */}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>{item.description}</Text> {/* text-sm → text-xs */}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} /> {/* size 18 → 16 */}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Section - keep the same */}
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
            <Text style={tw`text-white font-bold text-lg`}>
              {isGuest ? "End Guest Session" : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
