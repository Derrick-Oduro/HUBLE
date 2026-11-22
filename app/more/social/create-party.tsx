"use client"

import React, { useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { partiesAPI } from "../../../lib/api"
import { useTheme } from "../../../contexts/ThemeProvider"
import { Button, Card, Divider, Screen, Section, Stepper, TextField, ToggleRow, tint } from "../../../components/ui"

const EMOJIS = ["🤝", "🔥", "📚", "💪", "🧘", "🚀", "🎯", "🌱"]

export default function CreateParty() {
  const router = useRouter()
  const { colors } = useTheme()

  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [partyName, setPartyName] = useState("")
  const [description, setDescription] = useState("")
  const [weeklyGoalLabel, setWeeklyGoalLabel] = useState("Complete check-ins together")
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(10)
  const [maxMembers, setMaxMembers] = useState(6)
  const [isPrivate, setIsPrivate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = partyName.trim().length > 0 && weeklyGoalLabel.trim().length > 0

  const handleCreateParty = async () => {
    const name = partyName.trim()
    const goal = weeklyGoalLabel.trim()
    if (!name || !goal) {
      Alert.alert("Missing information", "Give your party a name and a weekly goal.")
      return
    }
    try {
      setSubmitting(true)
      await partiesAPI.createParty({
        name,
        description: description.trim() || undefined,
        goal,
        weeklyGoalLabel: goal,
        weeklyGoalTarget,
        privacy: isPrivate ? "private" : "public",
        maxMembers,
        type: "cooperative",
        emoji,
        color: colors.accent,
      })
      Alert.alert("Party created", `"${name}" is live. Invite friends and start working toward your goal.`, [
        { text: "Open parties", onPress: () => router.replace("/more/social/parties") },
      ])
    } catch (error) {
      console.error("Failed to create party:", error)
      Alert.alert("Couldn't create party", error instanceof Error ? error.message : "Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen title="Create party" subtitle="A small team with a shared weekly goal" keyboardShouldPersistTaps="handled">
      <Section title="Basics">
        <Card style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Icon</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {EMOJIS.map((option) => {
                const selected = option === emoji
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setEmoji(option)}
                    accessibilityLabel={`Icon ${option}`}
                    accessibilityState={{ selected }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? tint(colors.accent, 0.16) : colors.background,
                      borderWidth: 1,
                      borderColor: selected ? colors.accent : tint(colors.cardSecondary, 0.9),
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{option}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
          <TextField label="Party name" value={partyName} onChangeText={setPartyName} placeholder="Morning Crew" maxLength={36} />
          <TextField
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="A small team that checks in daily and builds momentum."
            multiline
            maxLength={180}
          />
        </Card>
      </Section>

      <Section title="Weekly goal">
        <Card style={{ gap: 16 }}>
          <TextField label="Goal" value={weeklyGoalLabel} onChangeText={setWeeklyGoalLabel} placeholder="Complete check-ins together" maxLength={80} />
          <Stepper label="Target" value={weeklyGoalTarget} onChange={setWeeklyGoalTarget} min={1} max={100} suffix="pts" />
          <Text style={{ fontSize: 12, lineHeight: 17, color: colors.textSecondary }}>
            Members earn points during the week. The party's progress bar fills toward this target.
          </Text>
        </Card>
      </Section>

      <Section title="Settings">
        <Card style={{ gap: 14 }}>
          <Stepper label="Max members" value={maxMembers} onChange={setMaxMembers} min={2} max={20} />
          <Divider />
          <ToggleRow label="Private party" description="Invite only. Public parties can be discovered by others." value={isPrivate} onChange={setIsPrivate} />
        </Card>
      </Section>

      <Button label="Create party" icon="checkmark" onPress={handleCreateParty} loading={submitting} disabled={!canSubmit} />
    </Screen>
  )
}
