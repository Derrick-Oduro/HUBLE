import React, { ReactNode } from "react"
import { Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeProvider"
import { Card, Pill, ProgressBar, IconName, tint } from "../ui"

export type ChallengeCardType = "active" | "available" | "completed"

const timeLeft = (endDate?: string) => {
  if (!endDate) return null
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  if (Number.isNaN(days)) return null
  if (days < 0) return "Ended"
  if (days === 0) return "Ends today"
  return days === 1 ? "1 day left" : `${days} days left`
}

function Meta({ icon, label }: { icon: IconName; label: string }) {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{label}</Text>
    </View>
  )
}

export default function ChallengeCard({
  challenge,
  type = "active",
  onPress,
  action,
}: {
  challenge: any
  type?: ChallengeCardType
  onPress?: () => void
  /** Optional trailing control (e.g. a Join button). */
  action?: ReactNode
}) {
  const { colors } = useTheme()
  const color = challenge.color || colors.accent
  const participants = challenge.participant_count || challenge.participants || 0
  const isCoop = `${challenge.mode || ""}`.toLowerCase() === "cooperative"
  const progress = Math.max(0, Math.min(100, Number(challenge.progress ?? 0)))
  const remaining = type !== "completed" ? timeLeft(challenge.end_date) : null

  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tint(color, 0.14),
            borderWidth: 1,
            borderColor: tint(color, 0.3),
          }}
        >
          <Text style={{ fontSize: 20 }}>{challenge.emoji || "🏆"}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }} numberOfLines={1}>
            {challenge.title}
          </Text>
          {!!challenge.description && (
            <Text style={{ fontSize: 12, lineHeight: 17, color: colors.textSecondary }} numberOfLines={2}>
              {challenge.description}
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Pill label={challenge.difficulty || "Medium"} />
          {isCoop && <Pill label="Co-op" color={colors.success} />}
        </View>
      </View>

      {type === "active" && challenge.progress !== undefined && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={progress / 100} color={color} />
          </View>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{progress}%</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        {type !== "completed" && <Meta icon="people-outline" label={`${participants} joined`} />}
        {remaining && <Meta icon="time-outline" label={remaining} />}
        {type === "active" && challenge.myRank && <Meta icon="podium-outline" label={`Rank #${challenge.myRank}`} />}
        {type === "completed" && challenge.completed_at && (
          <Meta icon="checkmark-done-outline" label={`Finished ${new Date(challenge.completed_at).toLocaleDateString()}`} />
        )}
        {type === "completed" && challenge.finalRank && <Meta icon="podium-outline" label={`Final rank #${challenge.finalRank}`} />}
        <View style={{ flex: 1 }} />
        {challenge.reward_xp > 0 && <Pill label={`+${challenge.reward_xp} XP`} color={colors.accent} />}
        {challenge.reward_coins > 0 && <Pill label={`+${challenge.reward_coins}`} icon="ellipse" color={colors.warning} />}
      </View>

      {action}
    </Card>
  )
}
