"use client"

import React, { useEffect, useMemo, useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { achievementsAPI, socialAPI } from "../../../lib/api"

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
  rarity: "common" | "rare" | "epic" | "legendary"
}

type SocialStats = {
  friends: number
  parties: number
  groupBadges: number
}

const getRarityFromLevel = (level: number): "common" | "rare" | "epic" | "legendary" => {
  if (level >= 10) {
    return "legendary"
  }
  if (level >= 7) {
    return "epic"
  }
  if (level >= 4) {
    return "rare"
  }
  return "common"
}

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "#10B981"
    case "rare":
      return "#3B82F6"
    case "epic":
      return "#8B5CF6"
    case "legendary":
      return "#F59E0B"
    default:
      return "#6B7280"
  }
}

const normalizeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatUnlockedDate = (value?: string): string => {
  if (!value) {
    return "Recently"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "Recently"
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function GroupBadges() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [earnedBadges, setEarnedBadges] = useState<SocialBadge[]>([])
  const [inProgressBadges, setInProgressBadges] = useState<SocialBadge[]>([])
  const [socialStats, setSocialStats] = useState<SocialStats>({
    friends: 0,
    parties: 0,
    groupBadges: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const [achievementsResponse, statsResponse] = await Promise.all([
          achievementsAPI.getAchievements(),
          socialAPI.getStats(),
        ])

        const socialAchievements = achievementsResponse?.achievements?.social || []

        const badges: SocialBadge[] = socialAchievements.map((achievement: any) => {
          const unlockLevel = normalizeNumber(achievement.unlockLevel, 1)
          return {
            id: normalizeNumber(achievement.id, 0),
            name: String(achievement.title || "Social Badge"),
            description: String(achievement.description || ""),
            icon: String(achievement.icon || "star"),
            color: String(achievement.color || "#14B8A6"),
            progress: normalizeNumber(achievement.progress, 0),
            total: Math.max(1, normalizeNumber(achievement.total, 1)),
            unlocked: Boolean(achievement.unlocked),
            unlockedAt: achievement.unlockedAt,
            xpReward: normalizeNumber(achievement.xpReward, 0),
            coinReward: normalizeNumber(achievement.coinReward, 0),
            unlockLevel,
            rarity: getRarityFromLevel(unlockLevel),
          }
        })

        setEarnedBadges(badges.filter((badge) => badge.unlocked))
        setInProgressBadges(badges.filter((badge) => !badge.unlocked))

        setSocialStats({
          friends: normalizeNumber(statsResponse?.stats?.friends, 0),
          parties: normalizeNumber(statsResponse?.stats?.parties, 0),
          groupBadges: normalizeNumber(statsResponse?.stats?.groupBadges, 0),
        })
      } catch (error) {
        console.error("Failed to load group badges:", error)
        Alert.alert("Error", "Could not load group badge data.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const totalTrackedBadges = useMemo(() => {
    return earnedBadges.length + inProgressBadges.length
  }, [earnedBadges.length, inProgressBadges.length])

  const EarnedBadgeCard = ({ badge }: { badge: SocialBadge }) => (
    <View
      style={[
        tw`rounded-2xl p-5 mb-4`,
        {
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: `${getRarityColor(badge.rarity)}40`,
        },
      ]}
    >
      <View style={tw`flex-row items-center mb-4`}>
        <View
          style={[
            tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
            {
              backgroundColor: `${badge.color}20`,
              borderWidth: 2,
              borderColor: badge.color,
            },
          ]}
        >
          <Ionicons name={badge.icon as any} size={28} color={badge.color} />
        </View>

        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={[tw`font-bold text-lg mr-2`, { color: colors.text }]}>{badge.name}</Text>
            <View
              style={[
                tw`px-2 py-1 rounded`,
                { backgroundColor: `${getRarityColor(badge.rarity)}20` },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold uppercase`,
                  { color: getRarityColor(badge.rarity) },
                ]}
              >
                {badge.rarity}
              </Text>
            </View>
          </View>
          <Text style={[tw`text-sm mb-2`, { color: colors.textSecondary }]}>{badge.description}</Text>
          <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Unlocked on {formatUnlockedDate(badge.unlockedAt)}</Text>
        </View>
      </View>

      <View style={[tw`pt-4 border-t flex-row justify-between`, { borderColor: colors.cardSecondary }]}>
        <Text style={{ color: colors.text }}>⭐ {badge.xpReward} XP</Text>
        <Text style={{ color: colors.text }}>💰 {badge.coinReward} Coins</Text>
        <Text style={{ color: colors.text }}>Lvl {badge.unlockLevel}</Text>
      </View>
    </View>
  )

  const ProgressBadgeCard = ({ badge }: { badge: SocialBadge }) => {
    const progressPercent = Math.min(100, Math.round((badge.progress / badge.total) * 100))

    return (
      <View
        style={[
          tw`rounded-2xl p-5 mb-4`,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={tw`flex-row items-center mb-4`}>
          <View
            style={[
              tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
              { backgroundColor: `${badge.color}20` },
            ]}
          >
            <Ionicons name={badge.icon as any} size={28} color={badge.color} />
          </View>

          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={[tw`font-bold text-lg mr-2`, { color: colors.text }]}>{badge.name}</Text>
              <View
                style={[
                  tw`px-2 py-1 rounded`,
                  { backgroundColor: `${getRarityColor(badge.rarity)}20` },
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-bold uppercase`,
                    { color: getRarityColor(badge.rarity) },
                  ]}
                >
                  {badge.rarity}
                </Text>
              </View>
            </View>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{badge.description}</Text>
          </View>
        </View>

        <View style={tw`mb-4`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>Progress</Text>
            <Text style={[tw`font-bold`, { color: badge.color }]}>{progressPercent}%</Text>
          </View>

          <View style={[tw`h-3 rounded-full overflow-hidden mb-2`, { backgroundColor: colors.cardSecondary }]}>
            <View
              style={[
                tw`h-full rounded-full`,
                { width: `${progressPercent}%`, backgroundColor: badge.color },
              ]}
            />
          </View>

          <View style={tw`flex-row justify-between`}>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}> 
              {badge.progress}/{badge.total}
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Unlock at level {badge.unlockLevel}</Text>
          </View>
        </View>

        <View style={[tw`pt-3 border-t flex-row justify-between`, { borderColor: colors.cardSecondary }]}>
          <Text style={{ color: colors.text }}>⭐ {badge.xpReward} XP</Text>
          <Text style={{ color: colors.text }}>💰 {badge.coinReward} Coins</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading group badges...</Text>
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
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Group Badges</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              tw`rounded-2xl p-5 mb-6`,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Your Achievement Stats</Text>

            <View style={tw`flex-row justify-between`}>
              <View style={tw`items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{earnedBadges.length}</Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Earned</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{inProgressBadges.length}</Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>In Progress</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{socialStats.friends}</Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Team Mates</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{socialStats.parties}</Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Groups</Text>
              </View>
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>Earned Badges ({earnedBadges.length})</Text>

            {earnedBadges.map((badge) => (
              <EarnedBadgeCard key={badge.id} badge={badge} />
            ))}

            {earnedBadges.length === 0 && (
              <View style={tw`items-center py-10`}>
                <Ionicons name="medal-outline" size={48} color={colors.textSecondary} />
                <Text style={[tw`mt-3`, { color: colors.textSecondary }]}>No group badges unlocked yet.</Text>
              </View>
            )}
          </View>

          <View style={tw`mb-6`}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>In Progress ({inProgressBadges.length})</Text>

            {inProgressBadges.map((badge) => (
              <ProgressBadgeCard key={badge.id} badge={badge} />
            ))}

            {inProgressBadges.length === 0 && totalTrackedBadges > 0 && (
              <View style={tw`items-center py-10`}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                <Text style={[tw`mt-3`, { color: colors.text }]}>All social badges are completed.</Text>
              </View>
            )}
          </View>

          <View
            style={[
              tw`rounded-2xl p-5`,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[tw`text-lg font-bold mb-3`, { color: colors.text }]}>Badge Progress Summary</Text>
            <Text style={{ color: colors.textSecondary }}>Total tracked social badges: {totalTrackedBadges}</Text>
            <Text style={[tw`mt-1`, { color: colors.textSecondary }]}>Unlocked social badges: {socialStats.groupBadges}</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
