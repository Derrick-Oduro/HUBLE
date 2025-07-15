"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

export default function TabsLayout() {
  const { colors, currentTheme } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          {
            backgroundColor: colors.card,
            borderTopColor: colors.cardSecondary,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }
        ],
        tabBarLabelStyle: tw`text-xs font-medium`,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: tw`rounded-lg mx-1`,
      }}
    >
      {/* 🏠 Habits (Main Landing) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* ✅ Dailies (Dynamic XP To-Do) */}
      <Tabs.Screen
        name="dailies"
        options={{
          title: "Dailies",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* ⏳ Routines (Morning/Evening) */}
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "repeat" : "repeat-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* ⏱ Timer (Learning Support) */}
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "time" : "time-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* ⚙️ More (Stats, Social, Settings) */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  )
}
