"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function GroupBadges() {
  const router = useRouter()

  // Mock group badges data
  const [earnedBadges] = useState([
    {
      id: 1,
      name: "Team Player",
      description: "Completed 10 group goals",
      emoji: "🤝",
      color: "#10B981",
      earnedWith: "Study Squad",
      earnedDate: "2 weeks ago",
      rarity: "common",
      members: ["You", "CodeMaster", "StudyBuddy", "BookwormBeth"]
    },
    {
      id: 2,
      name: "Knowledge Seekers",
      description: "Study group completed 100 sessions",
      emoji: "🎓",
      color: "#3B82F6",
      earnedWith: "Study Squad",
      earnedDate: "1 week ago",
      rarity: "rare",
      members: ["You", "CodeMaster", "StudyBuddy", "BookwormBeth"]
    },
    {
      id: 3,
      name: "Fitness Warriors",
      description: "Exercise together for 30 days",
      emoji: "⚔️",
      color: "#EF4444",
      earnedWith: "Fitness Warriors",
      earnedDate: "3 days ago",
      rarity: "epic",
      members: ["You", "FitnessFan", "RunnerMike", "HealthyLife", "GymBuddy"]
    }
  ])

  const [availableBadges] = useState([
    {
      id: 4,
      name: "Code Crushers",
      description: "Complete 500 hours of coding as a team",
      emoji: "💻",
      color: "#8B5CF6",
      progress: 67,
      requirement: "500 hours",
      currentProgress: "335 hours",
      rarity: "legendary",
      estimatedTime: "2 weeks"
    },
    {
      id: 5,
      name: "Meditation Masters",
      description: "Meditate together for 100 days",
      emoji: "🧘‍♀️",
      color: "#EC4899",
      progress: 23,
      requirement: "100 days",
      currentProgress: "23 days",
      rarity: "epic",
      estimatedTime: "2.5 months"
    }
  ])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#10B981'
      case 'rare': return '#3B82F6'
      case 'epic': return '#8B5CF6'
      case 'legendary': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const EarnedBadgeCard = ({ badge }) => (
    <View style={[
      tw`bg-gray-800 rounded-2xl p-5 mb-4`,
      { 
        backgroundColor: '#1F2937',
        borderWidth: 2,
        borderColor: `${getRarityColor(badge.rarity)}40`
      }
    ]}>
      <View style={tw`flex-row items-center mb-4`}>
        <View style={[
          tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
          { 
            backgroundColor: `${badge.color}20`,
            borderWidth: 2,
            borderColor: badge.color
          }
        ]}>
          <Text style={tw`text-3xl`}>{badge.emoji}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-white font-bold text-lg mr-2`}>{badge.name}</Text>
            <View style={[
              tw`px-2 py-1 rounded`,
              { backgroundColor: `${getRarityColor(badge.rarity)}20` }
            ]}>
              <Text style={[
                tw`text-xs font-bold uppercase`,
                { color: getRarityColor(badge.rarity) }
              ]}>
                {badge.rarity}
              </Text>
            </View>
          </View>
          <Text style={tw`text-gray-400 text-sm mb-2`}>{badge.description}</Text>
          <Text style={tw`text-gray-500 text-xs`}>
            Earned with {badge.earnedWith} • {badge.earnedDate}
          </Text>
        </View>
      </View>

      {/* Team Members */}
      <View style={tw`pt-4 border-t border-gray-700`}>
        <Text style={tw`text-gray-300 font-medium mb-2`}>Team Members</Text>
        <View style={tw`flex-row flex-wrap`}>
          {badge.members.map((member, index) => (
            <View 
              key={index}
              style={[
                tw`px-3 py-1 rounded-full mr-2 mb-2`,
                { backgroundColor: member === 'You' ? `${badge.color}20` : '#374151' }
              ]}
            >
              <Text style={[
                tw`text-sm font-medium`,
                { color: member === 'You' ? badge.color : '#9CA3AF' }
              ]}>
                {member}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const ProgressBadgeCard = ({ badge }) => (
    <View style={[
      tw`bg-gray-800 rounded-2xl p-5 mb-4`,
      { backgroundColor: '#1F2937' }
    ]}>
      <View style={tw`flex-row items-center mb-4`}>
        <View style={[
          tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
          { backgroundColor: `${badge.color}20` }
        ]}>
          <Text style={tw`text-3xl opacity-50`}>{badge.emoji}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-white font-bold text-lg mr-2`}>{badge.name}</Text>
            <View style={[
              tw`px-2 py-1 rounded`,
              { backgroundColor: `${getRarityColor(badge.rarity)}20` }
            ]}>
              <Text style={[
                tw`text-xs font-bold uppercase`,
                { color: getRarityColor(badge.rarity) }
              ]}>
                {badge.rarity}
              </Text>
            </View>
          </View>
          <Text style={tw`text-gray-400 text-sm`}>{badge.description}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-300 font-medium`}>Progress</Text>
          <Text style={[tw`font-bold`, { color: badge.color }]}>{badge.progress}%</Text>
        </View>
        
        <View style={tw`h-3 bg-gray-700 rounded-full overflow-hidden mb-2`}>
          <View 
            style={[
              tw`h-full rounded-full`,
              { width: `${badge.progress}%`, backgroundColor: badge.color }
            ]} 
          />
        </View>
        
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-gray-400 text-sm`}>{badge.currentProgress}</Text>
          <Text style={tw`text-gray-400 text-sm`}>{badge.requirement}</Text>
        </View>
      </View>

      <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-700`}>
        <Text style={tw`text-gray-400 text-sm`}>⏱️ Est. {badge.estimatedTime}</Text>
        <TouchableOpacity 
          style={[tw`px-4 py-2 rounded-lg`, { backgroundColor: `${badge.color}20` }]}
        >
          <Text style={[tw`font-semibold`, { color: badge.color }]}>View Details</Text>
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
          <Text style={tw`text-white text-2xl font-bold`}>Group Badges</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Your Achievement Stats</Text>
            
            <View style={tw`flex-row justify-between`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-2xl font-bold`}>{earnedBadges.length}</Text>
                <Text style={tw`text-gray-400 text-sm`}>Earned</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-2xl font-bold`}>{availableBadges.length}</Text>
                <Text style={tw`text-gray-400 text-sm`}>In Progress</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-2xl font-bold`}>12</Text>
                <Text style={tw`text-gray-400 text-sm`}>Team Mates</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-white text-2xl font-bold`}>5</Text>
                <Text style={tw`text-gray-400 text-sm`}>Groups</Text>
              </View>
            </View>
          </View>

          {/* Earned Badges */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>
              Earned Badges ({earnedBadges.length})
            </Text>
            
            {earnedBadges.map((badge) => (
              <EarnedBadgeCard key={badge.id} badge={badge} />
            ))}
          </View>

          {/* In Progress Badges */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-xl font-bold mb-4`}>
              In Progress ({availableBadges.length})
            </Text>
            
            {availableBadges.map((badge) => (
              <ProgressBadgeCard key={badge.id} badge={badge} />
            ))}
          </View>

          {/* Badge Rarity Guide */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Badge Rarity Guide</Text>
            
            <View style={tw`space-y-3`}>
              {[
                { rarity: 'Common', color: '#10B981', description: 'Easy to earn with basic teamwork' },
                { rarity: 'Rare', color: '#3B82F6', description: 'Requires consistent group effort' },
                { rarity: 'Epic', color: '#8B5CF6', description: 'Challenging long-term goals' },
                { rarity: 'Legendary', color: '#F59E0B', description: 'Ultimate team achievements' }
              ].map((item, index) => (
                <View key={index} style={tw`flex-row items-center`}>
                  <View style={[
                    tw`w-4 h-4 rounded-full mr-3`,
                    { backgroundColor: item.color }
                  ]} />
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-semibold`}>{item.rarity}</Text>
                    <Text style={tw`text-gray-400 text-sm`}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}