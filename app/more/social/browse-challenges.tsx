"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function BrowseChallenges() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const categories = [
    { id: 'all', name: 'All', emoji: '🌟', color: '#8B5CF6' },
    { id: 'fitness', name: 'Fitness', emoji: '💪', color: '#EF4444' },
    { id: 'study', name: 'Study', emoji: '📚', color: '#3B82F6' },
    { id: 'mindfulness', name: 'Mindfulness', emoji: '🧘', color: '#8B5CF6' },
    { id: 'productivity', name: 'Productivity', emoji: '⚡', color: '#F59E0B' },
    { id: 'creative', name: 'Creative', emoji: '🎨', color: '#EC4899' }
  ]

  const difficulties = ['all', 'easy', 'medium', 'hard']

  // Mock challenges data
  const [allChallenges] = useState([
    {
      id: 1,
      title: "7-Day Meditation Challenge",
      description: "Meditate for 7 days in a row",
      participants: 156,
      timeLeft: "3 days",
      reward: "Zen Master Badge",
      difficulty: "medium",
      emoji: "🧘",
      color: "#8B5CF6",
      category: "mindfulness",
      startDate: "Jan 20"
    },
    {
      id: 2,
      title: "30-Day Reading Streak",
      description: "Read for 30 minutes daily",
      participants: 234,
      timeLeft: "5 days to start",
      reward: "Bookworm Badge",
      difficulty: "easy",
      emoji: "📚",
      color: "#3B82F6",
      category: "study",
      startDate: "Jan 25"
    },
    {
      id: 3,
      title: "Fitness February",
      description: "Exercise every day in February",
      participants: 567,
      timeLeft: "1 week to start",
      reward: "Fitness Fanatic Badge",
      difficulty: "hard",
      emoji: "💪",
      color: "#EF4444",
      category: "fitness",
      startDate: "Feb 1"
    },
    {
      id: 4,
      title: "Creative Daily",
      description: "Create something new every day for 14 days",
      participants: 89,
      timeLeft: "2 days",
      reward: "Creative Genius Badge",
      difficulty: "medium",
      emoji: "🎨",
      color: "#EC4899",
      category: "creative",
      startDate: "Jan 18"
    },
    {
      id: 5,
      title: "Productivity Sprint",
      description: "Complete 50 productive hours",
      participants: 178,
      timeLeft: "1 week",
      reward: "Productivity Master Badge",
      difficulty: "medium",
      emoji: "⚡",
      color: "#F59E0B",
      category: "productivity",
      startDate: "Jan 22"
    }
  ])

  const filteredChallenges = allChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const ChallengeCard = ({ challenge }) => (
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
            backgroundColor: challenge.difficulty === 'hard' ? '#EF444420' : 
                             challenge.difficulty === 'medium' ? '#F59E0B20' : '#10B98120'
          }
        ]}>
          <Text style={[
            tw`text-xs font-bold capitalize`,
            { 
              color: challenge.difficulty === 'hard' ? '#EF4444' : 
                     challenge.difficulty === 'medium' ? '#F59E0B' : '#10B981'
            }
          ]}>
            {challenge.difficulty}
          </Text>
        </View>
      </View>
      
      <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-700`}>
        <View>
          <Text style={tw`text-gray-400 text-sm`}>👥 {challenge.participants} joined</Text>
          <Text style={tw`text-gray-400 text-sm`}>📅 Starts {challenge.startDate}</Text>
        </View>
        
        <View style={tw`items-end`}>
          <Text style={[tw`text-sm font-semibold`, { color: challenge.color }]}>
            🏆 {challenge.reward}
          </Text>
          <Text style={tw`text-gray-400 text-xs mt-1`}>⏰ {challenge.timeLeft}</Text>
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
          <Text style={tw`text-white text-2xl font-bold flex-1`}>Browse Challenges</Text>
        </View>

        {/* Search Bar */}
        <View style={[
          tw`bg-gray-800 rounded-xl flex-row items-center px-4 py-3 mb-4`,
          { backgroundColor: '#374151' }
        ]}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={tw`mr-3`} />
          <TextInput
            style={tw`flex-1 text-white text-base`}
            placeholder="Search challenges..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-white font-bold mb-3`}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row`}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    tw`mr-3 px-4 py-2 rounded-xl flex-row items-center`,
                    {
                      backgroundColor: selectedCategory === category.id ? `${category.color}20` : '#374151',
                      borderWidth: selectedCategory === category.id ? 1 : 0,
                      borderColor: selectedCategory === category.id ? category.color : 'transparent'
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={tw`mr-2`}>{category.emoji}</Text>
                  <Text style={[
                    tw`font-semibold`,
                    { color: selectedCategory === category.id ? category.color : '#9CA3AF' }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-white font-bold mb-3`}>Difficulty</Text>
          <View style={tw`flex-row`}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  tw`mr-3 px-4 py-2 rounded-xl`,
                  {
                    backgroundColor: selectedDifficulty === difficulty ? '#8B5CF620' : '#374151',
                    borderWidth: selectedDifficulty === difficulty ? 1 : 0,
                    borderColor: selectedDifficulty === difficulty ? '#8B5CF6' : 'transparent'
                  }
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[
                  tw`font-semibold capitalize`,
                  { color: selectedDifficulty === difficulty ? '#8B5CF6' : '#9CA3AF' }
                ]}>
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-lg font-bold`}>
              Results ({filteredChallenges.length})
            </Text>
            <TouchableOpacity style={tw`flex-row items-center`}>
              <Text style={tw`text-gray-400 mr-1`}>Sort by</Text>
              <Ionicons name="funnel-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
          
          {filteredChallenges.length === 0 && (
            <View style={tw`items-center py-12`}>
              <Ionicons name="search-outline" size={64} color="#6B7280" />
              <Text style={tw`text-gray-400 text-lg mt-4`}>No challenges found</Text>
              <Text style={tw`text-gray-500 text-center mt-2`}>
                Try adjusting your search filters
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}