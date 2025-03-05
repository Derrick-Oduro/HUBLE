import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import tw from "../lib/tailwind";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tw`bg-white border-t border-gray-200`,
        tabBarLabelStyle: tw`text-xs`,
      }}
    >
      {/* 🏠 Habits (Landing Page) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Dailies (To-Do List) */}
      <Tabs.Screen
        name="dailies"
        options={{
          title: "Dailies",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ⏳ Routines (Morning, Afternoon, Evening) */}
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="repeat-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ⏱ Timer (For Learning & Breaks) */}
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ⚙️ More (Includes Settings, Stats & Profile) */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
