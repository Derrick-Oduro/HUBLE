"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Alert, RefreshControl, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import { challengesAPI } from "../../../../lib/api"
import { Avatar, Button, Card, Divider, EmojiTile, EmptyState, LoadingState, Pill, ProgressBar, Screen, Section, IconName } from "../../../../components/ui"

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

const MEDALS = ["#F5B700", "#A1A1AA", "#C27C3A"]

const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatDate = (value?: string) => {
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "TBD"
}

const formatTimeLeft = (endDate?: string) => {
  if (!endDate) return "No end date"
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  if (Number.isNaN(days)) return "No end date"
  if (days < 0) return "Ended"
  if (days === 0) return "Ends today"
  return days === 1 ? "1 day left" : `${days} days left`
}

function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{value}</Text>
    </View>
  )
}

export default function ChallengeDetails() {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id?: string | string[] }>()

  const challengeId = useMemo(() => {
    const parsed = Number(Array.isArray(id) ? id[0] : id)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
      const [challengeResult, leaderboardResult, userChallengesResult] = await Promise.allSettled([
        challengesAPI.getChallenge(challengeId),
        challengesAPI.getChallengeLeaderboard(challengeId),
        challengesAPI.getUserChallenges(),
      ])

      if (challengeResult.status !== "fulfilled" || !challengeResult.value.challenge) {
        throw new Error("Challenge not found")
      }
      setChallenge(challengeResult.value.challenge as ChallengeDetailsData)

      setLeaderboard(
        leaderboardResult.status === "fulfilled"
          ? (leaderboardResult.value.leaderboard || []).map((entry: any) => ({
              rank: num(entry.rank),
              username: String(entry.username || "Unknown"),
              avatar: String(entry.avatar || "🙂"),
              level: num(entry.level, 1),
              progress: num(entry.progress),
            }))
          : [],
      )

      const joined =
        userChallengesResult.status === "fulfilled"
          ? (userChallengesResult.value.challenges || []).find((item: any) => num(item.id) === challengeId)
          : null
      setHasJoined(Boolean(joined))
      setUserProgress(joined ? num(joined.progress) : 0)
    } catch (error) {
      console.error("Failed to load challenge details:", error)
      setChallenge(null)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    loadChallengeData()
  }, [loadChallengeData])

  const goalValue = Math.max(1, num(challenge?.goal_value, 1))
  const progressStep = Math.max(1, Math.ceil(goalValue / 10))
  const progressPercent = Math.min(100, Math.round((userProgress / goalValue) * 100))
  const isCompleted = hasJoined && userProgress >= goalValue
  const color = challenge?.color || colors.accent
  const isCoop = `${challenge?.mode || "competitive"}`.toLowerCase() === "cooperative"
  const teamTarget = Math.max(goalValue, num(challenge?.team_target, goalValue))
  const groupProgress = num(challenge?.group_progress)
  const teamPercent = Math.min(100, Math.round((groupProgress / Math.max(1, teamTarget)) * 100))

  const handlePrimaryAction = async () => {
    if (!challengeId || !challenge || isCompleted) return
    try {
      setSubmitting(true)
      if (!hasJoined) {
        await challengesAPI.joinChallenge(challengeId)
        setHasJoined(true)
        setUserProgress(0)
      } else {
        const next = Math.min(goalValue, userProgress + progressStep)
        await challengesAPI.updateChallengeProgress(challengeId, next)
        setUserProgress(next)
      }
      await loadChallengeData()
    } catch (error) {
      console.error("Challenge action failed:", error)
      Alert.alert("Couldn't update challenge", error instanceof Error ? error.message : "Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadChallengeData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <Screen title="Challenge">
        <LoadingState />
      </Screen>
    )
  }

  if (!challengeId || !challenge) {
    return (
      <Screen title="Challenge">
        <EmptyState
          icon="flag-outline"
          title="Challenge not found"
          message="It may have ended or been removed."
          action={challengeId ? <Button label="Try again" small icon="refresh" onPress={onRefresh} /> : undefined}
        />
      </Screen>
    )
  }

  return (
    <Screen
      title={challenge.title}
      subtitle={formatTimeLeft(challenge.end_date)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      {/* Overview */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <EmojiTile emoji={challenge.emoji || "🏆"} color={color} size={56} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <Pill label={challenge.difficulty || "Medium"} color={color} />
              {isCoop && <Pill label="Co-op" color={colors.success} />}
              <Pill label={`${challenge.participant_count || 0} joined`} icon="people" />
            </View>
          </View>
        </View>
        {!!challenge.description && <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text }}>{challenge.description}</Text>}
      </Card>

      {/* Progress */}
      {(hasJoined || isCoop) && (
        <Card style={{ gap: 14 }}>
          {hasJoined && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Your progress</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  <Text style={{ fontWeight: "800", color: colors.text }}>{userProgress}</Text> / {goalValue}
                </Text>
              </View>
              <ProgressBar value={progressPercent / 100} color={isCompleted ? colors.success : color} height={8} />
            </View>
          )}
          {hasJoined && isCoop && <Divider />}
          {isCoop && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Team progress</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  <Text style={{ fontWeight: "800", color: colors.text }}>{groupProgress}</Text> / {teamTarget}
                </Text>
              </View>
              <ProgressBar value={teamPercent / 100} color={colors.success} height={8} />
            </View>
          )}
        </Card>
      )}

      <Button
        label={!hasJoined ? "Join challenge" : isCompleted ? "Completed" : `Log +${progressStep} progress`}
        icon={!hasJoined ? "flag" : isCompleted ? "checkmark-circle" : "add"}
        variant={isCompleted ? "secondary" : "primary"}
        loading={submitting}
        disabled={isCompleted}
        onPress={handlePrimaryAction}
      />

      <Section title="Leaderboard">
        {leaderboard.length === 0 ? (
          <EmptyState icon="podium-outline" title="No one on the board yet" message="Join and log progress to claim the top spot." />
        ) : (
          <Card padded={false}>
            {leaderboard.slice(0, 10).map((entry, i) => (
              <View key={`${entry.rank}-${entry.username}`}>
                {i > 0 && <Divider inset={14} />}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: entry.rank <= 3 ? MEDALS[entry.rank - 1] : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "800", color: entry.rank <= 3 ? "#FFFFFF" : colors.textSecondary }}>{entry.rank}</Text>
                  </View>
                  <Avatar emoji={entry.avatar} size={34} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                      {entry.username}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Level {entry.level || 1}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                    {entry.progress}/{goalValue}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title="Details">
        <Card style={{ paddingVertical: 4 }}>
          <DetailRow icon="flag-outline" label="Goal" value={`${goalValue} ${challenge.goal_type || "count"}`} />
          <Divider />
          <DetailRow icon="calendar-outline" label="Starts" value={formatDate(challenge.start_date)} />
          <Divider />
          <DetailRow icon="calendar-clear-outline" label="Ends" value={formatDate(challenge.end_date)} />
          {isCoop && (
            <>
              <Divider />
              <DetailRow icon="people-outline" label="Team target" value={String(teamTarget)} />
            </>
          )}
          <Divider />
          <DetailRow icon="gift-outline" label="Reward" value={challenge.reward || "—"} />
        </Card>
      </Section>
    </Screen>
  )
}
