import { Stack } from "expo-router"
import React from "react"

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen name="stats" />
      <Stack.Screen name="achievements" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="themes" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
    </Stack>
  )
}
