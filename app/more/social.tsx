"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { activityAPI, socialAPI } from "../../lib/api"

type SocialStats = {
  friends: number
  parties: number
  activeChallenges: number
  totalXpEarned: number
  groupBadges: number
  currentStreak: number
  pendingRequests: number
}

type RecentActivityItem = {
  id: number
  type: string
  message: string
  time: string
  icon: string
  color: string
  cheersCount: number
  hasCheered: boolean
}

export default function Social() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [socialStats, setSocialStats] = useState<SocialStats>({
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

  // Load recent activity from friends
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])

  const loadRecentActivity = useCallback(async () => {
    try {
      const response = await activityAPI.getFriendsActivities(10)
      if (response.success) {
        setRecentActivity((response.activities || []).map((activity: any) => ({
          id: Number(activity.id),
          type: activity.activity_type || "activity",
          message: activity.title || "New activity",
          time: getTimeAgo(activity.created_at),
          icon: activity.icon || "sparkles-outline",
          color: activity.color || colors.accent,
          cheersCount: Number(activity.cheers_count || 0),
          hasCheered: Boolean(activity.has_cheered),
        })))
      }
    } catch (error) {
      console.error("Failed to load recent activity:", error)
      setRecentActivity([])
    }
  }, [colors.accent])

  useEffect(() => {
    loadRecentActivity()
  }, [loadRecentActivity])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  const handleCheerToggle = async (activityId: number, currentlyCheered: boolean) => {
    const delta = currentlyCheered ? -1 : 1

    setRecentActivity((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              hasCheered: !currentlyCheered,
              cheersCount: Math.max(0, activity.cheersCount + delta),
            }
          : activity,
      ),
    )

    try {
      const response = currentlyCheered
        ? await activityAPI.uncheerActivity(activityId)
        : await activityAPI.cheerActivity(activityId)

      if (!response?.success) {
        throw new Error("Cheer action failed")
      }

      setRecentActivity((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                hasCheered: Boolean(response.hasCheered),
                cheersCount: Number(response.cheersCount || 0),
              }
            : activity,
        ),
      )
    } catch (error) {
      console.error("Failed to update cheer:", error)
      setRecentActivity((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                hasCheered: currentlyCheered,
                cheersCount: Math.max(0, activity.cheersCount - delta),
              }
            : activity,
        ),
      )
    }
  }

  const socialFeatures: Array<{
    icon: keyof typeof Ionicons.glyphMap
    title: string
    description: string
    count: number
    color: string
    action: () => void
  }> = [
    {
      icon: "people-outline",
      title: "Friends",
      description: "Add friends and view their progress",
      count: socialStats.friends,
      color: colors.accent,
      action: () => router.push('/more/social/friends')
    },
    {
      icon: "shield-outline",
      title: "Parties",
      description: "Join groups for shared goals",
      count: socialStats.parties,
      color: colors.accent,
      action: () => router.push('/more/social/parties')
    },
    {
      icon: "trophy-outline",
      title: "Challenges",
      description: "Compete in community challenges",
      count: socialStats.activeChallenges,
      color: colors.accent,
      action: () => router.push('/more/social/challenges')
    },
    {
      icon: "star-outline",
      title: "Group Badges",
      description: "Achievements earned with others",
      count: socialStats.groupBadges,
      color: colors.accent,
      action: () => router.push('/more/social/group-badges')
    }
  ]

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-2 pt-2 pb-4`}>
        
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
            tw`rounded-2xl p-4 mb-4`,
            { backgroundColor: colors.card }
          ]}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                { backgroundColor: colors.cardSecondary }
              ]}>
                <Ionicons name="people" size={28} color={colors.textSecondary} />
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
                    { backgroundColor: colors.card }
                  ]}
                  onPress={feature.action}
                >
                  <View style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center mb-3`,
                    { backgroundColor: colors.cardSecondary }
                  ]}>
                    <Ionicons name={feature.icon} size={24} color={colors.textSecondary} />
                  </View>
                  
                  <Text style={[tw`font-bold text-base mb-1`, { color: colors.text }]}>{feature.title}</Text>
                  <Text style={[tw`text-sm mb-3`, { color: colors.textSecondary }]}>{feature.description}</Text>
                  
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={[tw`font-bold text-lg`, { color: colors.text }]}>
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
            tw`rounded-2xl p-4 mb-4`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={[tw`font-semibold`, { color: colors.textSecondary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentActivity.map((activity) => (
              <View key={activity.id} style={[tw`flex-row items-center py-3 border-b last:border-b-0`, { borderColor: colors.cardSecondary }]}>
                <View style={[
                  tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
                  { backgroundColor: colors.cardSecondary }
                ]}>
                  <Ionicons
                    name={activity.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                
                <View style={tw`flex-1`}>
                  <Text style={[tw`font-medium`, { color: colors.text }]}>{activity.message}</Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{activity.time}</Text>
                </View>

                <TouchableOpacity
                  style={tw`items-center px-2 py-1`}
                  onPress={() => handleCheerToggle(activity.id, activity.hasCheered)}
                >
                  <Ionicons
                    name={activity.hasCheered ? "heart" : "heart-outline"}
                    size={18}
                    color={activity.hasCheered ? colors.accent : colors.textSecondary}
                  />
                  <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>{activity.cheersCount}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={[
            tw`rounded-2xl p-4 mb-4`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Quick Actions</Text>
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity 
                style={[
                  tw`flex-1 rounded-xl p-4 mr-2 items-center`,
                  { backgroundColor: colors.cardSecondary }
                ]}
                onPress={() => router.push('/more/social/add-friend')}
              >
                <Ionicons name="person-add" size={24} color={colors.text} style={tw`mb-2`} />
                <Text style={[tw`font-bold text-sm`, { color: colors.text }]}>Add Friend</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  tw`flex-1 rounded-xl p-4 ml-2 items-center`,
                  { backgroundColor: colors.accent }
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
            tw`rounded-2xl p-4`,
            { backgroundColor: colors.card } // ← THEME: Use theme card color
          ]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Privacy & Visibility</Text>
            
            <TouchableOpacity 
              style={[tw`flex-row items-center justify-between py-3 border-b`, { borderColor: colors.cardSecondary }]}
              onPress={() => router.push('/more/security')}
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
              onPress={() => router.push('/more/security')}
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
