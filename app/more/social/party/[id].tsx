"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import tw from "../../../../lib/tailwind"
import { partiesAPI } from "../../../../lib/api"

export default function PartyDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { colors, currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
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
      setLoading(true)
      const [partyResponse, membersResponse] = await Promise.all([
        partiesAPI.getParty(partyId),
        partiesAPI.getPartyMembers(partyId),
      ])

      setParty(partyResponse.party || null)
      setMembers(membersResponse.members || partyResponse.party?.members || [])
    } catch (error) {
      console.error("Error loading party details:", error)
      Alert.alert("Error", "Failed to load party details")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  useEffect(() => {
    loadParty()
  }, [loadParty])

  const weeklySummary = party?.weekly || null
  const weeklyGoalLabel =
    weeklySummary?.weekly_goal_label || party?.weekly_goal_label || party?.goal || "Weekly team goal"
  const weeklyGoalTarget = Math.max(
    1,
    Number(weeklySummary?.weekly_goal_target ?? party?.weekly_goal_target ?? 10),
  )
  const weeklyPoints = Math.max(
    0,
    Number(weeklySummary?.total_points ?? party?.weekly_points ?? 0),
  )
  const weeklyProgress = Math.min(
    100,
    Math.max(
      0,
      Number(
        weeklySummary?.progress_percent ??
          party?.progress ??
          Math.round((weeklyPoints / weeklyGoalTarget) * 100),
      ) || 0,
    ),
  )
  const contributors = Array.isArray(weeklySummary?.member_contributions)
    ? weeklySummary.member_contributions
    : []

  const handleLeaveParty = () => {
    if (!party) return

    Alert.alert(
      "Leave Party",
      `Are you sure you want to leave ${party.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await partiesAPI.leaveParty(partyId)
              Alert.alert("Left Party")
              router.replace('/more/social/parties')
            } catch (error) {
              console.error("Error leaving party:", error)
              Alert.alert("Error", "Failed to leave party")
            }
          },
        },
      ],
    )
  }

  const handleContribute = async (points: number) => {
    if (!Number.isFinite(partyId) || points < 1) {
      return
    }

    try {
      setContributing(true)
      await partiesAPI.contributeToParty(partyId, points)
      await loadParty()
    } catch (error) {
      console.error("Error contributing to party:", error)
      const message = error instanceof Error ? error.message : "Failed to add contribution"
      Alert.alert("Error", message)
    } finally {
      setContributing(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading party...</Text>
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
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Party Details</Text>
          <TouchableOpacity style={tw`p-2`} onPress={loadParty}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!party ? (
          <View style={tw`items-center py-12`}>
            <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
            <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>Party not found</Text>
            <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>This party may no longer exist.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[tw`rounded-2xl p-6 mb-4`, { backgroundColor: colors.card }]}> 
              <View style={tw`flex-row items-center mb-4`}>
                <View style={[tw`w-14 h-14 rounded-xl items-center justify-center mr-3`, { backgroundColor: `${party.color || colors.accent}20` }]}>
                  <Text style={tw`text-2xl`}>{party.emoji || '🎉'}</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{party.name}</Text>
                  <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>{party.description || 'No description'}</Text>
                </View>
              </View>

              {!!weeklyGoalLabel && (
                <View style={tw`mb-4`}>
                  <View style={tw`flex-row justify-between items-center mb-1`}>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{weeklyGoalLabel}</Text>
                    <Text style={[tw`text-sm font-bold`, { color: party.color || colors.accent }]}>
                      {weeklyPoints}/{weeklyGoalTarget} pts
                    </Text>
                  </View>
                  <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                    <View
                      style={[
                        tw`h-full rounded-full`,
                        { width: `${weeklyProgress}%`, backgroundColor: party.color || colors.accent },
                      ]}
                    />
                  </View>
                  <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>{weeklyProgress}% weekly goal complete</Text>
                </View>
              )}

              <View style={tw`flex-row`}> 
                <TouchableOpacity
                  style={[
                    tw`flex-1 py-3 rounded-xl mr-2`,
                    {
                      backgroundColor: party.color || colors.accent,
                      opacity: contributing ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => handleContribute(1)}
                  disabled={contributing}
                >
                  <Text style={tw`text-white text-center font-semibold`}>
                    {contributing ? "Updating..." : "+1 Point"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[tw`flex-1 py-3 rounded-xl ml-2`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => handleContribute(3)}
                  disabled={contributing}
                >
                  <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>+3 Points</Text>
                </TouchableOpacity>
              </View>

              <View style={[tw`border-t pt-4`, { borderColor: colors.cardSecondary }]}>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Members</Text>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>
                    {party.member_count || members.length || 0}/{party.max_members || 10}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Created</Text>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>
                    {party.created_at || party.updated_at
                      ? new Date(party.created_at || party.updated_at).toLocaleDateString()
                      : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}> 
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Weekly Contributions</Text>

              {contributors.length === 0 ? (
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>No contributions yet this week.</Text>
              ) : (
                contributors.slice(0, 8).map((contributor: any) => (
                  <View
                    key={contributor.id || contributor.username}
                    style={[tw`flex-row items-center justify-between py-2 border-b`, { borderColor: colors.cardSecondary }]}
                  >
                    <View style={tw`flex-row items-center flex-1`}> 
                      <View style={[tw`w-8 h-8 rounded-lg items-center justify-center mr-3`, { backgroundColor: colors.cardSecondary }]}>
                        <Text>{contributor.avatar || "🙂"}</Text>
                      </View>
                      <Text style={[tw`font-medium`, { color: colors.text }]}>{contributor.username}</Text>
                    </View>
                    <Text style={[tw`font-bold`, { color: party.color || colors.accent }]}>{Number(contributor.points || 0)} pts</Text>
                  </View>
                ))
              )}
            </View>

            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}> 
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Members ({members.length})</Text>
              {members.map((member) => (
                <View
                  key={member.id || member.user_id || member.username}
                  style={[tw`flex-row items-center py-3 border-b`, { borderColor: colors.cardSecondary }]}
                >
                  <View style={[tw`w-10 h-10 rounded-lg items-center justify-center mr-3`, { backgroundColor: colors.cardSecondary }]}>
                    {member.avatar ? (
                      <Text style={tw`text-lg`}>{member.avatar}</Text>
                    ) : (
                      <Ionicons name="person" size={20} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={[tw`font-semibold`, { color: colors.text }]}>{member.username}</Text>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Level {member.level || 1}</Text>
                  </View>
                  <View style={[tw`px-2 py-1 rounded`, { backgroundColor: member.role === 'admin' ? '#F59E0B20' : colors.cardSecondary }]}>
                    <Text style={[tw`text-xs font-semibold`, { color: member.role === 'admin' ? '#F59E0B' : colors.textSecondary }]}>
                      {member.role || 'member'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[tw`rounded-xl p-4`, { backgroundColor: colors.error }]}
              onPress={handleLeaveParty}
            >
              <Text style={tw`text-white text-center font-semibold`}>Leave Party</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
