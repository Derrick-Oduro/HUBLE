"use client"

import React, { useState } from "react"
import { Linking, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeProvider"
import { Card, Divider, ListRow, Screen, Section } from "../../components/ui"

// Where "Email support" sends people. Change this to your real support inbox.
const SUPPORT_EMAIL = "support@huble.app"

const FAQ = [
  {
    question: "How do I earn XP and level up?",
    answer: "Complete habits, dailies, routines and focus sessions. Harder tasks and longer focus sessions earn more XP.",
  },
  {
    question: "What happens when I lose health?",
    answer: "Missing or failing tasks costs health. Completing tasks consistently and keeping streaks helps you recover.",
  },
  {
    question: "Where are Social, Stats and Settings?",
    answer: "Tap ☰ at the top-left of any tab. The side menu has your inbox, progress, social, leaderboards, avatar, themes and settings.",
  },
  {
    question: "How do I link a focus session to a task?",
    answer: "Tap the timer button on a habit or daily, or use Link Task in the Focus tab. Focused minutes show on the task, and you can mark it done when the session ends.",
  },
  {
    question: "How do I unlock new themes and avatars?",
    answer: "Level up and complete achievements. Locked items show the level or goal needed to unlock them.",
  },
  {
    question: "Can I back up my data?",
    answer: "Turn on Settings › Data › Auto backup, or export a copy any time from Settings › Privacy & security › Export data.",
  },
]

export default function Help() {
  const { colors } = useTheme()
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <Screen title="Help & support">
      <Section title="Frequently asked">
        <Card padded={false}>
          {FAQ.map((item, i) => {
            const open = expanded === i
            return (
              <View key={item.question}>
                {i > 0 && <Divider inset={14} />}
                <TouchableOpacity
                  onPress={() => setExpanded(open ? null : i)}
                  accessibilityState={{ expanded: open }}
                  style={{ paddingHorizontal: 14, paddingVertical: 14, gap: 8 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.text }}>{item.question}</Text>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
                  </View>
                  {open && <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textSecondary }}>{item.answer}</Text>}
                </TouchableOpacity>
              </View>
            )
          })}
        </Card>
      </Section>

      <Section title="Contact">
        <Card padded={false}>
          <ListRow
            icon="mail-outline"
            iconColor={colors.accent}
            title="Email support"
            subtitle={SUPPORT_EMAIL}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            chevron
          />
        </Card>
      </Section>

      <Section title="Tips">
        <Card style={{ gap: 14 }}>
          {[
            { icon: "trending-up-outline" as const, color: colors.success, text: "Start small. Two or three habits you keep beat ten you drop." },
            { icon: "timer-outline" as const, color: colors.accent, text: "Link focus sessions to tasks to see where your time actually goes." },
            { icon: "flame-outline" as const, color: colors.warning, text: "Protect your streak: even a short session counts on busy days." },
          ].map((tip) => (
            <View key={tip.text} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <Ionicons name={tip.icon} size={18} color={tip.color} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.text }}>{tip.text}</Text>
            </View>
          ))}
        </Card>
      </Section>
    </Screen>
  )
}
