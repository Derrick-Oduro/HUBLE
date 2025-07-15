"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import tw from "../../../../lib/tailwind"
import React from "react"

export default function ChallengeDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [hasJoined, setHasJoined] = useState(false)

  // Mock challenge data based on ID
  const challenges = {
    1: {
      id: 1,
      title: "7-Day Meditation Challenge",
      description: "Build a consistent meditation practice by meditating for at least 10 minutes every day for 7 consecutive days.",
      emoji: "🧘",
      color: "#8B5CF6",
      difficulty: "Medium",
      participants: 156,
      timeLeft: "3 days",
      reward: {
        title: "Zen Master Badge",
        description: "Exclusive badge for meditation masters",
        xp: 500,
        gems: 50
      },
      rules: [
        "Meditate for at least 10 minutes per day",
        "Use any meditation technique you prefer",
        "Log your session within 24 hours",
        "No skipping days - streak must be consecutive"
      ],
      leaderboard: [
        { rank: 1, username: "ZenMaster99", streak: 7, xp: 1200, avatar: "🧘‍♂️" },
        { rank: 2, username: "MindfulSoul", streak: 6, xp: 1050, avatar: "🧘‍♀️" },
        { rank: 3, username: "PeaceFinder", streak: 6, xp: 980, avatar: "☮️" },
        { rank: 4, username: "CalmSpirit", streak: 5, xp: 875, avatar: "🕯️" },
        { rank: 5, username: "SereneVibes", streak: 5, xp: 820, avatar: "🌸" }
      ],
      timeline: [
        { day: 1, completed: true, participants: 156 },
        { day: 2, completed: true, participants: 142 },
        { day: 3, completed: true, participants: 128 },
        { day: 4, completed: false, participants: 115 },
        { day: 5, completed: false, participants: 0 },
        { day: 6, completed: false, participants: 0 },
        { day: 7, completed: false, participants: 0 }
      ]
    },
    2: {
      id: 2,
      title: "Code 100 Hours",
      description: "Complete 100 hours of coding practice to become a true code ninja.",
      emoji: "👨‍💻",
      color: "#10B981",
      difficulty: "Hard",
      participants: 89,
      timeLeft: "2 weeks",
      reward: {
        title: "Code Ninja Badge",
        description: "Master-level coding achievement",
        xp: 1000,
        gems: 100
      },
      rules: [
        "Track coding sessions of at least 30 minutes",
        "Any programming language counts",
        "Include practice, projects, or learning",
        "Total 100 hours within the challenge period"
      ],
      leaderboard: [
        { rank: 1, username: "CodeMaster", streak: 45, xp: 2200, avatar: "👨‍💻" },
        { rank: 2, username: "DevGuru", streak: 38, xp: 1890, avatar: "🚀" },
        { rank: 3, username: "TechNinja", streak: 35, xp: 1750, avatar: "⚡" }
      ],
      timeline: []
    }
  }

  const challenge = challenges[id as string] || challenges[1]

  const handleJoinChallenge = () => {
    if (hasJoined) {
      Alert.alert(
        "Leave Challenge",
        "Are you sure you want to leave this challenge? Your progress will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Leave", 
            style: "destructive",
            onPress: () => setHasJoined(false)
          }
        ]
      )
    } else {
      setHasJoined(true)
      Alert.alert("Welcome! 🎉", "You've joined the challenge. Good luck!")
    }
  }

  const LeaderboardItem = ({ item }) => (
    <View style={[
      tw`bg-gray-700 rounded-xl p-4 flex-row items-center mb-3`,
      item.rank <= 3 && { 
        borderWidth: 2, 
        borderColor: item.rank === 1 ? '#F59E0B' : item.rank === 2 ? '#9CA3AF' : '#CD7C2F'
      }
    ]}>
      <View style={[
        tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
        { 
          backgroundColor: item.rank === 1 ? '#F59E0B' : 
                          item.rank === 2 ? '#9CA3AF' : 
                          item.rank === 3 ? '#CD7C2F' : '#6B7280'
        }
      ]}>
        <Text style={tw`text-white font-bold text-sm`}>#{item.rank}</Text>
      </View>
      
      <View style={[
        tw`w-10 h-10 rounded-lg items-center justify-center mr-3`,
        { backgroundColor: `${challenge.color}20` }
      ]}>
        <Text style={tw`text-lg`}>{item.avatar}</Text>
      </View>
      
      <View style={tw`flex-1`}>
        <Text style={tw`text-white font-semibold`}>{item.username}</Text>
        <Text style={tw`text-gray-400 text-sm`}>{item.streak} progress • {item.xp} XP</Text>
      </View>
      
      {item.rank <= 3 && (
        <Ionicons 
          name="trophy" 
          size={20} 
          color={item.rank === 1 ? '#F59E0B' : item.rank === 2 ? '#9CA3AF' : '#CD7C2F'} 
        />
      )}
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
          <Text style={tw`text-white text-2xl font-bold flex-1`}>Challenge</Text>
          <TouchableOpacity style={tw`p-2`}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Challenge Header */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-6 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                { backgroundColor: `${challenge.color}20` }
              ]}>
                <Text style={tw`text-3xl`}>{challenge.emoji}</Text>
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-xl font-bold mb-1`}>{challenge.title}</Text>
                <View style={tw`flex-row items-center`}>
                  <View style={[
                    tw`px-2 py-1 rounded mr-2`,
                    { backgroundColor: `${challenge.color}20` }
                  ]}>
                    <Text style={[tw`text-xs font-bold`, { color: challenge.color }]}>
                      {challenge.difficulty}
                    </Text>
                  </View>
                  <Text style={tw`text-gray-400 text-sm`}>⏰ {challenge.timeLeft} left</Text>
                </View>
              </View>
            </View>

            <Text style={tw`text-gray-300 mb-4 leading-5`}>{challenge.description}</Text>

            <View style={tw`flex-row justify-between items-center pt-4 border-t border-gray-700`}>
              <Text style={tw`text-gray-400`}>👥 {challenge.participants} participants</Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-yellow-400 mr-1`}>🏆</Text>
                <Text style={tw`text-gray-300`}>{challenge.reward.xp} XP + {challenge.reward.gems} Gems</Text>
              </View>
            </View>
          </View>

          {/* Progress Timeline (only for certain challenges) */}
          {challenge.timeline && challenge.timeline.length > 0 && (
            <View style={[
              tw`bg-gray-800 rounded-2xl p-5 mb-6`,
              { backgroundColor: '#1F2937' }
            ]}>
              <Text style={tw`text-white text-lg font-bold mb-4`}>Progress Timeline</Text>
              
              <View style={tw`flex-row justify-between items-center`}>
                {challenge.timeline.map((day) => (
                  <View key={day.day} style={tw`items-center`}>
                    <View style={[
                      tw`w-8 h-8 rounded-full items-center justify-center mb-2`,
                      {
                        backgroundColor: day.completed ? challenge.color : 
                                       day.day === 4 && hasJoined ? `${challenge.color}50` : '#374151',
                        borderWidth: day.day === 4 && hasJoined ? 2 : 0,
                        borderColor: challenge.color
                      }
                    ]}>
                      {day.completed ? (
                        <Ionicons name="checkmark" size={16} color="white" />
                      ) : (
                        <Text style={tw`text-white text-sm font-bold`}>{day.day}</Text>
                      )}
                    </View>
                    <Text style={tw`text-gray-400 text-xs`}>Day {day.day}</Text>
                    {day.participants > 0 && (
                      <Text style={tw`text-gray-500 text-xs`}>{day.participants}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Leaderboard */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Leaderboard</Text>
            
            {challenge.leaderboard.slice(0, 5).map((item) => (
              <LeaderboardItem key={item.rank} item={item} />
            ))}
            
            <TouchableOpacity style={tw`mt-2`}>
              <Text style={tw`text-violet-400 text-center font-semibold`}>View Full Leaderboard</Text>
            </TouchableOpacity>
          </View>

          {/* Rules */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Challenge Rules</Text>
            
            {challenge.rules.map((rule, index) => (
              <View key={index} style={tw`flex-row items-start mb-3`}>
                <View style={[
                  tw`w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5`,
                  { backgroundColor: `${challenge.color}20` }
                ]}>
                  <Text style={[tw`text-xs font-bold`, { color: challenge.color }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={tw`text-gray-300 flex-1`}>{rule}</Text>
              </View>
            ))}
          </View>

          {/* Reward Details */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Rewards</Text>
            
            <View style={[
              tw`rounded-xl p-4`,
              { backgroundColor: `${challenge.color}10` }
            ]}>
              <View style={tw`flex-row items-center mb-3`}>
                <Text style={tw`text-2xl mr-3`}>🏆</Text>
                <View>
                  <Text style={tw`text-white font-bold text-lg`}>{challenge.reward.title}</Text>
                  <Text style={tw`text-gray-400`}>{challenge.reward.description}</Text>
                </View>
              </View>
              
              <View style={tw`flex-row justify-between pt-3 border-t border-gray-600`}>
                <View style={tw`items-center`}>
                  <Text style={tw`text-yellow-400 text-lg`}>⭐</Text>
                  <Text style={tw`text-white font-bold`}>{challenge.reward.xp}</Text>
                  <Text style={tw`text-gray-400 text-xs`}>XP</Text>
                </View>
                <View style={tw`items-center`}>
                  <Text style={tw`text-purple-400 text-lg`}>💎</Text>
                  <Text style={tw`text-white font-bold`}>{challenge.reward.gems}</Text>
                  <Text style={tw`text-gray-400 text-xs`}>Gems</Text>
                </View>
                <View style={tw`items-center`}>
                  <Text style={tw`text-blue-400 text-lg`}>🏅</Text>
                  <Text style={tw`text-white font-bold`}>1</Text>
                  <Text style={tw`text-gray-400 text-xs`}>Badge</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Join/Leave Button */}
          <TouchableOpacity 
            style={[
              tw`rounded-2xl p-4 mb-4`,
              {
                backgroundColor: hasJoined ? '#EF4444' : challenge.color,
                shadowColor: hasJoined ? '#EF4444' : challenge.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]} 
            onPress={handleJoinChallenge}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>
              {hasJoined ? 'Leave Challenge' : 'Join Challenge 🚀'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}