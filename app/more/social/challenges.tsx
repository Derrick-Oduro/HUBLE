"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { challengesAPI } from "../../../lib/api"
import React from "react"

export default function Challenges() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("active")
  const [activeChallenges, setActiveChallenges] = useState([])
  const [availableChallenges, setAvailableChallenges] = useState([])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'active' || activeTab === 'completed') {
        const data = await challengesAPI.getUserChallenges()
        const challenges = data.challenges || []
        setActiveChallenges(challenges.filter(c => !c.completed))
        setCompletedChallenges(challenges.filter(c => c.completed))
      } else {
        const data = await challengesAPI.getActiveChallenges()
        setAvailableChallenges(data.challenges || [])
      }
    } catch (error) {
      console.error("Error loading challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const ChallengeCard = ({ challenge, type = "active" }) => {
    const emoji = challenge.emoji || "🏆"
    const color = challenge.color || "#3B82F6"
    const difficulty = challenge.difficulty || "Medium"
    const participantCount = challenge.participant_count || challenge.participants || 0
    
    // Calculate time left
    const getTimeLeft = () => {
      if (type === 'completed') return null
      const endDate = new Date(challenge.end_date)
      const now = new Date()
      const diffTime = endDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return "Ended"
      if (diffDays === 0) return "Today"
      if (diffDays === 1) return "1 day left"
      return `${diffDays} days left`
    }
    
    return (
      <TouchableOpacity 
        style={[
          tw`rounded-2xl p-4 mb-3`,
          { backgroundColor: colors.card }
        ]}
        onPress={() => router.push(`/more/social/challenge/${challenge.id}`)}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={[
            tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
            { backgroundColor: `${color}20` }
          ]}>
            <Text style={tw`text-xl`}>{emoji}</Text>
          </View>
          
          <View style={tw`flex-1`}>
            <Text style={[tw`font-bold text-base mb-1`, { color: colors.text }]}>{challenge.title}</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{challenge.description}</Text>
          </View>
          
          <View style={[
            tw`px-2 py-1 rounded`,
            { 
              backgroundColor: difficulty === 'Hard' ? '#EF444420' : 
                               difficulty === 'Medium' ? '#F59E0B20' : '#10B98120'
            }
          ]}>
            <Text style={[
              tw`text-xs font-bold`,
              { 
                color: difficulty === 'Hard' ? '#EF4444' : 
                       difficulty === 'Medium' ? '#F59E0B' : '#10B981'
              }
            ]}>
              {difficulty}
            </Text>
          </View>
        </View>
        
        {type === 'active' && challenge.progress !== undefined && (
          <View style={tw`mb-3`}>
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <Text style={[tw`text-sm`, { color: colors.text }]}>Your Progress</Text>
              <Text style={[tw`text-sm font-bold`, { color: color }]}>
                {challenge.progress}%
              </Text>
            </View>
            <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
              <View 
                style={[
                  tw`h-full rounded-full`,
                  { width: `${challenge.progress}%`, backgroundColor: color }
                ]} 
              />
            </View>
          </View>
        )}
        
        <View style={[tw`flex-row justify-between items-center pt-3 border-t`, { borderColor: colors.cardSecondary }]}>
          <View>
            {type === 'active' && (
              <>
                <View style={tw`flex-row items-center mb-1`}>
                  <Ionicons name="people" size={14} color={colors.textSecondary} style={tw`mr-1`} />
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{participantCount} joined</Text>
                </View>
                {challenge.myRank && (
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="trophy" size={14} color={colors.textSecondary} style={tw`mr-1`} />
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Rank #{challenge.myRank}</Text>
                  </View>
                )}
              </>
            )}
            {type === 'available' && (
              <>
                <View style={tw`flex-row items-center mb-1`}>
                  <Ionicons name="people" size={14} color={colors.textSecondary} style={tw`mr-1`} />
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{participantCount} joined</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="time" size={14} color={colors.textSecondary} style={tw`mr-1`} />
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{getTimeLeft()}</Text>
                </View>
              </>
            )}
            {type === 'completed' && (
              <>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                  Finished {new Date(challenge.completed_at).toLocaleDateString()}
                </Text>
                {challenge.finalRank && (
                  <View style={tw`flex-row items-center mt-1`}>
                    <Ionicons name="trophy" size={14}    color={colors.textSecondary} style={tw`mr-1`} />
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Final Rank #{challenge.finalRank}</Text>
                  </View>
                )}
              </>
            )}
          </View>
          
          <View style={tw`items-end`}>
            {(challenge.reward_xp || challenge.reward_coins) && (
              <Text style={[tw`text-sm font-semibold`, { color: color }]}>
                {challenge.reward_xp > 0 && `⭐${challenge.reward_xp} XP `}
                {challenge.reward_coins > 0 && `💰${challenge.reward_coins}`}
              </Text>
            )}
            {type === 'active' && (
              <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>⏰ {getTimeLeft()}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Challenges</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/more/social/browse-challenges')}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[
          tw`rounded-2xl p-1 mb-6 flex-row`,
          { backgroundColor: colors.card }
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
                activeTab === tab.id && { backgroundColor: colors.accent }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                tw`text-center font-semibold text-sm`,
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
              {activeTab === 'active' && (
                <View>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Active Challenges ({activeChallenges.length})
                  </Text>
                  
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} type="active" />
                  ))}
                  
                  {activeChallenges.length === 0 && (
                    <View style={tw`items-center py-12`}>
                      <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
                      <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No active challenges</Text>
                      <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                        Join challenges to compete and earn rewards
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'available' && (
                <View>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Available Challenges ({availableChallenges.length})
                  </Text>
                  
                  {availableChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} type="available" />
                  ))}
                </View>
              )}

              {activeTab === 'completed' && (
                <View>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Completed Challenges ({completedChallenges.length})
                  </Text>
                  
                  {completedChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} type="completed" />
                  ))}
                  
                  {completedChallenges.length === 0 && (
                    <View style={tw`items-center py-12`}>
                      <Ionicons name="medal-outline" size={64} color={colors.textSecondary} />
                      <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No completed challenges</Text>
                      <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                        Complete challenges to see your achievements here
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