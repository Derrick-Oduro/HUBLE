"use client"
import { Stack } from "expo-router"
import { StatsProvider } from "../contexts/StatsProvider"
import React from "react"

export default function RootLayout() {
  return (
    <StatsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StatsProvider>
  )
}
