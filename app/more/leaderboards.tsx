"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import tw from "../../lib/tailwind"
import { friendsAPI, socialAPI } from "../../lib/api"

type LeaderboardTab = "xp" | "streak" | "level"

type UserProfile = {
  id: number
  username: string
  avatar: string
  experience: number
  streak: number
  level: number
  isCurrentUser: boolean
}

type LeaderboardEntry = {
  rank: number
  username: string
  avatar: string
  score: number
  isCurrentUser: boolean
}

const getScoreByTab = (profile: UserProfile, tab: LeaderboardTab): number => {
  if (tab === "xp") {
    return profile.experience
  }

  if (tab === "streak") {
    return profile.streak
  }

  return profile.level
}

const formatScore = (score: number, tab: LeaderboardTab): string => {
  if (tab === "xp") {
    return `${score} XP`
  }

  if (tab === "streak") {
    return `${score}d`
  }

  return `Lvl ${score}`
}

const normalizeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseUserData = (rawValue: string | null): Record<string, unknown> | null => {
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch (error) {
    console.error("Unable to parse saved user data:", error)
    return null
  }
}

const buildLeaderboard = (profiles: UserProfile[], tab: LeaderboardTab): LeaderboardEntry[] => {
  const sorted = [...profiles].sort((a, b) => {
    const scoreDiff = getScoreByTab(b, tab) - getScoreByTab(a, tab)
    if (scoreDiff !== 0) {
      return scoreDiff
    }

    return a.username.localeCompare(b.username)
  })

  return sorted.map((profile, index) => ({
    rank: index + 1,
    username: profile.username,
    avatar: profile.avatar || "🙂",
    score: getScoreByTab(profile, tab),
    isCurrentUser: profile.isCurrentUser,
  }))
}

