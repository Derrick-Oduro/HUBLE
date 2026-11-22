"use client"

import React, { useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../contexts/ThemeProvider"
import { achievementsAPI, socialAPI } from "../../../lib/api"
import { Card, Divider, EmptyState, IconTile, LoadingState, Pill, ProgressBar, Screen, Section, tint } from "../../../components/ui"

type Rarity = "common" | "rare" | "epic" | "legendary"

type SocialBadge = {
  id: number
  name: string
  description: string
  icon: string
  color: string
  progress: number
  total: number
  unlocked: boolean
  unlockedAt?: string
  xpReward: number
  coinReward: number
  unlockLevel: number
  rarity: Rarity
}

const rarityFromLevel = (level: number): Rarity => (level >= 10 ? "legendary" : level >= 7 ? "epic" : level >= 4 ? "rare" : "common")

const RARITY_COLOR: Record<Rarity, string> = {
  common: "#10B981",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
}

const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatDate = (value?: string) => {
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "recently"
}

export default function GroupBadges() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [badges, setBadges] = useState<SocialBadge[]>([])
  const [socialStats, setSocialStats] = useState({ friends: 0, parties: 0 })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [achievementsResponse, statsResponse] = await Promise.all([achievementsAPI.getAchievements(), socialAPI.getStats()])
        const social = achievementsResponse?.achievements?.social || []
        setBadges(
          social.map((achievement: any) => {
            const unlockLevel = num(achievement.unlockLevel, 1)
            return {
              id: num(achievement.id),
              name: String(achievement.title || "Social badge"),
              description: String(achievement.description || ""),
              icon: String(achievement.icon || "star"),
              color: String(achievement.color || colors.accent),
              progress: num(achievement.progress),
              total: Math.max(1, num(achievement.total, 1)),
              unlocked: Boolean(achievement.unlocked),
              unlockedAt: achievement.unlockedAt,
              xpReward: num(achievement.xpReward),
              coinReward: num(achievement.coinReward),
              unlockLevel,
              rarity: rarityFromLevel(unlockLevel),
            }
          }),
        )
        setSocialStats({ friends: num(statsResponse?.stats?.friends), parties: num(statsResponse?.stats?.parties) })
      } catch (error) {
        console.error("Failed to load group badges:", error)
        Alert.alert("Couldn't load badges", "Please try again in a moment.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <Screen title="Group badges">
        <LoadingState />
      </Screen>
    )
  }

  const earned = badges.filter((b) => b.unlocked)
  const inProgress = badges.filter((b) => !b.unlocked)

  const BadgeRow = ({ badge }: { badge: SocialBadge }) => {
    const rarityColor = RARITY_COLOR[badge.rarity]
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
        <IconTile icon={(badge.unlocked ? badge.icon : "lock-closed-outline") as any} color={badge.unlocked ? badge.color : colors.textSecondary} size={44} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ flexShrink: 1, fontSize: 15, fontWeight: "600", color: colors.text }} numberOfLines={1}>
              {badge.name}
            </Text>
            <Pill label={badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)} color={rarityColor} />
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={2}>
            {badge.description}
          </Text>
          {badge.unlocked ? (
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Unlocked {formatDate(badge.unlockedAt)}</Text>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
              <View style={{ flex: 1 }}>
                <ProgressBar value={badge.progress / badge.total} color={badge.color} height={4} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSecondary }}>
                {badge.progress}/{badge.total}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
            {badge.xpReward > 0 && <Pill label={`+${badge.xpReward} XP`} color={colors.accent} />}
            {badge.coinReward > 0 && <Pill label={`+${badge.coinReward}`} icon="ellipse" color={colors.warning} />}
            {!badge.unlocked && badge.unlockLevel > 1 && <Pill label={`Lv ${badge.unlockLevel}+`} icon="lock-closed" />}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Screen title="Group badges" subtitle="Achievements you earn with others">
      <Card style={{ flexDirection: "row", paddingVertical: 14 }}>
        {[
          { label: "Earned", value: earned.length },
          { label: "In progress", value: inProgress.length },
          { label: "Friends", value: socialStats.friends },
          { label: "Parties", value: socialStats.parties },
        ].map((item, i) => (
          <View key={item.label} style={{ flex: 1, alignItems: "center", borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: tint(colors.cardSecondary, 0.7) }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{item.value}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{item.label}</Text>
          </View>
        ))}
      </Card>

      {badges.length === 0 ? (
        <EmptyState icon="ribbon-outline" title="No group badges yet" message="Join a party or add friends to start earning badges together." />
      ) : (
        <>
          <Section title={`Earned · ${earned.length}`}>
            {earned.length === 0 ? (
              <EmptyState icon="medal-outline" title="None earned yet" message="Your first group badge is waiting below." />
            ) : (
              <Card padded={false}>
                {earned.map((badge, i) => (
                  <View key={badge.id}>
                    {i > 0 && <Divider inset={70} />}
                    <BadgeRow badge={badge} />
                  </View>
                ))}
              </Card>
            )}
          </Section>

          {inProgress.length > 0 ? (
            <Section title={`In progress · ${inProgress.length}`}>
              <Card padded={false}>
                {inProgress.map((badge, i) => (
                  <View key={badge.id}>
                    {i > 0 && <Divider inset={70} />}
                    <BadgeRow badge={badge} />
                  </View>
                ))}
              </Card>
            </Section>
          ) : (
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={{ fontSize: 14, color: colors.text }}>You've earned every group badge.</Text>
            </Card>
          )}
        </>
      )}
    </Screen>
  )
}
