"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { friendsAPI } from "../../../lib/api"


export default function AddFriend() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("search")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      Alert.alert("Search Error", "Please enter at least 2 characters")
      return
    }

    try {
      setSearching(true)
      setHasSearched(true)
      const response = await friendsAPI.searchUsers(searchQuery.trim())
      setSearchResults(response.users || [])
    } catch (error) {
      console.error("Search error:", error)
      Alert.alert("Error", "Failed to search for users")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSendFriendRequest = async (userId: number, username: string) => {
    try {
      await friendsAPI.sendFriendRequest(userId)
      Alert.alert("Friend Request Sent", `Request sent to ${username}!`)
      // Remove the user from search results
      setSearchResults(searchResults.filter(user => user.id !== userId))
    } catch (error) {
      console.error("Send friend request error:", error)
      Alert.alert("Error", "Failed to send friend request. They may already be your friend or you may have already sent a request.")
    }
  }

  const UserCard = ({ user, showReason = false }) => (
    <View style={[
      tw`rounded-2xl p-4 mb-3`,
      { backgroundColor: colors.card }
    ]}>
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: colors.accent + '20', borderWidth: 1, borderColor: colors.accent }
        ]}>
          {user.avatar ? (
            <Text style={tw`text-lg`}>{user.avatar}</Text>
          ) : (
            <Ionicons name="person" size={24} color={colors.accent} />
          )}
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={[tw`font-bold text-base mr-2`, { color: colors.text }]}>{user.username}</Text>
            {user.level && (
              <View style={[
                tw`px-2 py-1 rounded`,
                { backgroundColor: colors.accent + '30' }
              ]}>
                <Text style={[tw`text-xs font-semibold`, { color: colors.accent }]}>Lvl {user.level}</Text>
              </View>
            )}
          </View>
          {user.email && (
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{user.email}</Text>
          )}
          {showReason && user.reason && (
            <Text style={[tw`text-sm mt-1`, { color: colors.accent }]}>💡 {user.reason}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[tw`px-4 py-2 rounded-xl`, { backgroundColor: colors.accent }]}
          onPress={() => handleSendFriendRequest(user.id, user.username)}
        >
          <Text style={tw`text-white font-semibold`}>Add</Text>
        </TouchableOpacity>
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
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Add Friends</Text>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: colors.card }
        ]}>
          <TouchableOpacity
            style={[
              tw`flex-1 py-3 rounded-xl`,
              selectedTab === 'search' && { backgroundColor: colors.accent }
            ]}
            onPress={() => setSelectedTab('search')}
          >
            <Text style={[
              tw`text-center font-semibold`,
              { color: selectedTab === 'search' ? 'white' : colors.textSecondary }
            ]}>
              Search
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar with Button */}
        {selectedTab === 'search' && (
          <View style={tw`mb-4`}>
            <View style={[
              tw`rounded-xl flex-row items-center px-4 py-3`,
              { backgroundColor: colors.cardSecondary }
            ]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={tw`mr-3`} />
              <TextInput
                style={[tw`flex-1 text-base`, { color: colors.text }]}
                placeholder="Search by username or email..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={[
                tw`rounded-xl py-3 mt-3 items-center`,
                { backgroundColor: colors.accent }
              ]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-bold text-base`}>Search Users</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedTab === 'search' && (
            <View>
              {searching ? (
                <View style={tw`items-center py-12`}>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Searching...</Text>
                </View>
              ) : hasSearched ? (
                searchResults.length > 0 ? (
                  <>
                    <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                      Search Results ({searchResults.length})
                    </Text>
                    {searchResults.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </>
                ) : (
                  <View style={tw`items-center py-12`}>
                    <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                    <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No users found</Text>
                    <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                      Try searching with a different username or email
                    </Text>
                  </View>
                )
              ) : (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                  <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>Search for users</Text>
                  <Text style={[tw`text-center mt-2 px-8`, { color: colors.textSecondary }]}> 
                    Enter a username or email and tap Search Users to find friends
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
