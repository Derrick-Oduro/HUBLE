"use client"

import React, { useCallback, useState } from "react"
import { RefreshControl, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import { useStats } from "../../contexts/StatsProvider"
import { Card, Divider, ListRow, ProgressBar, Screen, Section, StatTile, Button } from "../../components/ui"

const ratio = (value: number, max: number) => (max > 0 ? value / max : 0)

export default function Stats() {
  const router = useRouter()
  const { colors } = useTheme()
  const { stats } = useStats()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  const xpInLevel = stats.experience || 0
  const xpForLevel = stats.maxExperience || 100

  const today = [
    { label: "Habits", icon: "checkmark-circle-outline" as const, done: stats.habitsCompleted, total: stats.totalHabits, color: colors.success },
    { label: "Dailies", icon: "list-outline" as const, done: stats.dailiesCompleted, total: stats.totalDailies, color: colors.accent },
    { label: "Routines", icon: "repeat-outline" as const, done: stats.routinesCompleted, total: stats.totalRoutines, color: colors.warning },
  ]

  const milestones = [
    { title: "First steps", hint: "Complete 10 habits", icon: "footsteps-outline" as const, progress: stats.habitsCompleted, max: 10, color: colors.success },
    { title: "Streak master", hint: "Keep a 7-day streak", icon: "flame-outline" as const, progress: stats.currentStreak, max: 7, color: colors.warning },
    { title: "Focus warrior", hint: "Finish 5 focus sessions", icon: "timer-outline" as const, progress: stats.focusSessions, max: 5, color: colors.accent },
  ]

  return (
    <Screen
      title="Stats"
      subtitle="Your progress at a glance"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      {/* Level */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>Level</Text>
            <Text style={{ fontSize: 34, fontWeight: "800", color: colors.text, lineHeight: 38 }}>{stats.level}</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>{Math.max(0, xpForLevel - xpInLevel)} XP</Text> to level {stats.level + 1}
          </Text>
        </View>
        <ProgressBar value={ratio(xpInLevel, xpForLevel)} height={8} />
        <Divider />
        <View style={{ flexDirection: "row" }}>
          {[
            { icon: "heart" as const, color: colors.error, value: stats.health, label: "Health" },
            { icon: "ellipse" as const, color: colors.warning, value: stats.coinsEarned, label: "Coins" },
            { icon: "diamond" as const, color: colors.accent, value: stats.gemsEarned, label: "Gems" },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons name={item.icon} size={11} color={item.color} />
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{item.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Today */}
      <Section title="Today">
        <Card style={{ gap: 14 }}>
          {today.map((row) => (
            <View key={row.label} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={row.icon} size={16} color={row.color} />
                <Text style={{ flex: 1, marginLeft: 8, fontSize: 14, fontWeight: "600", color: colors.text }}>{row.label}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>{row.done}</Text> / {row.total}
                </Text>
              </View>
              <ProgressBar value={ratio(row.done, row.total)} color={row.color} />
            </View>
          ))}
        </Card>
      </Section>

      {/* Performance */}
      <Section title="Performance">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatTile icon="flame-outline" color={colors.warning} value={stats.currentStreak} label="Day streak" />
          <StatTile icon="trophy-outline" color={colors.success} value={stats.longestStreak} label="Best streak" />
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatTile icon="timer-outline" color={colors.accent} value={stats.focusSessions} label="Focus sessions" />
          <StatTile icon="time-outline" color={colors.accent} value={`${stats.focusMinutes}m`} label="Focus minutes" />
        </View>
      </Section>

      {/* Milestones */}
      <Section title="Milestones" action={<Button label="View all" variant="ghost" small onPress={() => router.push("/more/achievements")} />}>
        <Card padded={false}>
          {milestones.map((m, i) => {
            const unlocked = m.progress >= m.max
            return (
              <View key={m.title}>
                {i > 0 && <Divider inset={62} />}
                <ListRow
                  icon={unlocked ? "checkmark-circle" : m.icon}
                  iconColor={unlocked ? colors.success : m.color}
                  title={m.title}
                  subtitle={m.hint}
                  right={
                    <Text style={{ fontSize: 13, fontWeight: "700", color: unlocked ? colors.success : colors.textSecondary }}>
                      {Math.min(m.progress, m.max)}/{m.max}
                    </Text>
                  }
                />
              </View>
            )
          })}
        </Card>
      </Section>
    </Screen>
  )
}
