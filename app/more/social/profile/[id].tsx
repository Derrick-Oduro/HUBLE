"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Alert, Text, View } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import { friendsAPI } from "../../../../lib/api"
import { Avatar, Button, Card, EmptyState, LoadingState, Pill, Screen, StatTile } from "../../../../components/ui"

export default function FriendProfile() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [friend, setFriend] = useState<any>(null)

  const friendId = Number(Array.isArray(id) ? id[0] : id)

  const loadProfile = useCallback(async () => {
    if (!Number.isFinite(friendId)) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await friendsAPI.getFriends()
      setFriend((data.friends || []).find((item: any) => Number(item.id) === friendId) || null)
    } catch (error) {
      console.error("Error loading friend profile:", error)
      Alert.alert("Couldn't load profile", "Please try again in a moment.")
    } finally {
      setLoading(false)
    }
  }, [friendId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const confirmThen = (title: string, message: string, actionLabel: string, action: () => Promise<void>) =>
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: actionLabel, style: "destructive", onPress: () => void action() },
    ])

  const handleRemoveFriend = () => {
    if (!friend) return
    confirmThen("Remove friend", `Remove ${friend.username} from your friends?`, "Remove", async () => {
      try {
        await friendsAPI.removeFriend(friend.friendshipId || friend.id)
        router.replace("/more/social/friends")
      } catch (error) {
        console.error("Error removing friend:", error)
        Alert.alert("Something went wrong", "Couldn't remove this friend.")
      }
    })
  }

  const handleBlockFriend = () => {
    if (!friend) return
    confirmThen("Block user", `Block ${friend.username}? They'll be removed from your friends and can't contact you.`, "Block", async () => {
      try {
        await friendsAPI.blockUser(friend.friendshipId || friend.id)
        router.replace("/more/social/friends")
      } catch (error) {
        console.error("Error blocking friend:", error)
        Alert.alert("Something went wrong", "Couldn't block this user.")
      }
    })
  }

  if (loading) {
    return (
      <Screen title="Profile">
        <LoadingState />
      </Screen>
    )
  }

  if (!friend) {
    return (
      <Screen title="Profile">
        <EmptyState icon="person-circle-outline" title="Profile not found" message="This person may no longer be your friend." />
      </Screen>
    )
  }

  const online = friend.status === "online"

  return (
    <Screen title="Profile">
      <Card style={{ alignItems: "center", gap: 6, paddingVertical: 24 }}>
        <Avatar emoji={friend.avatar} color={friend.avatar_color} size={80} />
        <Text style={{ marginTop: 8, fontSize: 22, fontWeight: "800", color: colors.text }}>{friend.username}</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Pill label={`Level ${friend.level || 1}`} color={colors.accent} />
          <Pill label={online ? "Online" : "Offline"} icon="ellipse" color={online ? colors.success : colors.textSecondary} />
        </View>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          Friends since {friend.friendshipDate ? new Date(friend.friendshipDate).toLocaleDateString() : "—"}
        </Text>
      </Card>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatTile icon="flame-outline" color={colors.warning} value={friend.streak || 0} label="Day streak" />
        <StatTile icon="flash-outline" color={colors.accent} value={friend.experience || 0} label="Experience" />
      </View>

      <View style={{ gap: 8, marginTop: 8 }}>
        <Button label="Remove friend" icon="person-remove-outline" variant="ghost" onPress={handleRemoveFriend} />
        <Button label="Block user" icon="ban-outline" variant="danger" onPress={handleBlockFriend} />
      </View>
    </Screen>
  )
}
