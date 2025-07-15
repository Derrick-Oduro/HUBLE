"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function Friends() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("friends")

  // Mock friends data
  const [friends] = useState([
    { 
      id: 1, 
      username: "CodeMaster", 
      level: 12, 
      status: "online", 
      lastActivity: "2 hours ago",
      streak: 15,
      todayXP: 240,
      avatar: "👨‍💻",
      isPublic: true
    },
    { 
      id: 2, 
      username: "FitnessFan", 
      level: 8, 
      status: "offline", 
      lastActivity: "1 day ago",
      streak: 8,
      todayXP: 180,
      avatar: "💪",
      isPublic: true
    },
    { 
      id: 3, 
      username: "StudyBuddy", 
      level: 15, 
      status: "online", 
      lastActivity: "30 minutes ago",
      streak: 22,
      todayXP: 320,
      avatar: "📚",
      isPublic: false
    }
  ])

  // Mock friend requests
  const [friendRequests] = useState([
    {
      id: 4,
      username: "NewUser123",
      level: 3,
      avatar: "🌟",
      mutualFriends: 1,
      sentAt: "2 hours ago"
    }
  ])

  const handleAcceptRequest = (userId: number) => {
    Alert.alert("Friend Request Accepted", "You are now friends!")
  }

  const handleRejectRequest = (userId: number) => {
    Alert.alert("Friend Request Rejected")
  }

  const handleRemoveFriend = (userId: number, username: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => {} }
      ]
    )
  }

  const FriendCard = ({ friend }) => (
    <TouchableOpacity 
      style={[
        tw`bg-gray-800 rounded-2xl p-4 mb-3`,
        { backgroundColor: '#1F2937' }
      ]}
      onPress={() => router.push(`/more/social/profile/${friend.id}`)}
    >
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { 
            backgroundColor: friend.status === 'online' ? '#10B98120' : '#6B728020',
            borderWidth: 2,
            borderColor: friend.status === 'online' ? '#10B981' : '#6B7280'
          }
        ]}>
          <Text style={tw`text-lg`}>{friend.avatar}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-white font-bold text-base mr-2`}>{friend.username}</Text>
            <View style={[
              tw`w-2 h-2 rounded-full`,
              { backgroundColor: friend.status === 'online' ? '#10B981' : '#6B7280' }
            ]} />
            {!friend.isPublic && (
              <Ionicons name="lock-closed" size={14} color="#6B7280" style={tw`ml-2`} />
            )}
          </View>
          <Text style={tw`text-gray-400 text-sm`}>Level {friend.level} • {friend.lastActivity}</Text>
          
          {friend.isPublic && (
            <View style={tw`flex-row items-center mt-2`}>
              <View style={tw`flex-row items-center mr-4`}>
                <Text style={tw`text-orange-400 mr-1`}>🔥</Text>
                <Text style={tw`text-gray-300 text-sm`}>{friend.streak}</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-violet-400 mr-1`}>⭐</Text>
                <Text style={tw`text-gray-300 text-sm`}>{friend.todayXP} XP</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={tw`flex-row`}>
          <TouchableOpacity 
            style={[tw`p-2 rounded-lg mr-2`, { backgroundColor: '#374151' }]}
            onPress={() => {/* Open chat */}}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`p-2 rounded-lg`, { backgroundColor: '#374151' }]}
            onPress={() => handleRemoveFriend(friend.id, friend.username)}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const RequestCard = ({ request }) => (
    <View style={[
      tw`bg-gray-800 rounded-2xl p-4 mb-3`,
      { backgroundColor: '#1F2937' }
    ]}>
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: '#8B5CF620', borderWidth: 1, borderColor: '#8B5CF6' }
        ]}>
          <Text style={tw`text-lg`}>{request.avatar}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={tw`text-white font-bold text-base`}>{request.username}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Level {request.level} • {request.sentAt}</Text>
          {request.mutualFriends > 0 && (
            <Text style={tw`text-gray-500 text-xs mt-1`}>
              👥 {request.mutualFriends} mutual friends
            </Text>
          )}
        </View>
        
        <View style={tw`flex-row`}>
          <TouchableOpacity 
            style={[tw`px-3 py-2 rounded-lg mr-2`, { backgroundColor: '#10B981' }]}
            onPress={() => handleAcceptRequest(request.id)}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`px-3 py-2 rounded-lg`, { backgroundColor: '#374151' }]}
            onPress={() => handleRejectRequest(request.id)}
          >
            <Text style={tw`text-gray-300 font-semibold text-sm`}>Decline</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={tw`text-white text-2xl font-bold flex-1`}>Friends</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/more/social/add-friend')}
          >
            <Ionicons name="person-add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`bg-gray-800 rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: '#1F2937' }
        ]}>
          {[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Requests', count: friendRequests.length }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                tw`flex-1 py-3 rounded-xl`,
                activeTab === tab.id && { backgroundColor: '#8B5CF6' }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                tw`text-center font-semibold`,
                { color: activeTab === tab.id ? 'white' : '#9CA3AF' }
              ]}>
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={[
          tw`bg-gray-800 rounded-xl flex-row items-center px-4 py-3 mb-4`,
          { backgroundColor: '#374151' }
        ]}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={tw`mr-3`} />
          <TextInput
            style={tw`flex-1 text-white text-base`}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'friends' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Your Friends ({friends.length})
              </Text>
              
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
              
              {friends.length === 0 && (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="people-outline" size={64} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-lg mt-4`}>No friends yet</Text>
                  <Text style={tw`text-gray-500 text-center mt-2`}>
                    Add friends to see their progress and compete together
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'requests' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Friend Requests ({friendRequests.length})
              </Text>
              
              {friendRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
              
              {friendRequests.length === 0 && (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="mail-outline" size={64} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-lg mt-4`}>No pending requests</Text>
                  <Text style={tw`text-gray-500 text-center mt-2`}>
                    Friend requests will appear here
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