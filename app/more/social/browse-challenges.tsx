"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Alert, ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import { challengesAPI } from "../../../lib/api"
import ChallengeCard from "../../../components/social/ChallengeCard"
import { Chip, EmptyState, LoadingState, Screen, SearchField, Section } from "../../../components/ui"

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
  { id: "all", name: "All", emoji: "🌟" },
  { id: "fitness", name: "Fitness", emoji: "💪" },
  { id: "study", name: "Study", emoji: "📚" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧘" },
  { id: "productivity", name: "Productivity", emoji: "⚡" },
  { id: "creative", name: "Creative", emoji: "🎨" },
]

const difficulties = ["all", "easy", "medium", "hard"]

// Challenges have no category field yet, so guess one from the title/description.
const inferCategory = (challenge: Challenge): string => {
  const text = `${challenge.title || ""} ${challenge.description || ""}`.toLowerCase()
  if (text.includes("fit") || text.includes("workout") || text.includes("exercise")) return "fitness"
  if (text.includes("study") || text.includes("read") || text.includes("learn")) return "study"
  if (text.includes("meditat") || text.includes("mindful") || text.includes("calm")) return "mindfulness"
  if (text.includes("draw") || text.includes("paint") || text.includes("creative") || text.includes("design")) return "creative"
  if (text.includes("focus") || text.includes("task") || text.includes("productiv") || challenge.goal_type === "count") return "productivity"
  return "all"
}

export default function BrowseChallenges() {
  const router = useRouter()
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
        Alert.alert("Couldn't load challenges", "Please try again in a moment.")
      } finally {
        setLoading(false)
      }
    }
    loadChallenges()
  }, [])

  const filteredChallenges = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return allChallenges.filter((challenge) => {
      const difficulty = String(challenge.difficulty || "").toLowerCase()
      const searchText = `${challenge.title || ""} ${challenge.description || ""}`.toLowerCase()
      return (
        searchText.includes(query) &&
        (selectedCategory === "all" || inferCategory(challenge) === selectedCategory) &&
        (selectedDifficulty === "all" || difficulty === selectedDifficulty)
      )
    })
  }, [allChallenges, searchQuery, selectedCategory, selectedDifficulty])

  return (
    <Screen title="Browse challenges" subtitle={loading ? undefined : `${filteredChallenges.length} of ${allChallenges.length} challenges`}>
      <SearchField value={searchQuery} onChangeText={setSearchQuery} placeholder="Search challenges" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            leading={category.emoji}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {difficulties.map((difficulty) => (
          <Chip
            key={difficulty}
            label={difficulty === "all" ? "Any level" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            selected={selectedDifficulty === difficulty}
            onPress={() => setSelectedDifficulty(difficulty)}
          />
        ))}
      </View>

      {loading ? (
        <LoadingState />
      ) : filteredChallenges.length === 0 ? (
        <EmptyState icon="search-outline" title="No challenges found" message="Try a different search or filter." />
      ) : (
        <Section title="Results">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              type="available"
              onPress={() => router.push(`/more/social/challenge/${challenge.id}`)}
            />
          ))}
        </Section>
      )}
    </Screen>
  )
}
