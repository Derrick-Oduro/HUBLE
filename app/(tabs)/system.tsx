import React from "react"
import { Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"

// System tab: room maps with nested spaces and pinned items.
// The map editor is the next build step; this holds its place in the tab bar.
export default function SystemTab() {
  const { colors } = useTheme()

  const steps: { icon: React.ComponentProps<typeof Ionicons>["name"]; text: string }[] = [
    { icon: "home-outline", text: "Create a space, like your bedroom" },
    { icon: "shapes-outline", text: "Add shapes for furniture and arrange them like the real room" },
    { icon: "pin-outline", text: "Tap a shape to pin items and tasks to it" },
    { icon: "git-branch-outline", text: "Nest spaces inside it: Desk › Top drawer" },
  ]

  return (
    <View style={[tw`flex-1 px-4 pt-4`, { backgroundColor: colors.background }]}>
      <View style={[tw`rounded-2xl p-5`, { backgroundColor: colors.card }]}>
        <View style={[tw`w-12 h-12 rounded-xl items-center justify-center mb-4`, { backgroundColor: colors.accent + "26" }]}>
          <Ionicons name="grid-outline" size={24} color={colors.accent} />
        </View>
        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Map your spaces</Text>
        <Text style={[tw`text-sm mt-1 mb-4`, { color: colors.textSecondary }]}>
          System is coming in the next update. Here's how it will work:
        </Text>
        {steps.map((step) => (
          <View key={step.text} style={tw`flex-row items-center py-2`}>
            <Ionicons name={step.icon} size={20} color={colors.textSecondary} />
            <Text style={[tw`flex-1 ml-3 text-sm`, { color: colors.text }]}>{step.text}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
