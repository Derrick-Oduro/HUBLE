"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Text, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import { friendsAPI, socialAPI } from "../../lib/api"
import { Avatar, Button, Card, Divider, EmptyState, LoadingState, Pill, Screen, Section, Segmented, tint } from "../../components/ui"

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
  const { colors } = useTheme()
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

  const MEDALS = ["#F5B700", "#A1A1AA", "#C27C3A"]
  const me = leaderboard.find((entry) => entry.isCurrentUser)
  const podium = [leaderboard[1], leaderboard[0], leaderboard[2]] // 2nd · 1st · 3rd
  const rest = leaderboard.slice(3)

  return (
    <Screen title="Leaderboard" subtitle="You and your friends">
      <Segmented<LeaderboardTab>
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "xp", label: "XP" },
          { value: "streak", label: "Streak" },
          { value: "level", label: "Level" },
        ]}
      />

      {loading ? (
        <LoadingState label="Loading leaderboard…" />
      ) : leaderboard.length === 0 ? (
        <EmptyState
          icon="podium-outline"
          title="No rankings yet"
          message="Add friends to see how you stack up."
          action={<Button label="Find friends" small icon="person-add-outline" onPress={() => router.push("/more/social/add-friend")} />}
        />
      ) : (
        <>
          {me && (
            <Card highlight={colors.accent} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
              <Text style={{ width: 44, fontSize: 22, fontWeight: "800", color: colors.accent }}>#{me.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Your position</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                  {me.rank === 1 ? "You're on top. Keep it up!" : `Out of ${leaderboard.length} people`}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{formatScore(me.score, activeTab)}</Text>
            </Card>
          )}

          {/* Podium */}
          <Card style={{ flexDirection: "row", alignItems: "flex-end", paddingVertical: 20 }}>
            {podium.map((entry, column) => {
              if (!entry) return <View key={`empty-${column}`} style={{ flex: 1 }} />
              const place = entry.rank - 1
              const isFirst = entry.rank === 1
              return (
                <View key={`${entry.rank}-${entry.username}`} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                  {isFirst && <Ionicons name="trophy" size={18} color={MEDALS[0]} />}
                  <View>
                    <Avatar emoji={entry.avatar} color={MEDALS[place]} size={isFirst ? 60 : 48} />
                    <View
                      style={{
                        position: "absolute",
                        bottom: -6,
                        alignSelf: "center",
                        minWidth: 22,
                        height: 22,
                        paddingHorizontal: 6,
                        borderRadius: 11,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: MEDALS[place],
                        borderWidth: 2,
                        borderColor: colors.card,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>{entry.rank}</Text>
                    </View>
                  </View>
                  <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "700", color: colors.text, maxWidth: 96 }} numberOfLines={1}>
                    {entry.isCurrentUser ? "You" : entry.username}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>{formatScore(entry.score, activeTab)}</Text>
                </View>
              )
            })}
          </Card>

          {rest.length > 0 && (
            <Section title="Everyone else">
              <Card padded={false}>
                {rest.map((player, i) => (
                  <View key={`${player.rank}-${player.username}`}>
                    {i > 0 && <Divider inset={14} />}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        backgroundColor: player.isCurrentUser ? tint(colors.accent, 0.08) : "transparent",
                      }}
                    >
                      <Text style={{ width: 28, fontSize: 14, fontWeight: "700", color: colors.textSecondary }}>{player.rank}</Text>
                      <Avatar emoji={player.avatar} size={36} />
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                          {player.username}
                        </Text>
                        {player.isCurrentUser && <Pill label="You" color={colors.accent} />}
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{formatScore(player.score, activeTab)}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </Section>
          )}
        </>
      )}
    </Screen>
  )
}
