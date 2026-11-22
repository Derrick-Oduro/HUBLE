import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"
import { useMenu } from "../contexts/MenuContext"
import { friendsAPI, partiesAPI } from "../lib/api"
import { ANNOUNCEMENTS } from "../lib/announcements"

type Filter = "All" | "Social" | "Updates"
const FILTERS: Filter[] = ["All", "Social", "Updates"]

const formatDate = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString()
}

export default function Inbox() {
  const { colors } = useTheme()
  const { refreshUnread } = useMenu()
  const router = useRouter()

  const [filter, setFilter] = useState<Filter>("All")
  const [requests, setRequests] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const load = useCallback(async () => {
    const [req, inv] = await Promise.allSettled([friendsAPI.getPendingRequests(), partiesAPI.getPartyInvitations()])
    setRequests(req.status === "fulfilled" ? req.value?.requests || [] : [])
    setInvitations(inv.status === "fulfilled" ? inv.value?.invitations || [] : [])
    setLoadFailed(req.status === "rejected" || inv.status === "rejected")
    refreshUnread()
  }, [refreshUnread])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const act = async (key: string, action: () => Promise<unknown>, failMessage: string) => {
    setBusyKey(key)
    try {
      await action()
      await load()
    } catch (error) {
      console.error(failMessage, error)
      Alert.alert("Something went wrong", failMessage)
    } finally {
      setBusyKey(null)
    }
  }

  const showSocial = filter !== "Updates"
  const showUpdates = filter !== "Social"
  const socialCount = requests.length + invitations.length

  const Button = ({ label, onPress, primary, busy }: { label: string; onPress: () => void; primary?: boolean; busy?: boolean }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={busy}
      style={[
        tw`h-9 px-4 rounded-lg items-center justify-center mr-2`,
        primary ? { backgroundColor: colors.accent } : { borderWidth: 1, borderColor: colors.cardSecondary },
        busy && { opacity: 0.5 },
      ]}
    >
      <Text style={[tw`text-sm font-bold`, { color: primary ? "#FFFFFF" : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={tw`flex-row items-center px-3 pt-2 pb-2`}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={[tw`w-11 h-11 rounded-xl items-center justify-center`, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[tw`flex-1 ml-3 text-xl font-bold`, { color: colors.text }]}>Inbox</Text>
      </View>

      {/* Filters */}
      <View accessibilityRole="tablist" style={tw`flex-row px-3 pb-2`}>
        {FILTERS.map((name) => {
          const selected = name === filter
          const label = name === "All" && socialCount > 0 ? `All · ${socialCount}` : name
          return (
            <TouchableOpacity
              key={name}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(name)}
              style={[tw`h-9 px-4 mr-2 rounded-full items-center justify-center`, { backgroundColor: selected ? colors.accent : colors.card }]}
            >
              <Text style={[tw`text-sm font-bold`, { color: selected ? "#FFFFFF" : colors.textSecondary }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={tw`px-3 pb-10`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        >
          {showSocial && (
            <>
              {requests.map((request) => {
                const key = `friend-${request.id}`
                return (
                  <View key={key} style={[tw`flex-row p-3 mb-2 rounded-2xl`, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent + "66" }]}>
                    <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mr-3`, { backgroundColor: colors.success + "26" }]}>
                      <Ionicons name="person-add-outline" size={20} color={colors.success} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`font-bold`, { color: colors.text }]}>Friend request</Text>
                      <Text style={[tw`text-sm mt-0.5`, { color: colors.text }]}>
                        {request.username}
                        {request.level ? ` (Lv ${request.level})` : ""} wants to be friends.
                      </Text>
                      <Text style={[tw`text-xs mt-0.5`, { color: colors.textSecondary }]}>{formatDate(request.sentAt || request.created_at)}</Text>
                      <View style={tw`flex-row mt-2`}>
                        <Button
                          label="Accept"
                          primary
                          busy={busyKey === key}
                          onPress={() => act(key, () => friendsAPI.acceptFriendRequest(request.id), "Couldn't accept the friend request.")}
                        />
                        <Button
                          label="Decline"
                          busy={busyKey === key}
                          onPress={() => act(key, () => friendsAPI.removeFriend(request.id), "Couldn't decline the friend request.")}
                        />
                      </View>
                    </View>
                  </View>
                )
              })}

              {invitations.map((invitation) => {
                const invitationId = invitation.invitation_id || invitation.id
                const key = `party-${invitationId}`
                const partyName = invitation.party_name || invitation.name || "a party"
                return (
                  <View key={key} style={[tw`flex-row p-3 mb-2 rounded-2xl`, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent + "66" }]}>
                    <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mr-3`, { backgroundColor: colors.accent + "26" }]}>
                      <Text style={tw`text-lg`}>{invitation.party_emoji || invitation.emoji || "🎉"}</Text>
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`font-bold`, { color: colors.text }]}>Party invite</Text>
                      <Text style={[tw`text-sm mt-0.5`, { color: colors.text }]}>
                        {invitation.invited_by_username ? `${invitation.invited_by_username} invited you to ` : "You're invited to "}
                        “{partyName}”.
                      </Text>
                      <Text style={[tw`text-xs mt-0.5`, { color: colors.textSecondary }]}>{formatDate(invitation.created_at || invitation.invited_at)}</Text>
                      <View style={tw`flex-row mt-2`}>
                        <Button
                          label="Join"
                          primary
                          busy={busyKey === key}
                          onPress={() => act(key, () => partiesAPI.acceptPartyInvitation(invitationId), "Couldn't join the party.")}
                        />
                        <Button
                          label="Decline"
                          busy={busyKey === key}
                          onPress={() => act(key, () => partiesAPI.declinePartyInvitation(invitationId), "Couldn't decline the invitation.")}
                        />
                      </View>
                    </View>
                  </View>
                )
              })}

              {loadFailed && (
                <TouchableOpacity onPress={onRefresh} style={[tw`p-4 mb-2 rounded-2xl items-center`, { backgroundColor: colors.card }]}>
                  <Ionicons name="cloud-offline-outline" size={24} color={colors.warning} />
                  <Text style={[tw`text-sm mt-2 text-center`, { color: colors.textSecondary }]}>
                    Couldn't load some messages. Tap to try again.
                  </Text>
                </TouchableOpacity>
              )}

              {socialCount === 0 && !loadFailed && (
                <View style={[tw`p-4 mb-2 rounded-2xl items-center`, { backgroundColor: colors.card }]}>
                  <Ionicons name="checkmark-done-outline" size={24} color={colors.textSecondary} />
                  <Text style={[tw`text-sm mt-2`, { color: colors.textSecondary }]}>No friend requests or party invites right now.</Text>
                </View>
              )}
            </>
          )}

          {showUpdates && (
            <>
              <Text style={[tw`mt-4 mb-2 px-1 text-xs font-bold uppercase`, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
                What's new
              </Text>
              <View style={[tw`rounded-2xl overflow-hidden`, { backgroundColor: colors.card }]}>
                {ANNOUNCEMENTS.map((item, i) => (
                  <View key={item.id} style={[tw`flex-row p-3`, i > 0 && { borderTopWidth: 1, borderTopColor: colors.cardSecondary }]}>
                    <View style={[tw`w-10 h-10 rounded-xl items-center justify-center mr-3`, { backgroundColor: colors.cardSecondary }]}>
                      <Ionicons name="sparkles-outline" size={20} color={colors.text} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`font-semibold`, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[tw`text-sm mt-0.5`, { color: colors.textSecondary }]}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  )
}
