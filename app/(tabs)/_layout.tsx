"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import AppHeader from "../../components/navigation/AppHeader"
import React from "react"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

// Daily-use features live in the tab bar; everything else (progress, social,
// inbox, leaderboards, avatar, themes, settings) lives in the ☰ side menu.
const TABS: { name: string; title: string; icon: IconName; iconFocused: IconName }[] = [
  { name: "index", title: "Habits", icon: "checkmark-circle-outline", iconFocused: "checkmark-circle" },
  { name: "dailies", title: "Dailies", icon: "list-outline", iconFocused: "list" },
  { name: "routines", title: "Routines", icon: "repeat-outline", iconFocused: "repeat" },
  { name: "timer", title: "Focus", icon: "time-outline", iconFocused: "time" },
  { name: "system", title: "System", icon: "grid-outline", iconFocused: "grid" },
]

export default function TabsLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <AppHeader title={TABS.find((tab) => tab.name === route.name)?.title ?? ""} />,
        tabBarStyle: [
          {
            backgroundColor: colors.card,
            borderTopColor: colors.cardSecondary,
            borderTopWidth: 1,
            height: 64 + insets.bottom,
            paddingTop: 4,
            paddingBottom: insets.bottom + 4,
            shadowOpacity: 0,
            elevation: 0,
          },
        ],
        tabBarLabelStyle: tw`text-xs font-medium`,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: tw`rounded-lg mx-1`,
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
