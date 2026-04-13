"use client"

import React, { useState, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { challengesAPI } from "../../../lib/api"

type Challenge = {
  id: number
  title: string
  description: string
  participant_count?: number
  end_date?: string
  start_date?: string
  reward?: string
  difficulty?: string
  emoji?: string
  color?: string
  goal_type?: string
  mode?: "competitive" | "cooperative" | string
}

const categories = [
  { id: "all", name: "All", emoji: "🌟", color: "#8B5CF6" },
  { id: "fitness", name: "Fitness", emoji: "💪", color: "#EF4444" },
  { id: "study", name: "Study", emoji: "📚", color: "#3B82F6" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧘", color: "#8B5CF6" },
  { id: "productivity", name: "Productivity", emoji: "⚡", color: "#F59E0B" },
  { id: "creative", name: "Creative", emoji: "🎨", color: "#EC4899" },
]

const difficulties = ["all", "easy", "medium", "hard"]

const inferCategory = (challenge: Challenge): string => {
  const text = `${challenge.title || ""} ${challenge.description || ""}`.toLowerCase()

  if (text.includes("fit") || text.includes("workout") || text.includes("exercise")) {
    return "fitness"
  }

  if (text.includes("study") || text.includes("read") || text.includes("learn")) {
    return "study"
  }

  if (text.includes("meditat") || text.includes("mindful") || text.includes("calm")) {
    return "mindfulness"
  }

  if (text.includes("draw") || text.includes("paint") || text.includes("creative") || text.includes("design")) {
    return "creative"
  }

  if (text.includes("focus") || text.includes("task") || text.includes("productiv") || challenge.goal_type === "count") {
    return "productivity"
  }

  return "all"
}

const formatShortDate = (dateString?: string): string => {
  if (!dateString) {
    return "TBD"
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return "TBD"
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

const getTimeLabel = (challenge: Challenge): string => {
  const now = new Date()
  const startDate = challenge.start_date ? new Date(challenge.start_date) : null
  const endDate = challenge.end_date ? new Date(challenge.end_date) : null

  if (startDate && startDate > now) {
    const daysToStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysToStart <= 1) {
      return "Starts tomorrow"
    }
    return `Starts in ${daysToStart} days`
  }

  if (endDate) {
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) {
      return "Ended"
    }
    if (daysLeft === 0) {
      return "Ends today"
    }
    return `${daysLeft} days left`
  }

  return "Active"
}

export default function BrowseChallenges() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true)
        const response = await challengesAPI.getActiveChallenges()
        setAllChallenges(response.challenges || [])
      } catch (error) {
        console.error("Failed to load challenges:", error)
        Alert.alert("Error", "Could not load challenges right now.")
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const filteredChallenges = useMemo(() => {
    return allChallenges.filter((challenge) => {
      const normalizedDifficulty = String(challenge.difficulty || "").toLowerCase()
      const category = inferCategory(challenge)
      const searchText = `${challenge.title || ""} ${challenge.description || ""}`.toLowerCase()

      const matchesSearch = searchText.includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || normalizedDifficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [allChallenges, searchQuery, selectedCategory, selectedDifficulty])

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const difficulty = String(challenge.difficulty || "Medium").toLowerCase()
    const color = challenge.color || "#8B5CF6"
    const participantCount = challenge.participant_count || 0
    const mode = `${challenge.mode || "competitive"}`.toLowerCase()

    return (
      <TouchableOpacity
        style={[
          tw`rounded-2xl p-4 mb-3`,
          { backgroundColor: colors.card },
        ]}
        onPress={() => router.push(`/more/social/challenge/${challenge.id}`)}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View
            style={[
              tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
              { backgroundColor: `${color}20` },
            ]}
          >
            <Text style={tw`text-xl`}>{challenge.emoji || "🏆"}</Text>
          </View>

          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={[tw`font-bold text-base mr-2`, { color: colors.text }]}>{challenge.title}</Text>
              {mode === "cooperative" && (
                <View style={[tw`px-2 py-1 rounded`, { backgroundColor: `${colors.success}20` }]}>
                  <Text style={[tw`text-xs font-bold`, { color: colors.success }]}>CO-OP</Text>
                </View>
              )}
            </View>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{challenge.description}</Text>
          </View>

          <View
            style={[
              tw`px-2 py-1 rounded`,
              {
                backgroundColor:
                  difficulty === "hard"
                    ? "#EF444420"
                    : difficulty === "medium"
                      ? "#F59E0B20"
                      : "#10B98120",
              },
            ]}
          >
            <Text
              style={[
                tw`text-xs font-bold capitalize`,
                {
                  color:
                    difficulty === "hard"
                      ? "#EF4444"
                      : difficulty === "medium"
                        ? "#F59E0B"
                        : "#10B981",
                },
              ]}
            >
              {difficulty}
            </Text>
          </View>
        </View>

        <View style={[tw`flex-row justify-between items-center pt-3 border-t`, { borderColor: colors.cardSecondary }]}> 
          <View>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>👥 {participantCount} joined</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>📅 Starts {formatShortDate(challenge.start_date)}</Text>
          </View>

          <View style={tw`items-end`}>
            <Text style={[tw`text-sm font-semibold`, { color }]}>🏆 {challenge.reward || "Challenge reward"}</Text>
            <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>⏰ {getTimeLabel(challenge)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Browse Challenges</Text>
        </View>

        <View
          style={[
            tw`rounded-xl flex-row items-center px-4 py-3 mb-4`,
            { backgroundColor: colors.cardSecondary },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} style={tw`mr-3`} />
          <TextInput
            style={[tw`flex-1 text-base`, { color: colors.text }]}
            placeholder="Search challenges..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={tw`mb-4`}>
          <Text style={[tw`font-bold mb-3`, { color: colors.text }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row`}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    tw`mr-3 px-4 py-2 rounded-xl flex-row items-center`,
                    {
                      backgroundColor: selectedCategory === category.id ? `${category.color}20` : colors.cardSecondary,
                      borderWidth: selectedCategory === category.id ? 1 : 0,
                      borderColor: selectedCategory === category.id ? category.color : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={tw`mr-2`}>{category.emoji}</Text>
                  <Text
                    style={[
                      tw`font-semibold`,
                      { color: selectedCategory === category.id ? category.color : colors.textSecondary },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={tw`mb-4`}>
          <Text style={[tw`font-bold mb-3`, { color: colors.text }]}>Difficulty</Text>
          <View style={tw`flex-row`}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  tw`mr-3 px-4 py-2 rounded-xl`,
                  {
                    backgroundColor: selectedDifficulty === difficulty ? `${colors.accent}20` : colors.cardSecondary,
                    borderWidth: selectedDifficulty === difficulty ? 1 : 0,
                    borderColor: selectedDifficulty === difficulty ? colors.accent : "transparent",
                  },
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text
                  style={[
                    tw`font-semibold capitalize`,
                    { color: selectedDifficulty === difficulty ? colors.accent : colors.textSecondary },
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Results ({filteredChallenges.length})</Text>
            {loading && <ActivityIndicator size="small" color={colors.accent} />}
          </View>

          {!loading && filteredChallenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}

          {!loading && filteredChallenges.length === 0 && (
            <View style={tw`items-center py-12`}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No challenges found</Text>
              <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>Try adjusting your search filters</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
