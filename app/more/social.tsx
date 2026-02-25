"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { socialAPI } from "../../lib/api"

export default function Social() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("overview")
  const [socialStats, setSocialStats] = useState({
    friends: 0,
    parties: 0,
    activeChallenges: 0,
    totalXpEarned: 0,
    groupBadges: 0,
    currentStreak: 0,
    pendingRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  // Load social stats
  useEffect(() => {
    loadSocialStats()
  }, [])

  const loadSocialStats = async () => {
    try {
      setLoading(true)
      const response = await socialAPI.getStats()
      if (response.success && response.stats) {
        setSocialStats(response.stats)
      }
    } catch (error) {
      console.error("Failed to load social stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: "friend_joined",
      message: "CodeMaster completed their study session",
      time: "2 hours ago",
      icon: "person",
      color: "#10B981"
    },
    {
      id: 2,
      type: "party_achievement",
      message: "Study Squad unlocked 'Knowledge Seekers' badge",
      time: "1 day ago",
      icon: "trophy",
      color: "#F59E0B"
    },
    {
      id: 3,
      type: "challenge_progress",
      message: "You moved up to #5 in Meditation Challenge",
      time: "2 days ago",
      icon: "trending-up",
      color: "#8B5CF6"
    }
  ]

  const socialFeatures = [
    {
      icon: "people-outline",
      title: "Friends",
      description: "Add friends and view their progress",
      count: socialStats.friends,
      color: "#10B981",
      action: () => router.push('/more/social/friends')
    },
    {
      icon: "shield-outline",
      title: "Parties",
      description: "Join groups for shared goals",
      count: socialStats.parties,
      color: "#8B5CF6",
      action: () => router.push('/more/social/parties')
    },
    {
      icon: "trophy-outline",
      title: "Challenges",
      description: "Compete in community challenges",
      count: socialStats.activeChallenges,
      color: "#F59E0B",
      action: () => router.push('/more/social/challenges')
    },
    {
      icon: "star-outline",
      title: "Group Badges",
      description: "Achievements earned with others",
      count: socialStats.groupBadges,
      color: "#EC4899",
      action: () => router.push('/more/social/group-badges')
    }
  ]

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-6 mt-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>Social Hub</Text>
          </View>
          <TouchableOpacity onPress={loadSocialStats} disabled={loading}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color={loading ? colors.textSecondary : colors.text} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Social Stats Overview */}
          <View style={[
            tw`rounded-2xl p-6 mb-6`,
            {
              backgroundColor: colors.card, // ← THEME: Use theme card color
              shadowColor: '#EC4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                {
                  backgroundColor: '#EC489920',
                  borderWidth: 2,
                  borderColor: '#EC4899',
                }
              ]}>
                <Ionicons name="people" size={28} color="#EC4899" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Social Profile</Text>
                <Text style={[tw``, { color: colors.textSecondary }]}>Connect, compete & achieve together</Text>
              </View>
            </View>

            <View style={[tw`flex-row justify-between pt-4 border-t`, { borderColor: colors.cardSecondary }]}>
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{socialStats.friends}</Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Friends</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{socialStats.parties}</Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Parties</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{socialStats.groupBadges}</Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Badges</Text>
              </View>
              <View style={tw`items-center`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="flame" size={14} color={colors.accent} />
                  <Text style={[tw`text-xs ml-1`, { color: colors.textSecondary }]}>Streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Social Features Grid */}
          <View style={tw`mb-6`}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Features</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {socialFeatures.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-40 rounded-2xl p-4 mb-4`,
                    {
                      backgroundColor: colors.card, // ← THEME: Use theme card color
                      shadowColor: feature.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  ]}
                  onPress={feature.action}
                >
                  <View style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center mb-3`,
                    { backgroundColor: `${feature.color}20` }
                  ]}>
                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                  </View>
                  
                  <Text style={[tw`font-bold text-base mb-1`, { color: colors.text }]}>{feature.title}</Text>
                  <Text style={[tw`text-sm mb-3`, { color: colors.textSecondary }]}>{feature.description}</Text>
                  
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={[tw`font-bold text-lg`, { color: feature.color }]}>
                      {feature.count}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={tw`text-pink-400 font-semibold`}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentActivity.map((activity) => (
              <View key={activity.id} style={[tw`flex-row items-center py-3 border-b last:border-b-0`, { borderColor: colors.cardSecondary }]}>
                <View style={[
                  tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
                  { backgroundColor: `${activity.color}20` }
                ]}>
                  <Ionicons name={activity.icon} size={20} color={activity.color} />
                </View>
                
                <View style={tw`flex-1`}>
                  <Text style={[tw`font-medium`, { color: colors.text }]}>{activity.message}</Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Quick Actions</Text>
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity 
                style={[
                  tw`flex-1 bg-green-600 rounded-xl p-4 mr-2 items-center`,
                  {
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => router.push('/more/social/add-friend')}
              >
                <Ionicons name="person-add" size={24} color="white" style={tw`mb-2`} />
                <Text style={tw`text-white font-bold text-sm`}>Add Friend</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  tw`flex-1 bg-violet-600 rounded-xl p-4 ml-2 items-center`,
                  {
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => router.push('/more/social/create-party')}
              >
                <Ionicons name="add-circle" size={24} color="white" style={tw`mb-2`} />
                <Text style={tw`text-white font-bold text-sm`}>Create Party</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={[
            tw`rounded-2xl p-5`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Privacy & Visibility</Text>
            
            <TouchableOpacity 
              style={[tw`flex-row items-center justify-between py-3 border-b`, { borderColor: colors.cardSecondary }]}
              onPress={() => router.push('/more/social/privacy')}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="eye-outline" size={20} color={colors.textSecondary} style={tw`mr-3`} />
                <Text style={[tw`font-medium`, { color: colors.text }]}>Profile Visibility</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={[tw`mr-2`, { color: colors.textSecondary }]}>Public</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={tw`flex-row items-center justify-between py-3`}
              onPress={() => router.push('/more/social/blocked-users')}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="ban-outline" size={20} color={colors.textSecondary} style={tw`mr-3`} />
                <Text style={[tw`font-medium`, { color: colors.text }]}>Blocked Users</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={[tw`mr-2`, { color: colors.textSecondary }]}>0</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}