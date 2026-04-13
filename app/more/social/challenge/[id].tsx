"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import tw from "../../../../lib/tailwind"
import { challengesAPI } from "../../../../lib/api"

type ChallengeDetailsData = {
  id: number
  title: string
  description: string
  emoji?: string
  color?: string
  difficulty?: string
  participant_count?: number
  reward?: string
  goal_value?: number
  goal_type?: string
  mode?: "competitive" | "cooperative" | string
  team_target?: number
  group_progress?: number
  start_date?: string
  end_date?: string
}

type ChallengeLeaderboardEntry = {
  rank: number
  username: string
  avatar?: string
  level?: number
  progress: number
}

const normalizeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatDate = (value?: string): string => {
  if (!value) {
    return "TBD"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return "TBD"
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatTimeLeft = (endDate?: string): string => {
  if (!endDate) {
    return "No end date"
  }

  const now = new Date()
  const end = new Date(endDate)
  const diffMs = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return "Ended"
  }

  if (diffDays === 0) {
    return "Ends today"
  }

  if (diffDays === 1) {
    return "1 day left"
  }

  return `${diffDays} days left`
}

export default function ChallengeDetails() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const { id } = useLocalSearchParams<{ id?: string | string[] }>()

  const challengeId = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id
    const parsed = Number(rawId)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [challenge, setChallenge] = useState<ChallengeDetailsData | null>(null)
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>([])
  const [hasJoined, setHasJoined] = useState(false)
  const [userProgress, setUserProgress] = useState(0)

  const loadChallengeData = useCallback(async () => {
    if (!challengeId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const [challengeResult, leaderboardResult, userChallengesResult] = await Promise.allSettled([
        challengesAPI.getChallenge(challengeId),
        challengesAPI.getChallengeLeaderboard(challengeId),
        challengesAPI.getUserChallenges(),
      ])

      if (challengeResult.status !== "fulfilled" || !challengeResult.value.challenge) {
        throw new Error("Challenge not found")
      }

      const challengeData = challengeResult.value.challenge as ChallengeDetailsData
      setChallenge(challengeData)

      if (leaderboardResult.status === "fulfilled") {
        const list = (leaderboardResult.value.leaderboard || []).map((entry: any) => ({
          rank: normalizeNumber(entry.rank, 0),
          username: String(entry.username || "Unknown"),
          avatar: String(entry.avatar || "🙂"),
          level: normalizeNumber(entry.level, 1),
          progress: normalizeNumber(entry.progress, 0),
        }))
        setLeaderboard(list)
      } else {
        setLeaderboard([])
      }

      if (userChallengesResult.status === "fulfilled") {
        const joinedChallenge = (userChallengesResult.value.challenges || []).find(
          (item: any) => normalizeNumber(item.id, 0) === challengeId,
        )

        if (joinedChallenge) {
          setHasJoined(true)
          setUserProgress(normalizeNumber(joinedChallenge.progress, 0))
        } else {
          setHasJoined(false)
          setUserProgress(0)
        }
      } else {
        setHasJoined(false)
        setUserProgress(0)
      }
    } catch (error) {
      console.error("Failed to load challenge details:", error)
      const message = error instanceof Error ? error.message : "Failed to load challenge"
      Alert.alert("Error", message)
      setChallenge(null)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    loadChallengeData()
  }, [loadChallengeData])

  const goalValue = useMemo(() => {
    return Math.max(1, normalizeNumber(challenge?.goal_value, 1))
  }, [challenge])

  const progressStep = useMemo(() => {
    return Math.max(1, Math.ceil(goalValue / 10))
  }, [goalValue])

  const progressPercent = Math.min(100, Math.round((userProgress / goalValue) * 100))
  const isCompleted = hasJoined && userProgress >= goalValue
  const challengeColor = challenge?.color || colors.accent
  const challengeMode = `${challenge?.mode || "competitive"}`.toLowerCase()
  const teamTarget = Math.max(goalValue, normalizeNumber(challenge?.team_target, goalValue))
  const groupProgress = normalizeNumber(challenge?.group_progress, 0)
  const cooperativeProgressPercent = Math.min(100, Math.round((groupProgress / Math.max(1, teamTarget)) * 100))

  const handlePrimaryAction = async () => {
    if (!challengeId || !challenge) {
      return
    }

    try {
      setSubmitting(true)

      if (!hasJoined) {
        await challengesAPI.joinChallenge(challengeId)
        setHasJoined(true)
        setUserProgress(0)
        Alert.alert("Joined Challenge", "You are now part of this challenge.")
      } else if (isCompleted) {
        Alert.alert("Challenge Complete", "You already completed this challenge.")
        return
      } else {
        const nextProgress = Math.min(goalValue, userProgress + progressStep)
        await challengesAPI.updateChallengeProgress(challengeId, nextProgress)
        setUserProgress(nextProgress)
        Alert.alert("Progress Updated", `Your progress is now ${nextProgress}/${goalValue}.`)
      }

      await loadChallengeData()
    } catch (error) {
      console.error("Challenge action failed:", error)
      const message = error instanceof Error ? error.message : "Could not update challenge"
      Alert.alert("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  const LeaderboardItem = ({ item }: { item: ChallengeLeaderboardEntry }) => (
    <View
      style={[
        tw`rounded-xl p-4 flex-row items-center mb-3`,
        { backgroundColor: colors.cardSecondary },
        item.rank <= 3 && {
          borderWidth: 2,
          borderColor: item.rank === 1 ? "#F59E0B" : item.rank === 2 ? "#9CA3AF" : "#CD7C2F",
        },
      ]}
    >
      <View
        style={[
          tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
          {
            backgroundColor:
              item.rank === 1
                ? "#F59E0B"
                : item.rank === 2
                  ? "#9CA3AF"
                  : item.rank === 3
                    ? "#CD7C2F"
                    : "#6B7280",
          },
        ]}
      >
        <Text style={tw`text-white font-bold text-sm`}>#{item.rank}</Text>
      </View>

      <View
        style={[
          tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
          { backgroundColor: `${challengeColor}20` },
        ]}
      >
        <Text style={tw`text-lg`}>{item.avatar || "🙂"}</Text>
      </View>

      <View style={tw`flex-1`}>
        <Text style={[tw`font-semibold`, { color: colors.text }]}>{item.username}</Text>
        <Text style={[tw`text-sm`, { color: colors.textSecondary }]}> 
          {item.progress}/{goalValue} progress • Lvl {item.level || 1}
        </Text>
      </View>

      {item.rank <= 3 && (
        <Ionicons
          name="trophy"
          size={20}
          color={item.rank === 1 ? "#F59E0B" : item.rank === 2 ? "#9CA3AF" : "#CD7C2F"}
        />
      )}
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading challenge...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!challengeId) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[tw`text-lg font-bold mt-4`, { color: colors.text }]}>Invalid challenge ID</Text>
          <TouchableOpacity
            style={[tw`mt-6 px-6 py-3 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={tw`text-white font-semibold`}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!challenge) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
          <Text style={[tw`text-lg font-bold mt-4`, { color: colors.text }]}>Challenge not found</Text>
          <TouchableOpacity
            style={[tw`mt-6 px-6 py-3 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={loadChallengeData}
          >
            <Text style={tw`text-white font-semibold`}>Retry</Text>
          </TouchableOpacity>
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
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Challenge</Text>
          <TouchableOpacity style={tw`p-2`} onPress={loadChallengeData}>
            <Ionicons name="refresh-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              tw`rounded-2xl p-6 mb-6`,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={tw`flex-row items-center mb-4`}>
              <View
                style={[
                  tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                  { backgroundColor: `${challengeColor}20` },
                ]}
              >
                <Text style={tw`text-3xl`}>{challenge.emoji || "🏆"}</Text>
              </View>

              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Text style={[tw`text-xl font-bold mr-2`, { color: colors.text }]}>{challenge.title}</Text>
                  {challengeMode === "cooperative" && (
                    <View style={[tw`px-2 py-1 rounded`, { backgroundColor: `${colors.success}20` }]}>
                      <Text style={[tw`text-xs font-bold`, { color: colors.success }]}>CO-OP</Text>
                    </View>
                  )}
                </View>
                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`px-2 py-1 rounded mr-2`,
                      { backgroundColor: `${challengeColor}20` },
                    ]}
                  >
                    <Text style={[tw`text-xs font-bold`, { color: challengeColor }]}>
                      {challenge.difficulty || "Medium"}
                    </Text>
                  </View>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>⏰ {formatTimeLeft(challenge.end_date)}</Text>
                </View>
              </View>
            </View>

            <Text style={[tw`mb-4 leading-5`, { color: colors.textSecondary }]}>{challenge.description}</Text>

            <View style={[tw`flex-row justify-between items-center pt-4 border-t`, { borderColor: colors.cardSecondary }]}>
              <Text style={{ color: colors.textSecondary }}>👥 {challenge.participant_count || 0} participants</Text>
              <Text style={{ color: colors.text }}>🏆 {challenge.reward || "Challenge reward"}</Text>
            </View>
          </View>

          {challengeMode === "cooperative" && (
            <View
              style={[
                tw`rounded-2xl p-5 mb-6`,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Team Progress</Text>
                <Text style={[tw`font-bold`, { color: colors.success }]}>
                  {groupProgress}/{teamTarget}
                </Text>
              </View>
              <View style={[tw`h-3 rounded-full overflow-hidden mb-2`, { backgroundColor: colors.cardSecondary }]}> 
                <View
                  style={[
                    tw`h-full rounded-full`,
                    {
                      width: `${cooperativeProgressPercent}%`,
                      backgroundColor: colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                Cooperative goal completion: {cooperativeProgressPercent}%
              </Text>
            </View>
          )}

          {hasJoined && (
            <View
              style={[
                tw`rounded-2xl p-5 mb-6`,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Your Progress</Text>
                <Text style={[tw`font-bold`, { color: challengeColor }]}> 
                  {userProgress}/{goalValue}
                </Text>
              </View>

              <View style={[tw`h-3 rounded-full overflow-hidden mb-2`, { backgroundColor: colors.cardSecondary }]}> 
                <View
                  style={[
                    tw`h-full rounded-full`,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: challengeColor,
                    },
                  ]}
                />
              </View>

              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{progressPercent}% complete</Text>
            </View>
          )}

          <View
            style={[
              tw`rounded-2xl p-5 mb-6`,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Leaderboard</Text>

            {leaderboard.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>No leaderboard entries yet.</Text>
            ) : (
              leaderboard.slice(0, 10).map((item) => <LeaderboardItem key={`${item.rank}-${item.username}`} item={item} />)
            )}
          </View>

          <View
            style={[
              tw`rounded-2xl p-5 mb-6`,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Challenge Details</Text>

            <View style={tw`mb-3`}>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Goal</Text>
              <Text style={[tw`font-semibold`, { color: colors.text }]}> 
                Reach {goalValue} ({challenge.goal_type || "count"})
              </Text>
            </View>

            <View style={tw`mb-3`}>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Start Date</Text>
              <Text style={[tw`font-semibold`, { color: colors.text }]}>{formatDate(challenge.start_date)}</Text>
            </View>

            <View style={tw`mb-3`}>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>End Date</Text>
              <Text style={[tw`font-semibold`, { color: colors.text }]}>{formatDate(challenge.end_date)}</Text>
            </View>

            {challengeMode === "cooperative" && (
              <View style={tw`mb-3`}>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Mode</Text>
                <Text style={[tw`font-semibold`, { color: colors.success }]}>Cooperative Team Challenge</Text>
              </View>
            )}

            {challengeMode === "cooperative" && (
              <View style={tw`mb-3`}>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Team Target</Text>
                <Text style={[tw`font-semibold`, { color: colors.text }]}>{teamTarget}</Text>
              </View>
            )}

            <View>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Reward</Text>
              <Text style={[tw`font-semibold`, { color: colors.text }]}>{challenge.reward || "Challenge reward"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              tw`rounded-2xl p-4 mb-4`,
              {
                backgroundColor: isCompleted ? colors.success : challengeColor,
                shadowColor: isCompleted ? colors.success : challengeColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: submitting ? 0.8 : 1,
              },
            ]}
            onPress={handlePrimaryAction}
            disabled={submitting}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>
              {!hasJoined
                ? "Join Challenge"
                : isCompleted
                  ? "Challenge Completed"
                  : `Add ${progressStep} Progress`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
