"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Alert, RefreshControl, Text, View } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import { partiesAPI } from "../../../../lib/api"
import { Avatar, Button, Card, Divider, EmojiTile, EmptyState, ListRow, LoadingState, Pill, ProgressBar, Screen, Section } from "../../../../components/ui"

export default function PartyDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [contributing, setContributing] = useState(false)
  const [party, setParty] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])

  const partyId = Number(Array.isArray(id) ? id[0] : id)

  const loadParty = useCallback(async () => {
    if (!Number.isFinite(partyId)) {
      setLoading(false)
      return
    }
    try {
      const [partyResponse, membersResponse] = await Promise.all([partiesAPI.getParty(partyId), partiesAPI.getPartyMembers(partyId)])
      setParty(partyResponse.party || null)
      setMembers(membersResponse.members || partyResponse.party?.members || [])
    } catch (error) {
      console.error("Error loading party details:", error)
      Alert.alert("Couldn't load party", "Please try again in a moment.")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  useEffect(() => {
    loadParty()
  }, [loadParty])

  const weekly = party?.weekly || null
  const goalLabel = weekly?.weekly_goal_label || party?.weekly_goal_label || party?.goal || "Weekly team goal"
  const goalTarget = Math.max(1, Number(weekly?.weekly_goal_target ?? party?.weekly_goal_target ?? 10))
  const points = Math.max(0, Number(weekly?.total_points ?? party?.weekly_points ?? 0))
  const progress = Math.min(100, Math.max(0, Number(weekly?.progress_percent ?? party?.progress ?? Math.round((points / goalTarget) * 100)) || 0))
  const contributors: any[] = Array.isArray(weekly?.member_contributions) ? weekly.member_contributions : []
  const color = party?.color || colors.accent

  const handleLeaveParty = () => {
    if (!party) return
    Alert.alert("Leave party", `Leave ${party.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await partiesAPI.leaveParty(partyId)
            router.replace("/more/social/parties")
          } catch (error) {
            console.error("Error leaving party:", error)
            Alert.alert("Something went wrong", "Couldn't leave the party.")
          }
        },
      },
    ])
  }

  const handleContribute = async (amount: number) => {
    if (!Number.isFinite(partyId) || amount < 1) return
    try {
      setContributing(true)
      await partiesAPI.contributeToParty(partyId, amount)
      await loadParty()
    } catch (error) {
      console.error("Error contributing to party:", error)
      Alert.alert("Couldn't add points", error instanceof Error ? error.message : "Please try again.")
    } finally {
      setContributing(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadParty()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <Screen title="Party">
        <LoadingState />
      </Screen>
    )
  }

  if (!party) {
    return (
      <Screen title="Party">
        <EmptyState icon="star-outline" title="Party not found" message="This party may no longer exist." />
      </Screen>
    )
  }

  return (
    <Screen
      title={party.name}
      subtitle={`${party.member_count || members.length || 0}/${party.max_members || 10} members`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      {/* Overview + weekly goal */}
      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <EmojiTile emoji={party.emoji || "🎉"} color={color} size={56} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: party.description ? colors.text : colors.textSecondary }}>
            {party.description || "No description yet."}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: colors.text }} numberOfLines={1}>
              {goalLabel}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              <Text style={{ fontWeight: "800", color: colors.text }}>{points}</Text> / {goalTarget} pts
            </Text>
          </View>
          <ProgressBar value={progress / 100} color={color} height={8} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>{progress}% of this week's goal</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button label="+1 point" style={{ flex: 1 }} loading={contributing} onPress={() => handleContribute(1)} />
          <Button label="+3 points" variant="secondary" style={{ flex: 1 }} disabled={contributing} onPress={() => handleContribute(3)} />
        </View>
      </Card>

      <Section title="This week">
        {contributors.length === 0 ? (
          <EmptyState icon="podium-outline" title="No points yet" message="Be the first to contribute this week." />
        ) : (
          <Card padded={false}>
            {contributors.slice(0, 8).map((contributor, i) => (
              <View key={contributor.id || contributor.username}>
                {i > 0 && <Divider inset={14} />}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text style={{ width: 20, fontSize: 13, fontWeight: "700", color: colors.textSecondary }}>{i + 1}</Text>
                  <Avatar emoji={contributor.avatar} size={32} />
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }} numberOfLines={1}>
                    {contributor.username}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{Number(contributor.points || 0)} pts</Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title={`Members · ${members.length}`}>
        <Card padded={false}>
          {members.map((member, i) => (
            <View key={member.id || member.user_id || member.username}>
              {i > 0 && <Divider inset={70} />}
              <ListRow
                leading={<Avatar emoji={member.avatar} color={member.avatar_color} size={42} />}
                title={member.username}
                subtitle={`Level ${member.level || 1}`}
                right={member.role && member.role !== "member" ? <Pill label={member.role.charAt(0).toUpperCase() + member.role.slice(1)} color={colors.accent} /> : undefined}
              />
            </View>
          ))}
        </Card>
      </Section>

      <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: "center" }}>
        Created {party.created_at || party.updated_at ? new Date(party.created_at || party.updated_at).toLocaleDateString() : "—"}
      </Text>
      <Button label="Leave party" icon="exit-outline" variant="danger" onPress={handleLeaveParty} />
    </Screen>
  )
}
