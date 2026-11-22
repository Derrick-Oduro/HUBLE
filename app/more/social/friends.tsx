"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Alert, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import { friendsAPI } from "../../../lib/api"
import { Avatar, Button, Card, Divider, EmptyState, ListRow, LoadingState, Screen, Segmented, RADIUS } from "../../../components/ui"

type Tab = "friends" | "requests"

export default function Friends() {
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>("friends")
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      if (activeTab === "friends") {
        const data = await friendsAPI.getFriends()
        setFriends(data.friends || [])
      } else {
        const data = await friendsAPI.getPendingRequests()
        setFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert("Couldn't load", "Please try again in a moment.")
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const respond = async (friendshipId: number, accept: boolean) => {
    setBusyId(friendshipId)
    try {
      if (accept) await friendsAPI.acceptFriendRequest(friendshipId)
      else await friendsAPI.removeFriend(friendshipId)
      await loadData()
    } catch (error) {
      console.error("Error responding to request:", error)
      Alert.alert("Something went wrong", accept ? "Couldn't accept the request." : "Couldn't decline the request.")
    } finally {
      setBusyId(null)
    }
  }

  const handleRemoveFriend = (friendshipId: number, username: string) => {
    Alert.alert("Remove friend", `Remove ${username} from your friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await friendsAPI.removeFriend(friendshipId)
            loadData()
          } catch (error) {
            console.error("Error removing friend:", error)
            Alert.alert("Something went wrong", "Couldn't remove this friend.")
          }
        },
      },
    ])
  }

  const meta = (person: any) =>
    [person.level ? `Level ${person.level}` : null, person.mutual_friends_count > 0 ? `${person.mutual_friends_count} mutual` : null]
      .filter(Boolean)
      .join(" · ")

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push("/more/social/add-friend")}
      accessibilityLabel="Add friend"
      style={{ width: 40, height: 40, borderRadius: RADIUS.inner, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent }}
    >
      <Ionicons name="person-add" size={18} color="#FFFFFF" />
    </TouchableOpacity>
  )

  return (
    <Screen title="Friends" subtitle={`${friends.length} ${friends.length === 1 ? "friend" : "friends"}`} right={addButton}>
      <Segmented<Tab>
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "friends", label: "Friends" },
          { value: "requests", label: friendRequests.length > 0 ? `Requests · ${friendRequests.length}` : "Requests" },
        ]}
      />

      {loading ? (
        <LoadingState />
      ) : activeTab === "friends" ? (
        friends.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No friends yet"
            message="Add friends to see their progress and keep each other going."
            action={<Button label="Find friends" icon="search" small onPress={() => router.push("/more/social/add-friend")} />}
          />
        ) : (
          <Card padded={false}>
            {friends.map((friend, i) => (
              <View key={friend.id}>
                {i > 0 && <Divider inset={70} />}
                <ListRow
                  leading={<Avatar emoji={friend.avatar} color={friend.avatar_color} size={42} />}
                  title={friend.username}
                  subtitle={meta(friend) || "Friend"}
                  onPress={() => router.push(`/more/social/profile/${friend.id}`)}
                  right={
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(friend.friendshipId || friend.id, friend.username)}
                      accessibilityLabel={`Options for ${friend.username}`}
                      hitSlop={8}
                      style={{ padding: 6 }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  }
                />
              </View>
            ))}
          </Card>
        )
      ) : friendRequests.length === 0 ? (
        <EmptyState icon="mail-outline" title="No pending requests" message="Friend requests you receive will appear here." />
      ) : (
        <Card padded={false}>
          {friendRequests.map((request, i) => (
            <View key={request.id}>
              {i > 0 && <Divider inset={70} />}
              <ListRow
                leading={<Avatar emoji={request.avatar} color={request.avatar_color} size={42} />}
                title={request.username}
                subtitle={meta(request) || new Date(request.sentAt || request.created_at).toLocaleDateString()}
                right={
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Button label="Accept" small loading={busyId === request.id} onPress={() => respond(request.id, true)} />
                    <Button label="Decline" small variant="ghost" disabled={busyId === request.id} onPress={() => respond(request.id, false)} />
                  </View>
                }
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  )
}