export default function Leaderboards() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("xp")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true)

      const [token, savedUserRaw] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
      ])

      const savedUser = parseUserData(savedUserRaw)
      const currentUserId = normalizeNumber(savedUser?.id, 0)

      if (!token) {
        const localProfiles: UserProfile[] = savedUser
          ? [
            {
              id: currentUserId,
              username: String(savedUser.username || "You"),
              avatar: String(savedUser.avatar || "😊"),
              experience: normalizeNumber(savedUser.experience, 0),
              streak: normalizeNumber(savedUser.current_streak, 0),
              level: normalizeNumber(savedUser.level, 1),
              isCurrentUser: true,
            },
          ]
          : []

        setLeaderboard(buildLeaderboard(localProfiles, activeTab))
        return
      }

      const [friendsResponse, socialStatsResponse] = await Promise.all([
        friendsAPI.getFriends(),
        socialAPI.getStats(),
      ])

      const friendProfiles: UserProfile[] = (friendsResponse.friends || []).map((friend: any) => ({
        id: normalizeNumber(friend.id, 0),
        username: String(friend.username || "Unknown"),
        avatar: String(friend.avatar || "🙂"),
        experience: normalizeNumber(friend.experience, 0),
        streak: normalizeNumber(friend.streak, 0),
        level: normalizeNumber(friend.level, 1),
        isCurrentUser: false,
      }))

      const currentUserProfile: UserProfile | null = savedUser
        ? {
          id: currentUserId,
          username: String(savedUser.username || "You"),
          avatar: String(savedUser.avatar || "😊"),
          experience: normalizeNumber(
            socialStatsResponse?.stats?.totalXpEarned,
            normalizeNumber(savedUser.experience, 0),
          ),
          streak: normalizeNumber(
            socialStatsResponse?.stats?.currentStreak,
            normalizeNumber(savedUser.current_streak, 0),
          ),
          level: normalizeNumber(savedUser.level, 1),
          isCurrentUser: true,
        }
        : null

      const combinedProfiles = currentUserProfile
        ? [currentUserProfile, ...friendProfiles]
        : friendProfiles

      const seen = new Set<string>()
      const uniqueProfiles: UserProfile[] = []

      combinedProfiles.forEach((profile) => {
        const key = profile.id > 0 ? `id:${profile.id}` : `name:${profile.username.toLowerCase()}`
        if (seen.has(key)) {
          return
        }

        seen.add(key)
        uniqueProfiles.push(profile)
      })

      setLeaderboard(buildLeaderboard(uniqueProfiles, activeTab))
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[tw`mt-4`, { color: colors.text }]}>Loading leaderboards...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Leaderboards</Text>
        </View>

        <View style={tw`flex-row mb-6`}>
          {[
            { id: "xp", label: "XP", icon: "flash" },
            { id: "streak", label: "Streak", icon: "flame" },
            { id: "level", label: "Level", icon: "ribbon" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as LeaderboardTab)}
              style={[
                tw`flex-1 py-3 rounded-lg mr-2 flex-row items-center justify-center`,
                { backgroundColor: activeTab === tab.id ? colors.primary : colors.card },
              ]}
            >
              <Ionicons
                name={tab.icon as "flash" | "flame" | "ribbon"}
                size={18}
                color={activeTab === tab.id ? "#FFF" : colors.text}
                style={tw`mr-1`}
              />
              <Text style={[tw`font-semibold`, { color: activeTab === tab.id ? "#FFF" : colors.text }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {leaderboard.length === 0 ? (
          <View style={[tw`rounded-2xl p-6 items-center`, { backgroundColor: colors.card }]}> 
            <Ionicons name="podium-outline" size={40} color={colors.textSecondary} />
            <Text style={[tw`mt-3 text-base`, { color: colors.textSecondary }]}>No leaderboard data available yet.</Text>
          </View>
        ) : (
          <>
            <View style={tw`mb-6 flex-row justify-around items-end`}>
              {leaderboard[1] && (
                <View style={tw`items-center`}>
                  <View
                    style={[
                      tw`w-16 h-16 rounded-full items-center justify-center mb-2`,
                      { backgroundColor: "#C0C0C020", borderWidth: 2, borderColor: "#C0C0C0" },
                    ]}
                  >
                    <Text style={tw`text-2xl`}>{leaderboard[1].avatar}</Text>
                  </View>
                  <Text style={[tw`font-bold`, { color: colors.text }]}>{leaderboard[1].username}</Text>
                  <Text style={[tw`text-sm`, { color: "#C0C0C0" }]}>#{leaderboard[1].rank}</Text>
                  <View style={[tw`w-20 h-16 rounded-t-xl mt-2 items-center justify-center`, { backgroundColor: "#C0C0C030" }]}>
                    <Text style={[tw`font-bold text-center`, { color: colors.text }]}>{formatScore(leaderboard[1].score, activeTab)}</Text>
                  </View>
                </View>
              )}

              {leaderboard[0] && (
                <View style={tw`items-center`}>
                  <Ionicons name="trophy" size={24} color="#FFD700" style={tw`mb-1`} />
                  <View
                    style={[
                      tw`w-20 h-20 rounded-full items-center justify-center mb-2`,
                      { backgroundColor: "#FFD70020", borderWidth: 3, borderColor: "#FFD700" },
                    ]}
                  >
                    <Text style={tw`text-3xl`}>{leaderboard[0].avatar}</Text>
                  </View>
                  <Text style={[tw`font-bold text-lg`, { color: colors.text }]}>{leaderboard[0].username}</Text>
                  <Text style={[tw`text-sm font-bold`, { color: "#FFD700" }]}>#{leaderboard[0].rank}</Text>
                  <View style={[tw`w-24 h-20 rounded-t-xl mt-2 items-center justify-center`, { backgroundColor: "#FFD70030" }]}>
                    <Text style={[tw`font-bold text-center`, { color: colors.text }]}>{formatScore(leaderboard[0].score, activeTab)}</Text>
                  </View>
                </View>
              )}

              {leaderboard[2] && (
                <View style={tw`items-center`}>
                  <View
                    style={[
                      tw`w-16 h-16 rounded-full items-center justify-center mb-2`,
                      { backgroundColor: "#CD7F3220", borderWidth: 2, borderColor: "#CD7F32" },
                    ]}
                  >
                    <Text style={tw`text-2xl`}>{leaderboard[2].avatar}</Text>
                  </View>
                  <Text style={[tw`font-bold`, { color: colors.text }]}>{leaderboard[2].username}</Text>
                  <Text style={[tw`text-sm`, { color: "#CD7F32" }]}>#{leaderboard[2].rank}</Text>
                  <View style={[tw`w-20 h-12 rounded-t-xl mt-2 items-center justify-center`, { backgroundColor: "#CD7F3230" }]}>
                    <Text style={[tw`font-bold text-center`, { color: colors.text }]}>{formatScore(leaderboard[2].score, activeTab)}</Text>
                  </View>
                </View>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {leaderboard.slice(3).map((player) => (
                <View
                  key={`${player.rank}-${player.username}`}
                  style={[
                    tw`flex-row items-center p-4 rounded-xl mb-2`,
                    {
                      backgroundColor: player.isCurrentUser ? `${colors.primary}20` : colors.card,
                      borderWidth: player.isCurrentUser ? 2 : 0,
                      borderColor: player.isCurrentUser ? colors.primary : "transparent",
                    },
                  ]}
                >
                  <Text style={[tw`w-8 font-bold text-lg`, { color: colors.textSecondary }]}>{player.rank}</Text>
                  <View style={[tw`w-12 h-12 rounded-full items-center justify-center mx-3`, { backgroundColor: colors.cardSecondary }]}>
                    <Text style={tw`text-xl`}>{player.avatar}</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={[tw`font-bold`, { color: colors.text }]}>
                      {player.username}
                      {player.isCurrentUser && <Text style={[tw`text-sm`, { color: colors.primary }]}> (You)</Text>}
                    </Text>
                  </View>
                  <Text style={[tw`font-bold`, { color: colors.primary }]}>{formatScore(player.score, activeTab)}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
