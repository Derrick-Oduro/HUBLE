"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, Modal, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import { achievementsAPI } from "../../lib/api"
import {
  Button,
  Card,
  Divider,
  EmptyState,
  IconTile,
  LoadingState,
  ProgressBar,
  Screen,
  Section,
  Segmented,
} from "../../components/ui"

const CATEGORY_META: Record<string, { title: string; icon: any }> = {
  habits: { title: "Habits", icon: "checkmark-circle-outline" },
  focus: { title: "Focus", icon: "timer-outline" },
  level: { title: "Leveling", icon: "trending-up-outline" },
  dailies: { title: "Dailies", icon: "calendar-outline" },
  routines: { title: "Routines", icon: "repeat-outline" },
  social: { title: "Social", icon: "people-outline" },
}

type Filter = "all" | "unlocked" | "locked"

export default function Achievements() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [achievementCategories, setAchievementCategories] = useState<any[]>([])
  const [totalAchievements, setTotalAchievements] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState(0)
  const [celebrationQueue, setCelebrationQueue] = useState<any[]>([])
  const [activeCelebration, setActiveCelebration] = useState<any | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const response = await achievementsAPI.getAchievements()

      if (response.success) {
        const categories = Object.keys(response.achievements).map((categoryKey) => {
          const meta = CATEGORY_META[categoryKey] || { title: categoryKey, icon: "star-outline" }
          return {
            id: categoryKey,
            title: meta.title,
            color: response.achievements[categoryKey][0]?.color || colors.success,
            icon: meta.icon,
            achievements: response.achievements[categoryKey],
          }
        })

        setAchievementCategories(categories)
        setTotalAchievements(response.stats.total)
        setUnlockedAchievements(response.stats.unlocked)

        // Celebrate anything unlocked since the last visit.
        const unlockedList = categories.flatMap((category) =>
          category.achievements
            .filter((achievement: any) => achievement.unlocked)
            .map((achievement: any) => ({ ...achievement, categoryTitle: category.title, color: achievement.color || category.color })),
        )
        const seenRaw = await AsyncStorage.getItem("seenAchievementIds")
        const seenIds = new Set(seenRaw ? JSON.parse(seenRaw) : [])
        const newUnlocks = unlockedList.filter((achievement: any) => !seenIds.has(achievement.id))
        if (newUnlocks.length > 0) {
          setCelebrationQueue(newUnlocks)
          setActiveCelebration(newUnlocks[0])
        }
        await AsyncStorage.setItem("seenAchievementIds", JSON.stringify(unlockedList.map((achievement: any) => achievement.id)))
      }
    } catch (error) {
      console.error("Failed to load achievements:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  const shareAchievement = async () => {
    if (!activeCelebration) return
    try {
      await Share.share({ message: `I just unlocked "${activeCelebration.title}" in HUBLE. Staying consistent is paying off.` })
    } catch (error) {
      console.error("Failed to share achievement:", error)
    }
  }

  const closeCelebration = () => {
    const [, ...remaining] = celebrationQueue
    setCelebrationQueue(remaining)
    setActiveCelebration(remaining[0] || null)
  }

  if (loading) {
    return (
      <Screen title="Achievements">
        <LoadingState label="Loading achievements…" />
      </Screen>
    )
  }

  const overall = totalAchievements > 0 ? unlockedAchievements / totalAchievements : 0
  const visibleCategories = achievementCategories
    .map((category) => ({
      ...category,
      items: category.achievements.filter((a: any) => (filter === "all" ? true : filter === "unlocked" ? a.unlocked : !a.unlocked)),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <Screen title="Achievements" subtitle={`${unlockedAchievements} of ${totalAchievements} unlocked`}>
      {/* Summary */}
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <IconTile icon="trophy-outline" color={colors.warning} size={52} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>{Math.round(overall * 100)}%</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>{Math.max(0, totalAchievements - unlockedAchievements)} to go</Text>
          </View>
          <ProgressBar value={overall} color={colors.warning} />
        </View>
      </Card>

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "unlocked", label: "Unlocked" },
          { value: "locked", label: "In progress" },
        ]}
      />

      {visibleCategories.length === 0 && (
        <EmptyState
          icon={filter === "unlocked" ? "lock-closed-outline" : "sparkles-outline"}
          title={filter === "unlocked" ? "Nothing unlocked yet" : "Nothing here"}
          message={filter === "unlocked" ? "Keep completing tasks to earn your first badge." : "Achievements will show up here as you use HUBLE."}
        />
      )}

      {visibleCategories.map((category) => {
        const done = category.achievements.filter((a: any) => a.unlocked).length
        return (
          <Section
            key={category.id}
            title={category.title}
            action={
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>
                {done}/{category.achievements.length}
              </Text>
            }
          >
            <Card padded={false}>
              {category.items.map((achievement: any, index: number) => {
                const color = achievement.color || category.color || colors.accent
                const pct = achievement.total > 0 ? Math.min(1, achievement.progress / achievement.total) : 0
                return (
                  <View key={achievement.id}>
                    {index > 0 && <Divider inset={64} />}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
                      <IconTile icon={achievement.unlocked ? "trophy" : category.icon} color={achievement.unlocked ? color : colors.textSecondary} size={38} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                          {achievement.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={2}>
                          {achievement.description}
                        </Text>
                        {!achievement.unlocked && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <View style={{ flex: 1 }}>
                              <ProgressBar value={pct} color={color} height={4} />
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSecondary }}>
                              {achievement.progress}/{achievement.total}
                            </Text>
                          </View>
                        )}
                      </View>
                      {achievement.unlocked && <Ionicons name="checkmark-circle" size={20} color={color} />}
                    </View>
                  </View>
                )
              })}
            </Card>
          </Section>
        )
      })}

      <Modal visible={!!activeCelebration} transparent animationType="fade" onRequestClose={closeCelebration}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.6)" }}>
          <Card style={{ width: "100%", alignItems: "center", padding: 24, gap: 6 }} highlight={activeCelebration?.color || colors.accent}>
            <IconTile icon="trophy" color={activeCelebration?.color || colors.accent} size={64} />
            <Text style={{ marginTop: 10, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.textSecondary }}>
              Achievement unlocked
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" }}>{activeCelebration?.title}</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>{activeCelebration?.description}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16, alignSelf: "stretch" }}>
              <Button label="Close" variant="secondary" onPress={closeCelebration} style={{ flex: 1 }} />
              <Button label="Share" icon="share-outline" onPress={shareAchievement} style={{ flex: 1 }} />
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  )
}
