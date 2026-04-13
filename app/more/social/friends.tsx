"use client"

import React, { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { friendsAPI } from "../../../lib/api"


export default function Friends() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("friends")
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      if (activeTab === 'friends') {
        const data = await friendsAPI.getFriends()
        setFriends(data.friends || [])
      } else {
        const data = await friendsAPI.getPendingRequests()
        setFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert("Error", "Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await friendsAPI.acceptFriendRequest(friendshipId)
      Alert.alert("Friend Request Accepted", "You are now friends!")
      loadData()
    } catch (error) {
      console.error("Error accepting request:", error)
      Alert.alert("Error", "Failed to accept friend request")
    }
  }

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await friendsAPI.removeFriend(friendshipId)
      Alert.alert("Friend Request Rejected")
      loadData()
    } catch (error) {
      console.error("Error rejecting request:", error)
      Alert.alert("Error", "Failed to reject friend request")
    }
  }

  const handleRemoveFriend = (friendshipId: number, username: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            try {
              await friendsAPI.removeFriend(friendshipId)
              Alert.alert("Friend Removed")
              loadData()
            } catch (error) {
              console.error("Error removing friend:", error)
              Alert.alert("Error", "Failed to remove friend")
            }
          } 
        }
      ]
    )
  }

  const FriendCard = ({ friend }) => (
    <TouchableOpacity 
      style={[
        tw`rounded-2xl p-4 mb-3`,
        { backgroundColor: colors.card }
      ]}
      onPress={() => router.push(`/more/social/profile/${friend.id}`)}
    >
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { 
            backgroundColor: colors.cardSecondary,
            borderWidth: 2,
            borderColor: colors.textSecondary
          }
        ]}>
          {friend.avatar ? (
            <Text style={tw`text-lg`}>{friend.avatar}</Text>
          ) : (
            <Ionicons name="person" size={24} color={colors.textSecondary} />
          )}
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={[tw`font-bold text-base mr-2`, { color: colors.text }]}>{friend.username}</Text>
            {friend.level && (
              <View style={[
                tw`px-2 py-1 rounded`,
                { backgroundColor: colors.accent + '30' }
              ]}>
                <Text style={[tw`text-xs font-semibold`, { color: colors.accent }]}>Lvl {friend.level}</Text>
              </View>
            )}
          </View>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            {friend.mutual_friends_count > 0 ? `${friend.mutual_friends_count} mutual friends` : 'Friend'}
          </Text>
        </View>
        
        <View style={tw`flex-row`}>
          <TouchableOpacity 
            style={[tw`p-2 rounded-lg mr-2`, { backgroundColor: colors.cardSecondary }]}
            onPress={() => {/* Open chat */}}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`p-2 rounded-lg`, { backgroundColor: colors.cardSecondary }]}
            onPress={() => handleRemoveFriend(friend.friendshipId || friend.id, friend.username)}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const RequestCard = ({ request }) => (
    <View style={[
      tw`rounded-2xl p-4 mb-3`,
      { backgroundColor: colors.card }
    ]}>
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: colors.accent + '20', borderWidth: 1, borderColor: colors.accent }
        ]}>
          {request.avatar ? (
            <Text style={tw`text-lg`}>{request.avatar}</Text>
          ) : (
            <Ionicons name="person" size={24} color={colors.accent} />
          )}
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={[tw`font-bold text-base`, { color: colors.text }]}>{request.username}</Text>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            {request.level && `Level ${request.level} • `}
            {new Date(request.sentAt || request.created_at).toLocaleDateString()}
          </Text>
          {request.mutual_friends_count > 0 && (
            <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
              👥 {request.mutual_friends_count} mutual friends
            </Text>
          )}
        </View>
        
        <View style={tw`flex-row`}>
          <TouchableOpacity 
            style={[tw`px-3 py-2 rounded-lg mr-2`, { backgroundColor: colors.success }]}
            onPress={() => handleAcceptRequest(request.id)}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`px-3 py-2 rounded-lg`, { backgroundColor: colors.cardSecondary }]}
            onPress={() => handleRejectRequest(request.id)}
          >
            <Text style={[tw`font-semibold text-sm`, { color: colors.text }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Friends</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/more/social/add-friend')}
          >
            <Ionicons name="person-add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: colors.card }
        ]}>
          {[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Requests', count: friendRequests.length }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                tw`flex-1 py-3 rounded-xl`,
                activeTab === tab.id && { backgroundColor: colors.accent }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                tw`text-center font-semibold`,
                { color: activeTab === tab.id ? 'white' : colors.textSecondary }
              ]}>
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={tw`items-center py-12`}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'friends' && (
                <View>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Your Friends ({friends.length})
                  </Text>
                  
                  {friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                  
                  {friends.length === 0 && (
                    <View style={tw`items-center py-12`}>
                      <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                      <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No friends yet</Text>
                      <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                        Add friends to see their progress and compete together
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'requests' && (
                <View>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Friend Requests ({friendRequests.length})
                  </Text>
                  
                  {friendRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                  
                  {friendRequests.length === 0 && (
                    <View style={tw`items-center py-12`}>
                      <Ionicons name="mail-outline" size={64} color={colors.textSecondary} />
                      <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No pending requests</Text>
                      <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                        Friend requests will appear here
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
