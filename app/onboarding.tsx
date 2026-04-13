"use client"

import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"
import { habitsAPI } from "../lib/api"

type GoalId = "focus" | "habits" | "routines"

type StarterHabit = {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  color: string
  targetDays: number[]
}

type GoalOption = {
  id: GoalId
  title: string
  subtitle: string
  icon: keyof typeof Ionicons.glyphMap
  starters: StarterHabit[]
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "focus",
    title: "Build focus",
    subtitle: "Use timer blocks and protect deep work time.",
    icon: "timer-outline",
    starters: [
      {
        id: "focus-1",
        title: "One 25-minute focus block",
        description: "Complete one deep focus session each day.",
        difficulty: "medium",
        color: "#3B82F6",
        targetDays: [1, 2, 3, 4, 5, 6],
      },
      {
        id: "focus-2",
        title: "Zero phone first hour",
        description: "Start your day without phone scrolling.",
        difficulty: "hard",
        color: "#0EA5E9",
        targetDays: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    id: "habits",
    title: "Track habits",
    subtitle: "Build consistency with small daily actions.",
    icon: "checkmark-circle-outline",
    starters: [
      {
        id: "habit-1",
        title: "Drink water after waking",
        description: "Start your day with hydration.",
        difficulty: "easy",
        color: "#10B981",
        targetDays: [1, 2, 3, 4, 5, 6, 0],
      },
      {
        id: "habit-2",
        title: "10-minute daily walk",
        description: "Move your body every day.",
        difficulty: "easy",
        color: "#22C55E",
        targetDays: [1, 2, 3, 4, 5, 6, 0],
      },
    ],
  },
  {
    id: "routines",
    title: "Run routines",
    subtitle: "Anchor your day with repeatable morning and night flows.",
    icon: "repeat-outline",
    starters: [
      {
        id: "routine-1",
        title: "Morning reset checklist",
        description: "Wake up, hydrate, and plan your top priority.",
        difficulty: "medium",
        color: "#F59E0B",
        targetDays: [1, 2, 3, 4, 5, 6, 0],
      },
      {
        id: "routine-2",
        title: "Night shutdown routine",
        description: "Reflect, prep tomorrow, and disconnect.",
        difficulty: "medium",
        color: "#8B5CF6",
        targetDays: [1, 2, 3, 4, 5, 6, 0],
      },
    ],
  },
]

const ONBOARDING_STEPS = 4

const normalizeExistingHabits = (rawValue: string | null): any[] => {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function OnboardingScreen() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()

  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<GoalId>("focus")
  const [selectedStarterId, setSelectedStarterId] = useState<string>(GOAL_OPTIONS[0].starters[0].id)

  const selectedGoal = useMemo(
    () => GOAL_OPTIONS.find((goal) => goal.id === selectedGoalId) || GOAL_OPTIONS[0],
    [selectedGoalId],
  )

  const selectedStarter = useMemo(
    () =>
      selectedGoal.starters.find((starter) => starter.id === selectedStarterId) ||
      selectedGoal.starters[0],
    [selectedGoal, selectedStarterId],
  )

  const selectGoal = (goalId: GoalId) => {
    const goal = GOAL_OPTIONS.find((item) => item.id === goalId)
    if (!goal) return
    setSelectedGoalId(goalId)
    setSelectedStarterId(goal.starters[0].id)
  }

  const ensureStarterHabit = async (starter: StarterHabit) => {
    const token = await AsyncStorage.getItem("userToken")
    const isGuest = await AsyncStorage.getItem("isGuest")

    if (token && isGuest !== "true") {
      try {
        const existing = await habitsAPI.getHabits()
        const alreadyExists = (existing.habits || []).some(
          (habit: any) => `${habit.title || ""}`.trim().toLowerCase() === starter.title.toLowerCase(),
        )

        if (!alreadyExists) {
          await habitsAPI.createHabit(starter)
        }
        return
      } catch (error) {
        console.error("Failed to create starter habit on backend, falling back to local:", error)
      }
    }

    const habitsRaw = await AsyncStorage.getItem("habitsData")
    const existingHabits = normalizeExistingHabits(habitsRaw)
    const alreadyExists = existingHabits.some(
      (habit) => `${habit.title || ""}`.trim().toLowerCase() === starter.title.toLowerCase(),
    )

    if (alreadyExists) return

    const newHabit = {
      id: Date.now(),
      title: starter.title,
      description: starter.description,
      difficulty: starter.difficulty,
      color: starter.color,
      completed: false,
      streak: 0,
      completedDates: [],
      targetDays: starter.targetDays,
    }

    await AsyncStorage.setItem("habitsData", JSON.stringify([...existingHabits, newHabit]))
  }

  const finishOnboarding = async () => {
    try {
      setIsSaving(true)
      await ensureStarterHabit(selectedStarter)
      await AsyncStorage.setItem("onboardingGoal", selectedGoal.id)
      await AsyncStorage.setItem("onboardingComplete", "true")
      router.replace("/(tabs)")
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const canContinue = () => {
    if (step === 0) return !!selectedGoalId
    if (step === 1) return !!selectedStarterId
    return true
  }

  const nextStep = () => {
    if (step >= ONBOARDING_STEPS - 1) {
      finishOnboarding()
      return
    }

    if (canContinue()) {
      setStep((prev) => prev + 1)
    }
  }

  const previousStep = () => {
    if (step === 0) return
    setStep((prev) => prev - 1)
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={currentTheme.statusBarStyle} />

      <View style={tw`px-6 pt-4 pb-2`}> 
        <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>Set up HUBLE</Text>
        <Text style={[tw`text-sm mb-4`, { color: colors.textSecondary }]}>Step {step + 1} of {ONBOARDING_STEPS}</Text>
        <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}> 
          <View
            style={[
              tw`h-full rounded-full`,
              {
                backgroundColor: colors.accent,
                width: `${((step + 1) / ONBOARDING_STEPS) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={tw`flex-1 px-6 pt-4`} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View>
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>What are you optimizing for?</Text>
            <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>Pick one focus and we will tailor your starting setup.</Text>

            {GOAL_OPTIONS.map((goal) => {
              const selected = goal.id === selectedGoalId
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    tw`rounded-2xl p-4 mb-3 flex-row items-center`,
                    {
                      backgroundColor: selected ? colors.accent + "20" : colors.card,
                      borderWidth: selected ? 1.5 : 1,
                      borderColor: selected ? colors.accent : colors.cardSecondary,
                    },
                  ]}
                  onPress={() => selectGoal(goal.id)}
                >
                  <View style={[tw`w-12 h-12 rounded-xl items-center justify-center mr-3`, { backgroundColor: colors.cardSecondary }]}> 
                    <Ionicons name={goal.icon} size={22} color={selected ? colors.accent : colors.textSecondary} />
                  </View>
                  <View style={tw`flex-1`}> 
                    <Text style={[tw`font-bold text-base`, { color: colors.text }]}>{goal.title}</Text>
                    <Text style={[tw`text-sm mt-0.5`, { color: colors.textSecondary }]}>{goal.subtitle}</Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>Choose a starter habit</Text>
            <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>We will pre-create one so you can get your first win fast.</Text>

            {selectedGoal.starters.map((starter) => {
              const selected = starter.id === selectedStarterId
              return (
                <TouchableOpacity
                  key={starter.id}
                  style={[
                    tw`rounded-2xl p-4 mb-3`,
                    {
                      backgroundColor: selected ? colors.accent + "20" : colors.card,
                      borderWidth: selected ? 1.5 : 1,
                      borderColor: selected ? colors.accent : colors.cardSecondary,
                    },
                  ]}
                  onPress={() => setSelectedStarterId(starter.id)}
                >
                  <View style={tw`flex-row justify-between items-center mb-1`}>
                    <Text style={[tw`font-bold text-base`, { color: colors.text }]}>{starter.title}</Text>
                    <Text style={[tw`text-xs font-bold uppercase`, { color: starter.color }]}>{starter.difficulty}</Text>
                  </View>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{starter.description}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>How progression works</Text>
            <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>HUBLE rewards consistency, not intensity.</Text>

            {[
              { icon: "flash-outline", title: "Complete actions", body: "Habits, dailies, routines, and focus sessions grant XP." },
              { icon: "trending-up-outline", title: "Level up", body: "Higher levels unlock additional themes and customization." },
              { icon: "flame-outline", title: "Protect streaks", body: "Consistency builds momentum. Missing days can break streaks." },
            ].map((item) => (
              <View key={item.title} style={[tw`rounded-2xl p-4 mb-3`, { backgroundColor: colors.card }]}> 
                <View style={tw`flex-row items-center mb-2`}>
                  <Ionicons name={item.icon as any} size={18} color={colors.accent} style={tw`mr-2`} />
                  <Text style={[tw`font-bold`, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{item.body}</Text>
              </View>
            ))}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>You are ready</Text>
            <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>We will create your starter setup now:</Text>

            <View style={[tw`rounded-2xl p-5`, { backgroundColor: colors.card }]}> 
              <Text style={[tw`text-sm mb-1`, { color: colors.textSecondary }]}>Goal</Text>
              <Text style={[tw`font-bold text-base mb-3`, { color: colors.text }]}>{selectedGoal.title}</Text>

              <Text style={[tw`text-sm mb-1`, { color: colors.textSecondary }]}>Starter habit</Text>
              <Text style={[tw`font-bold text-base`, { color: colors.text }]}>{selectedStarter.title}</Text>
              <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>{selectedStarter.description}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[tw`px-6 py-4 border-t flex-row`, { borderColor: colors.cardSecondary }]}> 
        <TouchableOpacity
          style={[tw`flex-1 py-3 rounded-xl mr-2`, { backgroundColor: colors.cardSecondary }]}
          onPress={previousStep}
          disabled={step === 0 || isSaving}
        >
          <Text style={[tw`text-center font-semibold`, { color: step === 0 ? colors.textSecondary : colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`flex-1 py-3 rounded-xl ml-2`,
            {
              backgroundColor: canContinue() ? colors.accent : colors.cardSecondary,
              opacity: isSaving ? 0.8 : 1,
            },
          ]}
          onPress={nextStep}
          disabled={!canContinue() || isSaving}
        >
          {isSaving ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-semibold`}>Finishing...</Text>
            </View>
          ) : (
            <Text style={[tw`text-center font-semibold`, { color: canContinue() ? "white" : colors.textSecondary }]}>
              {step === ONBOARDING_STEPS - 1 ? "Start" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}