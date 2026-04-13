"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import { partiesAPI } from "../../../lib/api"
import { useTheme } from "../../../contexts/ThemeProvider"

export default function CreateParty() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()

  const [partyName, setPartyName] = useState("")
  const [description, setDescription] = useState("")
  const [weeklyGoalLabel, setWeeklyGoalLabel] = useState("Complete check-ins together")
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(10)
  const [maxMembers, setMaxMembers] = useState(6)
  const [isPrivate, setIsPrivate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const adjustWeeklyGoalTarget = (delta: number) => {
    setWeeklyGoalTarget((prev) => Math.min(100, Math.max(1, prev + delta)))
  }

  const adjustMaxMembers = (delta: number) => {
    setMaxMembers((prev) => Math.min(20, Math.max(2, prev + delta)))
  }

  const handleCreateParty = async () => {
    const trimmedName = partyName.trim()
    const trimmedGoal = weeklyGoalLabel.trim()

    if (!trimmedName || !trimmedGoal) {
      Alert.alert("Missing Information", "Please provide a party name and weekly goal.")
      return
    }

    try {
      setSubmitting(true)
      await partiesAPI.createParty({
        name: trimmedName,
        description: description.trim() || undefined,
        goal: trimmedGoal,
        weeklyGoalLabel: trimmedGoal,
        weeklyGoalTarget,
        privacy: isPrivate ? "private" : "public",
        maxMembers,
        type: "cooperative",
        emoji: "🤝",
        color: colors.accent,
      })

      Alert.alert(
        "Party Created",
        `"${trimmedName}" is live. Start contributing to your weekly team goal.`,
        [{ text: "Open Party", onPress: () => router.replace("/more/social/parties") }],
      )
    } catch (error) {
      console.error("Failed to create party:", error)
      const message = error instanceof Error ? error.message : "Could not create party"
      Alert.alert("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Create Party</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Basic Information</Text>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.textSecondary }]}>Party Name</Text>
              <TextInput
                style={[
                  tw`p-4 rounded-xl text-base`,
                  { backgroundColor: colors.cardSecondary, color: colors.text, borderWidth: 1, borderColor: colors.cardSecondary },
                ]}
                value={partyName}
                onChangeText={setPartyName}
                placeholder="Team Focus Crew"
                placeholderTextColor={colors.textSecondary}
                maxLength={36}
              />
            </View>

            <View>
              <Text style={[tw`font-medium mb-2`, { color: colors.textSecondary }]}>Description (optional)</Text>
              <TextInput
                style={[
                  tw`p-4 rounded-xl text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                    height: 90,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="A small team that checks in daily and builds momentum."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={180}
              />
            </View>
          </View>

          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Weekly Shared Goal</Text>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.textSecondary }]}>Goal Label</Text>
              <TextInput
                style={[
                  tw`p-4 rounded-xl text-base`,
                  { backgroundColor: colors.cardSecondary, color: colors.text, borderWidth: 1, borderColor: colors.cardSecondary },
                ]}
                value={weeklyGoalLabel}
                onChangeText={setWeeklyGoalLabel}
                placeholder="Complete check-ins together"
                placeholderTextColor={colors.textSecondary}
                maxLength={80}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-3`, { color: colors.textSecondary }]}>Weekly Target Points</Text>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity
                  style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => adjustWeeklyGoalTarget(-1)}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>

                <View style={tw`items-center`}>
                  <Text style={[tw`text-3xl font-bold`, { color: colors.accent }]}>{weeklyGoalTarget}</Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>team points this week</Text>
                </View>

                <TouchableOpacity
                  style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => adjustWeeklyGoalTarget(1)}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[tw`rounded-xl p-4`, { backgroundColor: colors.cardSecondary }]}> 
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Each member can contribute points during the week. The party progress bar tracks total team points against this target.</Text>
            </View>
          </View>

          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Party Settings</Text>

            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Max Members</Text>
              <View style={tw`flex-row items-center`}>
                <TouchableOpacity
                  style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => adjustMaxMembers(-1)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[tw`mx-4 min-w-8 text-center font-bold`, { color: colors.text }]}>{maxMembers}</Text>
                <TouchableOpacity
                  style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => adjustMaxMembers(1)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center`}
              onPress={() => setIsPrivate((prev) => !prev)}
            >
              <View style={tw`flex-1 pr-3`}>
                <Text style={[tw`font-medium`, { color: colors.textSecondary }]}>Private Party</Text>
                <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>Invite only. Public parties can be discovered by others.</Text>
              </View>
              <View
                style={[
                  tw`w-12 h-6 rounded-full border-2`,
                  {
                    backgroundColor: isPrivate ? colors.accent : colors.cardSecondary,
                    borderColor: isPrivate ? colors.accent : colors.cardSecondary,
                  },
                ]}
              >
                <View
                  style={[
                    tw`w-4 h-4 rounded-full`,
                    {
                      backgroundColor: "white",
                      marginTop: 2,
                      transform: [{ translateX: isPrivate ? 20 : 4 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              tw`rounded-2xl p-4 mb-4`,
              {
                backgroundColor: colors.accent,
                opacity: submitting ? 0.75 : 1,
              },
            ]}
            onPress={handleCreateParty}
            disabled={submitting}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>
              {submitting ? "Creating Party..." : "Create Weekly Goal Party"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
