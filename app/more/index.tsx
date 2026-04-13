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
  const { colors, currentTheme, isGlowEnabled } = useTheme()
  const unifiedIconColor = colors.accent
  
  // Add state for user data
  const [userData, setUserData] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarData, setAvatarData] = useState({
    avatar: "🧙‍♂️",
    color: "#8B5CF6",
    border: "normal"
  })

  // Load user data when component mounts
  useEffect(() => {
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

        const savedData = await AsyncStorage.getItem('avatarData')
        if (savedData) {
          const parsed = JSON.parse(savedData)
          setAvatarData({
            avatar: parsed.avatar || "🧙‍♂️",
            color: parsed.color || "#8B5CF6",
            border: parsed.border || "normal"
          })
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Focus effect to reload avatar when coming back from avatar screen
  useEffect(() => {
    const unsubscribe = router.subscribe?.(() => {
      loadAvatarData()
    })
    return () => unsubscribe?.()
  }, [router])

  // Also load avatar on screen focus
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvatarData()
    }, 1000) // Check every second when on this screen
    
    return () => clearInterval(interval)
  }, [])

  // Load avatar data
  const loadAvatarData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('avatarData')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setAvatarData({
          avatar: parsed.avatar || "🧙‍♂️",
          color: parsed.color || "#8B5CF6",
          border: parsed.border || "normal"
        })
      }
    } catch (error) {
      console.log('Error loading avatar data:', error)
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
      icon: <FontAwesome5 name="user-astronaut" size={24} color={unifiedIconColor} />,
      label: "Avatar",
      path: "avatar",
      description: "Customize your profile",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="stats-chart" size={24} color={unifiedIconColor} />,
      label: "Stats",
      path: "stats",
      description: "View your progress",
      color: unifiedIconColor,
    },
    {
      icon: <MaterialCommunityIcons name="trophy-award" size={24} color={unifiedIconColor} />,
      label: "Achievements",
      path: "achievements",
      description: "Unlock badges & rewards",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="people" size={24} color={unifiedIconColor} />,
      label: "Social",
      path: "social",
      description: "Friends, parties & challenges",
      color: unifiedIconColor,
    },
  ]

  const appItems = [
    {
      icon: <Ionicons name="analytics" size={24} color={unifiedIconColor} />,
      label: "Analytics",
      path: "analytics",
      description: "View detailed insights",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="podium" size={24} color={unifiedIconColor} />,
      label: "Leaderboards",
      path: "leaderboards",
      description: "Compete with others",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="color-palette" size={24} color={unifiedIconColor} />,
      label: "Themes",
      path: "themes",
      description: "Customize appearance",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="settings-outline" size={24} color={unifiedIconColor} />,
      label: "Settings",
      path: "settings",
      description: "App preferences",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="shield-checkmark-outline" size={24} color={unifiedIconColor} />,
      label: "Security",
      path: "security",
      description: "Privacy & security",
      color: unifiedIconColor,
    },
    {
      icon: <Ionicons name="help-circle-outline" size={24} color={unifiedIconColor} />,
      label: "Help",
      path: "help",
      description: "Support & FAQ",
      color: unifiedIconColor,
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

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
        
        {/* Profile Card - Compact Premium Design */}
        <View style={tw`mx-5 mb-5`}>
          <View style={[
            tw`rounded-2xl overflow-hidden`,
            {
              backgroundColor: colors.card,
              shadowColor: avatarData.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isGlowEnabled ? 0.12 : 0,
              shadowRadius: isGlowEnabled ? 12 : 0,
              elevation: isGlowEnabled ? 6 : 0,
            }
          ]}>
            {/* Gradient Effect Background */}
            <View style={[
              tw`absolute top-0 left-0 right-0`,
              {
                height: 80,
                backgroundColor: avatarData.color,
                opacity: 0.08,
              }
            ]} />
            
            {/* Profile Content */}
            <View style={tw`p-4`}>
              {/* Avatar & Basic Info */}
              <View style={tw`flex-row items-start mb-4`}>
                {/* Avatar with Premium Styling */}
                <View style={tw`mr-3`}>
                  <View style={[
                    tw`w-16 h-16 rounded-2xl items-center justify-center`,
                    {
                      backgroundColor: avatarData.color + '15',
                      borderWidth: 2.5,
                      borderColor: avatarData.color,
                      shadowColor: avatarData.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isGlowEnabled ? (avatarData.border === 'glow' ? 0.5 : 0.25) : 0,
                      shadowRadius: isGlowEnabled ? (avatarData.border === 'glow' ? 12 : 6) : 0,
                      elevation: isGlowEnabled ? 4 : 0,
                    }
                  ]}>
                    <Text style={tw`text-3xl`}>{avatarData.avatar}</Text>
                  </View>
                  {/* Level Badge on Avatar */}
                  <View style={tw`absolute -bottom-1.5 left-0 right-0 items-center`}>
                    <View style={[
                      tw`px-2 py-0.5 rounded-full flex-row items-center`,
                      {
                        backgroundColor: colors.card,
                        borderWidth: 1.5,
                        borderColor: avatarData.color,
                      }
                    ]}>
                      <Ionicons name="star" size={10} color={avatarData.color} style={tw`mr-0.5`} />
                      <Text style={[tw`text-xs font-bold`, { color: avatarData.color }]}>
                        {stats.level}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* User Info */}
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Text style={[tw`text-lg font-bold mr-2`, { color: colors.text }]}>
                      {displayName}
                    </Text>
                    {isGuest && (
                      <View style={[
                        tw`px-1.5 py-0.5 rounded`,
                        { backgroundColor: colors.warning + '25' }
                      ]}>
                        <Text style={[tw`text-xs font-bold`, { color: colors.warning }]}>GUEST</Text>
                      </View>
                    )}
                  </View>
                  <View style={tw`flex-row items-center mb-0.5`}>
                    <Ionicons name="at" size={12} color={colors.textSecondary} style={tw`mr-1`} />
                    <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                      {userData?.username || "guest"}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center mb-2`}>
                    <Ionicons name="mail-outline" size={12} color={colors.textSecondary} style={tw`mr-1`} />
                    <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                      {displayEmail}
                    </Text>
                  </View>
                  
                  {/* XP Progress Bar */}
                  <View>
                    <View style={tw`flex-row justify-between items-center mb-0.5`}>
                      <Text style={[tw`text-xs`, { color: avatarData.color }]}>
                        {stats.experience}/{stats.maxExperience} XP
                      </Text>
                    </View>
                    <View style={[
                      tw`h-1.5 rounded-full overflow-hidden`,
                      { backgroundColor: colors.cardSecondary }
                    ]}>
                      <View style={[
                        tw`h-full rounded-full`,
                        {
                          width: `${(stats.experience / stats.maxExperience) * 100}%`,
                          backgroundColor: avatarData.color,
                        }
                      ]} />
                    </View>
                  </View>
                </View>

                {/* Edit Button */}
                <TouchableOpacity 
                  style={[
                    tw`p-2 rounded-xl`,
                    { 
                      backgroundColor: avatarData.color + '15',
                      borderWidth: 1,
                      borderColor: avatarData.color + '25',
                    }
                  ]}
                  onPress={() => navigateTo('avatar')}
                >
                  <Ionicons name="create-outline" size={18} color={avatarData.color} />
                </TouchableOpacity>
              </View>

              {/* Stats Grid with Icons */}
              <View style={tw`flex-row flex-wrap justify-between mb-3`}>
                {/* Habits Stat */}
                <View style={[
                  tw`rounded-xl p-2 items-center`,
                  { 
                    backgroundColor: unifiedIconColor + '12',
                    width: '23%',
                    borderWidth: 1,
                    borderColor: unifiedIconColor + '25',
                  }
                ]}>
                  <Ionicons name="checkmark-circle" size={20} color={unifiedIconColor} />
                  <Text style={[tw`text-base font-bold mt-1`, { color: colors.text }]}>
                    {stats.habitsCompleted}
                  </Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Habits</Text>
                </View>

                {/* Dailies Stat */}
                <View style={[
                  tw`rounded-xl p-2 items-center`,
                  { 
                    backgroundColor: unifiedIconColor + '12',
                    width: '23%',
                    borderWidth: 1,
                    borderColor: unifiedIconColor + '25',
                  }
                ]}>
                  <Ionicons name="calendar" size={20} color={unifiedIconColor} />
                  <Text style={[tw`text-base font-bold mt-1`, { color: colors.text }]}>
                    {stats.dailiesCompleted}
                  </Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Dailies</Text>
                </View>

                {/* Routines Stat */}
                <View style={[
                  tw`rounded-xl p-2 items-center`,
                  { 
                    backgroundColor: unifiedIconColor + '12',
                    width: '23%',
                    borderWidth: 1,
                    borderColor: unifiedIconColor + '25',
                  }
                ]}>
                  <Ionicons name="repeat" size={20} color={unifiedIconColor} />
                  <Text style={[tw`text-base font-bold mt-1`, { color: colors.text }]}>
                    {stats.routinesCompleted}
                  </Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Routines</Text>
                </View>

                {/* Focus Stat */}
                <View style={[
                  tw`rounded-xl p-2 items-center`,
                  { 
                    backgroundColor: unifiedIconColor + '12',
                    width: '23%',
                    borderWidth: 1,
                    borderColor: unifiedIconColor + '25',
                  }
                ]}>
                  <Ionicons name="timer" size={20} color={unifiedIconColor} />
                  <Text style={[tw`text-base font-bold mt-1`, { color: colors.text }]}>
                    {stats.focusSessionsToday}
                  </Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Focus</Text>
                </View>
              </View>

              {/* Additional Info Row */}
              {userData?.id && (
                <View style={[
                  tw`flex-row justify-between items-center pt-2.5 border-t`,
                  { borderColor: colors.cardSecondary }
                ]}>
                  <View style={tw`flex-row items-center`}>
                    <View style={[
                      tw`w-6 h-6 rounded-full items-center justify-center mr-1.5`,
                      { backgroundColor: avatarData.color + '18' }
                    ]}>
                      <Ionicons name="finger-print" size={12} color={avatarData.color} />
                    </View>
                    <View>
                      <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>ID #{userData.id}</Text>
                    </View>
                  </View>
                  
                  {userData.createdAt && (
                    <View style={tw`flex-row items-center`}>
                      <View style={[
                        tw`w-6 h-6 rounded-full items-center justify-center mr-1.5`,
                        { backgroundColor: avatarData.color + '18' }
                      ]}>
                        <Ionicons name="calendar-outline" size={12} color={avatarData.color} />
                      </View>
                      <View>
                        <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                          {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
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
                    shadowOpacity: isGlowEnabled ? 0.08 : 0, // reduced from 0.1
                    shadowRadius: isGlowEnabled ? 4 : 0, // reduced from 8
                    elevation: isGlowEnabled ? 2 : 0, // reduced from 4
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
                shadowOpacity: isGlowEnabled ? 0.3 : 0,
                shadowRadius: isGlowEnabled ? 8 : 0,
                elevation: isGlowEnabled ? 8 : 0,
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

