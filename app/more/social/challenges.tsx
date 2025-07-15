"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function Challenges() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active")

  // Mock challenges data
  const [activeChallenges] = useState([
    {
      id: 1,
      title: "7-Day Meditation Challenge",
      description: "Meditate for 7 days in a row",
      participants: 156,
      timeLeft: "3 days",
      reward: "Zen Master Badge",
      difficulty: "Medium",
      emoji: "🧘",
      color: "#8B5CF6",
      progress: 57,
      myRank: 23
    },
    {
      id: 2,
      title: "Code 100 Hours",
      description: "Complete 100 hours of coding",
      participants: 89,
      timeLeft: "2 weeks",
      reward: "Code Ninja Badge",
      difficulty: "Hard",
      emoji: "👨‍💻",
      color: "#10B981",
      progress: 34,
      myRank: 45
    }
  ])

  const [availableChallenges] = useState([
    {
      id: 3,
      title: "30-Day Reading Streak",
      description: "Read for 30 minutes daily",
      participants: 234,
      timeLeft: "5 days to start",
      reward: "Bookworm Badge",
      difficulty: "Easy",
      emoji: "📚",
      color: "#3B82F6"
    },
    {
      id: 4,
      title: "Fitness February",
      description: "Exercise every day in February",
      participants: 567,
      timeLeft: "1 week to start",
      reward: "Fitness Fanatic Badge",
      difficulty: "Hard",
      emoji: "💪",
      color: "#EF4444"
    }
  ])

  const [completedChallenges] = useState([
    {
      id: 5,
      title: "Focus Sprint Week",
      description: "Complete 50 focus sessions",
      completedAt: "2 weeks ago",
      reward: "Focus Master Badge",
      emoji: "⚡",
      color: "#F59E0B",
      finalRank: 8,
      participants: 143
    }
  ])

  const ChallengeCard = ({ challenge, type = "active" }) => (
    <TouchableOpacity 
      style={[
        tw`bg-gray-800 rounded-2xl p-4 mb-3`,
        { backgroundColor: '#1F2937' }
      ]}
      onPress={() => router.push(`/more/social/challenge/${challenge.id}`)}
    >
      <View style={tw`flex-row items-center mb-3`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: `${challenge.color}20` }
        ]}>
          <Text style={tw`text-xl`}>{challenge.emoji}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={tw`text-white font-bold text-base mb-1`}>{challenge.title}</Text>
          <Text style={tw`text-gray-400 text-sm`}>{challenge.description}</Text>
        </View>
        
        <View style={[
          tw`px-2 py-1 rounded`,
          { 
            backgroundColor: challenge.difficulty === 'Hard' ? '#EF444420' : 
                             challenge.difficulty === 'Medium' ? '#F59E0B20' : '#10B98120'
          }
        ]}>
          <Text style={[
            tw`text-xs font-bold`,
            { 
              color: challenge.difficulty === 'Hard' ? '#EF4444' : 
                     challenge.difficulty === 'Medium' ? '#F59E0B' : '#10B981'
            }
          ]}>
            {challenge.difficulty}
          </Text>
        </View>
      </View>
      
      {type === 'active' && challenge.progress !== undefined && (
        <View style={tw`mb-3`}>
          <View style={tw`flex-row justify-between items-center mb-1`}>
            <Text style={tw`text-gray-300 text-sm`}>Your Progress</Text>
            <Text style={[tw`text-sm font-bold`, { color: challenge.color }]}>
              {challenge.progress}%
            </Text>
          </View>
          <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden`}>
            <View 
              style={[
                tw`h-full rounded-full`,
                { width: `${challenge.progress}%`, backgroundColor: challenge.color }
              ]} 
            />
          </View>
        </View>
      )}
      
      <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-700`}>
        <View>
          {type === 'active' && (
            <>
              <Text style={tw`text-gray-400 text-sm`}>👥 {challenge.participants} joined</Text>
              <Text style={tw`text-gray-400 text-sm`}>🏆 Rank #{challenge.myRank}</Text>
            </>
          )}
          {type === 'available' && (
            <>
              <Text style={tw`text-gray-400 text-sm`}>👥 {challenge.participants} joined</Text>
              <Text style={tw`text-gray-400 text-sm`}>⏰ {challenge.timeLeft}</Text>
            </>
          )}
          {type === 'completed' && (
            <>
              <Text style={tw`text-gray-400 text-sm`}>Finished {challenge.completedAt}</Text>
              <Text style={tw`text-gray-400 text-sm`}>🏆 Final Rank #{challenge.finalRank}</Text>
            </>
          )}
        </View>
        
        <View style={tw`items-end`}>
          <Text style={[tw`text-sm font-semibold`, { color: challenge.color }]}>
            🏆 {challenge.reward}
          </Text>
          {type === 'active' && (
            <Text style={tw`text-gray-400 text-xs mt-1`}>⏰ {challenge.timeLeft} left</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
          <Text style={tw`text-white text-2xl font-bold flex-1`}>Challenges</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/more/social/browse-challenges')}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`bg-gray-800 rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: '#1F2937' }
        ]}>
          {[
            { id: 'active', label: 'Active', count: activeChallenges.length },
            { id: 'available', label: 'Available', count: availableChallenges.length },
            { id: 'completed', label: 'Completed', count: completedChallenges.length }
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
                tw`text-center font-semibold text-sm`,
                { color: activeTab === tab.id ? 'white' : '#9CA3AF' }
              ]}>
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'active' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Active Challenges ({activeChallenges.length})
              </Text>
              
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="active" />
              ))}
              
              {activeChallenges.length === 0 && (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="trophy-outline" size={64} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-lg mt-4`}>No active challenges</Text>
                  <Text style={tw`text-gray-500 text-center mt-2`}>
                    Join challenges to compete and earn rewards
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'available' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Available Challenges ({availableChallenges.length})
              </Text>
              
              {availableChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="available" />
              ))}
            </View>
          )}

          {activeTab === 'completed' && (
            <View>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Completed Challenges ({completedChallenges.length})
              </Text>
              
              {completedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="completed" />
              ))}
              
              {completedChallenges.length === 0 && (
                <View style={tw`items-center py-12`}>
                  <Ionicons name="medal-outline" size={64} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-lg mt-4`}>No completed challenges</Text>
                  <Text style={tw`text-gray-500 text-center mt-2`}>
                    Complete challenges to see your achievements here
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