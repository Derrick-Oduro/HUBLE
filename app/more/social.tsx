"use client"

import React, { useState, useEffect, useCallback } from "react"
import { RefreshControl, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, type Href } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import { activityAPI, socialAPI } from "../../lib/api"
import { Button, Card, Divider, EmptyState, IconName, IconTile, ListRow, Pill, Screen, Section, RADIUS, tint } from "../../components/ui"

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
  message: string
  time: string
  icon: string
  color: string
  cheersCount: number
  hasCheered: boolean
}

const timeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Social() {
  const router = useRouter()
  const { colors } = useTheme()
  const [socialStats, setSocialStats] = useState<SocialStats>({
    friends: 0,
    parties: 0,
    activeChallenges: 0,
    totalXpEarned: 0,
    groupBadges: 0,
    currentStreak: 0,
    pendingRequests: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadSocialStats = useCallback(async () => {
    try {
      const response = await socialAPI.getStats()
      if (response.success && response.stats) setSocialStats(response.stats)
    } catch (error) {
      console.error("Failed to load social stats:", error)
    }
  }, [])

  const loadRecentActivity = useCallback(async () => {
    try {
      const response = await activityAPI.getFriendsActivities(10)
      if (response.success) {
        setRecentActivity(
          (response.activities || []).map((activity: any) => ({
            id: Number(activity.id),
            message: activity.title || "New activity",
            time: timeAgo(activity.created_at),
            icon: activity.icon || "sparkles-outline",
            color: activity.color || colors.accent,
            cheersCount: Number(activity.cheers_count || 0),
            hasCheered: Boolean(activity.has_cheered),
          })),
        )
      }
    } catch (error) {
      console.error("Failed to load recent activity:", error)
      setRecentActivity([])
    }
  }, [colors.accent])

  useEffect(() => {
    loadSocialStats()
    loadRecentActivity()
  }, [loadSocialStats, loadRecentActivity])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadSocialStats(), loadRecentActivity()])
    setRefreshing(false)
  }

  const handleCheerToggle = async (activityId: number, currentlyCheered: boolean) => {
    const delta = currentlyCheered ? -1 : 1
    const apply = (hasCheered: boolean, count: (prev: number) => number) =>
      setRecentActivity((prev) => prev.map((a) => (a.id === activityId ? { ...a, hasCheered, cheersCount: Math.max(0, count(a.cheersCount)) } : a)))

    apply(!currentlyCheered, (c) => c + delta)
    try {
      const response = currentlyCheered ? await activityAPI.uncheerActivity(activityId) : await activityAPI.cheerActivity(activityId)
      if (!response?.success) throw new Error("Cheer action failed")
      apply(Boolean(response.hasCheered), () => Number(response.cheersCount || 0))
    } catch (error) {
      console.error("Failed to update cheer:", error)
      apply(currentlyCheered, (c) => c - delta)
    }
  }

  const sections: { icon: IconName; title: string; subtitle: string; count: number; color: string; href: Href }[] = [
    { icon: "people-outline", title: "Friends", subtitle: "See how your friends are doing", count: socialStats.friends, color: colors.accent, href: "/more/social/friends" },
    { icon: "star-outline", title: "Parties", subtitle: "Groups working on shared goals", count: socialStats.parties, color: colors.success, href: "/more/social/parties" },
    { icon: "flag-outline", title: "Challenges", subtitle: "Compete in community challenges", count: socialStats.activeChallenges, color: colors.warning, href: "/more/social/challenges" },
    { icon: "ribbon-outline", title: "Group badges", subtitle: "Achievements earned together", count: socialStats.groupBadges, color: colors.error, href: "/more/social/group-badges" },
  ]

  const addFriendButton = (
    <TouchableOpacity
      onPress={() => router.push("/more/social/add-friend")}
      accessibilityLabel="Add friend"
      style={{ width: 40, height: 40, borderRadius: RADIUS.inner, alignItems: "center", justifyContent: "center", backgroundColor: colors.card }}
    >
      <Ionicons name="person-add-outline" size={19} color={colors.text} />
    </TouchableOpacity>
  )

  return (
    <Screen
      title="Social"
      subtitle="Connect, compete and grow together"
      right={addFriendButton}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      {/* Summary */}
      <Card style={{ flexDirection: "row", paddingVertical: 14 }}>
        {[
          { label: "Friends", value: socialStats.friends },
          { label: "Parties", value: socialStats.parties },
          { label: "Challenges", value: socialStats.activeChallenges },
          { label: "XP earned", value: socialStats.totalXpEarned },
        ].map((item, i) => (
          <View
            key={item.label}
            style={{ flex: 1, alignItems: "center", borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: tint(colors.cardSecondary, 0.7) }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{item.value}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{item.label}</Text>
          </View>
        ))}
      </Card>

      {socialStats.pendingRequests > 0 && (
        <Card onPress={() => router.push("/inbox")} highlight={colors.accent} style={{ paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <IconTile icon="mail-unread-outline" color={colors.accent} size={36} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>
              {socialStats.pendingRequests} pending friend {socialStats.pendingRequests === 1 ? "request" : "requests"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Card>
      )}

      <Section title="Explore">
        <Card padded={false}>
          {sections.map((section, i) => (
            <View key={section.title}>
              {i > 0 && <Divider inset={62} />}
              <ListRow
                icon={section.icon}
                iconColor={section.color}
                title={section.title}
                subtitle={section.subtitle}
                right={section.count > 0 ? <Pill label={section.count} color={section.color} /> : undefined}
                chevron
                onPress={() => router.push(section.href)}
              />
            </View>
          ))}
        </Card>
      </Section>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button label="Add friend" icon="person-add-outline" variant="secondary" onPress={() => router.push("/more/social/add-friend")} style={{ flex: 1 }} />
        <Button label="Create party" icon="add" onPress={() => router.push("/more/social/create-party")} style={{ flex: 1 }} />
      </View>

      <Section title="Friend activity">
        {recentActivity.length === 0 ? (
          <EmptyState icon="pulse-outline" title="Nothing yet" message="When your friends complete tasks, it shows up here." />
        ) : (
          <Card padded={false}>
            {recentActivity.map((activity, i) => (
              <View key={activity.id}>
                {i > 0 && <Divider inset={62} />}
                <ListRow
                  icon={activity.icon as IconName}
                  iconColor={activity.color}
                  title={activity.message}
                  subtitle={activity.time}
                  right={
                    <TouchableOpacity
                      onPress={() => handleCheerToggle(activity.id, activity.hasCheered)}
                      accessibilityLabel={activity.hasCheered ? "Remove cheer" : "Cheer"}
                      hitSlop={8}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: activity.hasCheered ? tint(colors.error, 0.14) : tint(colors.cardSecondary, 0.8) }}
                    >
                      <Ionicons name={activity.hasCheered ? "heart" : "heart-outline"} size={14} color={activity.hasCheered ? colors.error : colors.textSecondary} />
                      <Text style={{ fontSize: 12, fontWeight: "700", color: activity.hasCheered ? colors.error : colors.textSecondary }}>{activity.cheersCount}</Text>
                    </TouchableOpacity>
                  }
                />
              </View>
            ))}
          </Card>
        )}
      </Section>
    </Screen>
  )
}
