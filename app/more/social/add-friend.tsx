"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function AddFriend() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("search")

  // Mock search results
  const [searchResults] = useState([
    { 
      id: 1, 
      username: "DevGuru99", 
      level: 18, 
      publicProfile: true,
      mutualFriends: 2,
      avatar: "👨‍💻",
      bio: "Full-stack developer & productivity enthusiast"
    },
    { 
      id: 2, 
      username: "YogaMaster", 
      level: 12, 
      publicProfile: true,
      mutualFriends: 0,
      avatar: "🧘‍♀️",
      bio: "Finding balance through mindfulness"
    }
  ])

  // Mock friend suggestions
  const [suggestions] = useState([
    { 
      id: 3, 
      username: "BookwormBeth", 
      level: 14, 
      reason: "Similar reading habits",
      avatar: "📚",
      mutualFriends: 3
    },
    { 
      id: 4, 
      username: "RunnerMike", 
      level: 9, 
      reason: "Both interested in fitness",
      avatar: "🏃‍♂️",
      mutualFriends: 1
    }
  ])

  const handleSendFriendRequest = (userId: number, username: string) => {
    Alert.alert("Friend Request Sent", `Request sent to ${username}!`)
  }

  const UserCard = ({ user, showReason = false }) => (
    <View style={[
      tw`bg-gray-800 rounded-2xl p-4 mb-3`,
      { backgroundColor: '#1F2937' }
    ]}>
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: '#8B5CF620', borderWidth: 1, borderColor: '#8B5CF6' }
        ]}>
          <Text style={tw`text-lg`}>{user.avatar}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={tw`text-white font-bold text-base`}>{user.username}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Level {user.level}</Text>
          {showReason && user.reason && (
            <Text style={tw`text-violet-400 text-sm mt-1`}>💡 {user.reason}</Text>
          )}
          {user.bio && (
            <Text style={tw`text-gray-400 text-sm mt-1`}>{user.bio}</Text>
          )}
          {user.mutualFriends > 0 && (
            <Text style={tw`text-gray-500 text-xs mt-1`}>
              👥 {user.mutualFriends} mutual friends
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[tw`px-4 py-2 rounded-xl`, { backgroundColor: '#8B5CF6' }]}
          onPress={() => handleSendFriendRequest(user.id, user.username)}
        >
          <Text style={tw`text-white font-semibold`}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Add Friends</Text>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`bg-gray-800 rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: '#1F2937' }
        ]}>
          {[
            { id: 'search', label: 'Search' },
            { id: 'suggestions', label: 'Suggested' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                tw`flex-1 py-3 rounded-xl`,
                selectedTab === tab.id && { backgroundColor: '#8B5CF6' }
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[
                tw`text-center font-semibold`,
                { color: selectedTab === tab.id ? 'white' : '#9CA3AF' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        {selectedTab === 'search' && (
          <View style={[
            tw`bg-gray-800 rounded-xl flex-row items-center px-4 py-3 mb-4`,
            { backgroundColor: '#374151' }
          ]}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={tw`mr-3`} />
            <TextInput
              style={tw`flex-1 text-white text-base`}
              placeholder="Search by username..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedTab === 'search' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>Search Results</Text>
              {searchQuery.length > 0 ? (
                searchResults.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))
              ) : (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="search-outline" size={64} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-lg mt-4`}>Start typing to search</Text>
                  <Text style={tw`text-gray-500 text-center mt-2`}>
                    Find friends by their username
                  </Text>
                </View>
              )}
            </View>
          )}

          {selectedTab === 'suggestions' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>Suggested Friends</Text>
              {suggestions.map((user) => (
                <UserCard key={user.id} user={user} showReason={true} />
              ))}
              
              <View style={[
                tw`bg-gray-800 rounded-2xl p-5 mt-4`,
                { backgroundColor: '#1F2937' }
              ]}>
                <Text style={tw`text-white text-lg font-bold mb-3`}>How suggestions work</Text>
                <View style={tw`space-y-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>
                    🎯 Similar goals and habits
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>
                    👥 Mutual friends connections
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>
                    📊 Compatible activity levels
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}