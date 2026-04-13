"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../../../../contexts/ThemeProvider"
import tw from "../../../../lib/tailwind"
import { friendsAPI } from "../../../../lib/api"

export default function FriendProfile() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { colors, currentTheme } = useTheme()
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
      const friendsList = data.friends || []
      const found = friendsList.find((item: any) => Number(item.id) === friendId)
      setFriend(found || null)
    } catch (error) {
      console.error("Error loading friend profile:", error)
      Alert.alert("Error", "Failed to load friend profile")
    } finally {
      setLoading(false)
    }
  }, [friendId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleRemoveFriend = () => {
    if (!friend) return

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend.username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await friendsAPI.removeFriend(friend.friendshipId || friend.id)
              Alert.alert("Friend Removed")
              router.replace('/more/social/friends')
            } catch (error) {
              console.error("Error removing friend:", error)
              Alert.alert("Error", "Failed to remove friend")
            }
          },
        },
      ],
    )
  }

  const handleBlockFriend = async () => {
    if (!friend) return

    try {
      await friendsAPI.blockUser(friend.friendshipId || friend.id)
      Alert.alert("User Blocked", `${friend.username} has been blocked.`)
      router.replace('/more/social/friends')
    } catch (error) {
      console.error("Error blocking friend:", error)
      Alert.alert("Error", "Failed to block user")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading profile...</Text>
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
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Friend Profile</Text>
          <TouchableOpacity style={tw`p-2`} onPress={loadProfile}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!friend ? (
          <View style={tw`items-center py-12`}>
            <Ionicons name="person-circle-outline" size={64} color={colors.textSecondary} />
            <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>Friend not found</Text>
            <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>This profile is no longer available.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[tw`rounded-2xl p-6 mb-4`, { backgroundColor: colors.card }]}> 
              <View style={tw`items-center mb-4`}>
                <View style={[tw`w-24 h-24 rounded-2xl items-center justify-center mb-3`, { backgroundColor: colors.cardSecondary }]}>
                  {friend.avatar ? (
                    <Text style={tw`text-4xl`}>{friend.avatar}</Text>
                  ) : (
                    <Ionicons name="person" size={40} color={colors.textSecondary} />
                  )}
                </View>
                <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{friend.username}</Text>
                <Text style={[tw`mt-1`, { color: colors.textSecondary }]}>Level {friend.level || 1}</Text>
              </View>

              <View style={[tw`border-t pt-4`, { borderColor: colors.cardSecondary }]}>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Status</Text>
                  <Text style={[tw`font-semibold`, { color: friend.status === 'online' ? colors.success : colors.text }]}>
                    {friend.status || 'offline'}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Current Streak</Text>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>{friend.streak || 0} days</Text>
                </View>
                <View style={tw`flex-row justify-between mb-3`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Experience</Text>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>{friend.experience || 0}</Text>
                </View>
                <View style={tw`flex-row justify-between`}>
                  <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Friends Since</Text>
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>
                    {friend.friendshipDate ? new Date(friend.friendshipDate).toLocaleDateString() : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[tw`rounded-xl p-4 mb-3`, { backgroundColor: colors.error }]}
              onPress={handleRemoveFriend}
            >
              <Text style={tw`text-white text-center font-semibold`}>Remove Friend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[tw`rounded-xl p-4`, { backgroundColor: colors.cardSecondary }]}
              onPress={handleBlockFriend}
            >
              <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Block User</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}
