"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Alert, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import { partiesAPI } from "../../../lib/api"
import { Button, Card, EmojiTile, EmptyState, HeaderButton, LoadingState, Pill, ProgressBar, Screen, Section } from "../../../components/ui"

export default function Parties() {
  const router = useRouter()
  const { colors } = useTheme()
  const [myParties, setMyParties] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [partiesData, invitesData] = await Promise.all([partiesAPI.getUserParties(), partiesAPI.getPartyInvitations()])
      setMyParties(partiesData.parties || [])
      setInvitations(invitesData.invitations || [])
    } catch (error) {
      console.error("Error loading parties:", error)
      Alert.alert("Couldn't load parties", "Please try again in a moment.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLeaveParty = (partyId: number, partyName: string) => {
    Alert.alert("Leave party", `Leave "${partyName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await partiesAPI.leaveParty(partyId)
            loadData()
          } catch (error) {
            console.error("Error leaving party:", error)
            Alert.alert("Something went wrong", "Couldn't leave the party.")
          }
        },
      },
    ])
  }

  const respond = async (invitationId: number, accept: boolean) => {
    setBusyId(invitationId)
    try {
      if (accept) await partiesAPI.acceptPartyInvitation(invitationId)
      else await partiesAPI.declinePartyInvitation(invitationId)
      await loadData()
    } catch (error) {
      console.error("Error responding to invitation:", error)
      Alert.alert("Something went wrong", accept ? "Couldn't join the party." : "Couldn't decline the invitation.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Screen
      title="Parties"
      subtitle={`${myParties.length} ${myParties.length === 1 ? "party" : "parties"}`}
      right={<HeaderButton icon="add" label="Create party" primary onPress={() => router.push("/more/social/create-party")} />}
    >
      {loading ? (
        <LoadingState />
      ) : (
        <>
          {invitations.length > 0 && (
            <Section title={`Invitations · ${invitations.length}`}>
              {invitations.map((invitation) => {
                const invitationId = invitation.invitation_id || invitation.id
                const color = invitation.party_color || invitation.color || colors.accent
                const members = invitation.party_member_count || invitation.member_count || 0
                const maxMembers = invitation.party_max_members || invitation.max_members || 10
                return (
                  <Card key={invitationId} highlight={colors.accent} style={{ gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <EmojiTile emoji={invitation.party_emoji || invitation.emoji || "🎉"} color={color} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }} numberOfLines={1}>
                          {invitation.party_name || invitation.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
                          {invitation.invited_by_username ? `Invited by ${invitation.invited_by_username}` : "You're invited"} · {members}/{maxMembers} members
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button label="Join" small style={{ flex: 1 }} loading={busyId === invitationId} onPress={() => respond(invitationId, true)} />
                      <Button label="Decline" small variant="ghost" style={{ flex: 1 }} disabled={busyId === invitationId} onPress={() => respond(invitationId, false)} />
                    </View>
                  </Card>
                )
              })}
            </Section>
          )}

          <Section title="Your parties">
            {myParties.length === 0 ? (
              <EmptyState
                icon="star-outline"
                title="No parties yet"
                message="Create a party or accept an invite to reach goals together."
                action={<Button label="Create party" small icon="add" onPress={() => router.push("/more/social/create-party")} />}
              />
            ) : (
              myParties.map((party) => {
                const color = party.color || colors.accent
                const isAdmin = party.role === "admin"
                const isCoop = `${party.type || ""}`.toLowerCase() === "cooperative"
                const members = party.member_count || party.members || 0
                const maxMembers = party.max_members || 10
                const goalLabel = party.weekly_goal_label || party.goal || "Weekly team goal"
                const goalTarget = Math.max(1, Number(party.weekly_goal_target || 10))
                const points = Math.max(0, Number(party.weekly_points || 0))
                const progress = Math.min(100, Math.max(0, Number(party.progress ?? Math.round((points / goalTarget) * 100)) || 0))

                return (
                  <Card key={party.id} onPress={() => router.push(`/more/social/party/${party.id}`)} style={{ gap: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <EmojiTile emoji={party.emoji || "🎉"} color={color} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ flexShrink: 1, fontSize: 15, fontWeight: "700", color: colors.text }} numberOfLines={1}>
                            {party.name}
                          </Text>
                          {isAdmin && <Pill label="Admin" color={colors.accent} />}
                          {isCoop && <Pill label="Co-op" color={colors.success} />}
                        </View>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
                          {party.description || `${members}/${maxMembers} members`}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>
                        {members}/{maxMembers}
                      </Text>
                    </View>

                    <View style={{ gap: 6 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 13, color: colors.text }} numberOfLines={1}>
                          {goalLabel}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
                          {points}/{goalTarget} pts
                        </Text>
                      </View>
                      <ProgressBar value={progress / 100} color={color} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button label="Open" small variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/more/social/party/${party.id}`)} />
                      <Button
                        label={isAdmin ? "Manage" : "Leave"}
                        small
                        variant={isAdmin ? "ghost" : "danger"}
                        style={{ flex: 1 }}
                        onPress={() => (isAdmin ? router.push(`/more/social/party/${party.id}`) : handleLeaveParty(party.id, party.name))}
                      />
                    </View>
                  </Card>
                )
              })
            )}
          </Section>
        </>
      )}
    </Screen>
  )
}
