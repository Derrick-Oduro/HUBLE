"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import React from "react"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tw`bg-gray-800 border-t border-gray-700`,
        tabBarLabelStyle: tw`text-xs`,
        tabBarActiveTintColor: "#8B5CF6", // Violet color for active tab
        tabBarInactiveTintColor: "#9CA3AF", // Gray color for inactive tabs
      }}
    >
      {/* 🏠 Habits (Landing Page) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle-outline" size={size} color={color} />,
        }}
      />

      {/* ✅ Dailies (To-Do List) */}
      <Tabs.Screen
        name="dailies"
        options={{
          title: "Dailies",
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />

      {/* ⏳ Routines (Morning, Afternoon, Evening) */}
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color, size }) => <Ionicons name="repeat-outline" size={size} color={color} />,
        }}
      />

      {/* ⏱ Timer (For Learning & Breaks) */}
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />

      {/* ⚙️ More (Includes Settings, Stats & Profile) */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
