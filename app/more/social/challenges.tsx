"use client"

import React, { useState, useEffect } from "react"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import { challengesAPI } from "../../../lib/api"
import ChallengeCard from "../../../components/social/ChallengeCard"
import { Button, EmptyState, LoadingState, Screen, Segmented, RADIUS } from "../../../components/ui"

type Tab = "active" | "available" | "completed"

export default function Challenges() {
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>("active")
  const [activeChallenges, setActiveChallenges] = useState<any[]>([])
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (activeTab === "active" || activeTab === "completed") {
          const data = await challengesAPI.getUserChallenges()
          const challenges = data.challenges || []
          setActiveChallenges(challenges.filter((c: any) => !c.completed))
          setCompletedChallenges(challenges.filter((c: any) => c.completed))
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
    loadData()
  }, [activeTab])

  const list = activeTab === "active" ? activeChallenges : activeTab === "available" ? availableChallenges : completedChallenges

  const empty = {
    active: { icon: "flag-outline" as const, title: "No active challenges", message: "Join a challenge to compete and earn rewards." },
    available: { icon: "search-outline" as const, title: "Nothing to join right now", message: "Check back soon, or browse all challenges." },
    completed: { icon: "medal-outline" as const, title: "No finished challenges yet", message: "Challenges you complete will be listed here." },
  }[activeTab]

  const browseButton = (
    <TouchableOpacity
      onPress={() => router.push("/more/social/browse-challenges")}
      accessibilityLabel="Browse challenges"
      style={{ width: 40, height: 40, borderRadius: RADIUS.inner, alignItems: "center", justifyContent: "center", backgroundColor: colors.card }}
    >
      <Ionicons name="search" size={18} color={colors.text} />
    </TouchableOpacity>
  )

  return (
    <Screen title="Challenges" subtitle={`${activeChallenges.length} active`} right={browseButton}>
      <Segmented<Tab>
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "active", label: "Active" },
          { value: "available", label: "Available" },
          { value: "completed", label: "Completed" },
        ]}
      />

      {loading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          message={empty.message}
          action={activeTab !== "completed" ? <Button label="Browse challenges" small icon="search" onPress={() => router.push("/more/social/browse-challenges")} /> : undefined}
        />
      ) : (
        list.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            type={activeTab}
            onPress={() => router.push(`/more/social/challenge/${challenge.id}`)}
          />
        ))
      )}
    </Screen>
  )
}
