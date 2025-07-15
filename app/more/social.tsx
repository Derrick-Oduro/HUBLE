"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList, TextInput, Alert } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function Social() {
  const router = useRouter()
  const { stats } = useStats()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock social stats
  const socialStats = {
    friends: 12,
    parties: 3,
    activeChallenges: 2,
    totalXpEarned: 2450,
    groupBadges: 5,
    currentStreak: 7
  }

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: "friend_joined",
      message: "CodeMaster completed their study session",
      time: "2 hours ago",
      icon: "person",
      color: "#10B981"
    },
    {
      id: 2,
      type: "party_achievement",
      message: "Study Squad unlocked 'Knowledge Seekers' badge",
      time: "1 day ago",
      icon: "trophy",
      color: "#F59E0B"
    },
    {
      id: 3,
      type: "challenge_progress",
      message: "You moved up to #5 in Meditation Challenge",
      time: "2 days ago",
      icon: "trending-up",
      color: "#8B5CF6"
    }
  ]

  const socialFeatures = [
    {
      icon: "people-outline",
      title: "Friends",
      description: "Add friends and view their progress",
      count: socialStats.friends,
      color: "#10B981",
      action: () => router.push('/more/social/friends')
    },
    {
      icon: "shield-outline",
      title: "Parties",
      description: "Join groups for shared goals",
      count: socialStats.parties,
      color: "#8B5CF6",
      action: () => router.push('/more/social/parties')
    },
    {
      icon: "trophy-outline",
      title: "Challenges",
      description: "Compete in community challenges",
      count: socialStats.activeChallenges,
      color: "#F59E0B",
      action: () => router.push('/more/social/challenges')
    },
    {
      icon: "star-outline",
      title: "Group Badges",
      description: "Achievements earned with others",
      count: socialStats.groupBadges,
      color: "#EC4899",
      action: () => router.push('/more/social/group-badges')
    }
  ]

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Social Hub</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Social Stats Overview */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-6 mb-6`,
            {
              backgroundColor: '#1F2937',
              shadowColor: '#EC4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                {
                  backgroundColor: '#EC489920',
                  borderWidth: 2,
                  borderColor: '#EC4899',
                }
              ]}>
                <Ionicons name="people" size={28} color="#EC4899" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-2xl font-bold`}>Social Profile</Text>
                <Text style={tw`text-gray-400`}>Connect, compete & achieve together</Text>
              </View>
            </View>

            <View style={tw`flex-row justify-between pt-4 border-t border-gray-700`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{socialStats.friends}</Text>
                <Text style={tw`text-gray-400 text-xs`}>Friends</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{socialStats.parties}</Text>
                <Text style={tw`text-gray-400 text-xs`}>Parties</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{socialStats.groupBadges}</Text>
                <Text style={tw`text-gray-400 text-xs`}>Badges</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>{socialStats.currentStreak}</Text>
                <Text style={tw`text-gray-400 text-xs`}>🔥 Streak</Text>
              </View>
            </View>
          </View>

          {/* Social Features Grid */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>Features</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {socialFeatures.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-40 bg-gray-800 rounded-2xl p-4 mb-4`,
                    {
                      backgroundColor: '#1F2937',
                      shadowColor: feature.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  ]}
                  onPress={feature.action}
                >
                  <View style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center mb-3`,
                    { backgroundColor: `${feature.color}20` }
                  ]}>
                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                  </View>
                  
                  <Text style={tw`text-white font-bold text-base mb-1`}>{feature.title}</Text>
                  <Text style={tw`text-gray-400 text-sm mb-3`}>{feature.description}</Text>
                  
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={[tw`font-bold text-lg`, { color: feature.color }]}>
                      {feature.count}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-white text-lg font-bold`}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={tw`text-pink-400 font-semibold`}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentActivity.map((activity) => (
              <View key={activity.id} style={tw`flex-row items-center py-3 border-b border-gray-700 last:border-b-0`}>
                <View style={[
                  tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
                  { backgroundColor: `${activity.color}20` }
                ]}>
                  <Ionicons name={activity.icon} size={20} color={activity.color} />
                </View>
                
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-medium`}>{activity.message}</Text>
                  <Text style={tw`text-gray-400 text-sm`}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Quick Actions</Text>
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity 
                style={[
                  tw`flex-1 bg-green-600 rounded-xl p-4 mr-2 items-center`,
                  {
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => router.push('/more/social/add-friend')}
              >
                <Ionicons name="person-add" size={24} color="white" style={tw`mb-2`} />
                <Text style={tw`text-white font-bold text-sm`}>Add Friend</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  tw`flex-1 bg-violet-600 rounded-xl p-4 ml-2 items-center`,
                  {
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }
                ]}
                onPress={() => router.push('/more/social/create-party')}
              >
                <Ionicons name="add-circle" size={24} color="white" style={tw`mb-2`} />
                <Text style={tw`text-white font-bold text-sm`}>Create Party</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Privacy & Visibility</Text>
            
            <TouchableOpacity 
              style={tw`flex-row items-center justify-between py-3 border-b border-gray-700`}
              onPress={() => router.push('/more/social/privacy')}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="eye-outline" size={20} color="#6B7280" style={tw`mr-3`} />
                <Text style={tw`text-white font-medium`}>Profile Visibility</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-gray-400 mr-2`}>Public</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={tw`flex-row items-center justify-between py-3`}
              onPress={() => router.push('/more/social/blocked-users')}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="ban-outline" size={20} color="#6B7280" style={tw`mr-3`} />
                <Text style={tw`text-white font-medium`}>Blocked Users</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-gray-400 mr-2`}>0</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}