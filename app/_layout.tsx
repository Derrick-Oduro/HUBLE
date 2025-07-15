"use client"
import { Stack } from "expo-router"
import { StatsProvider } from "../contexts/StatsProvider"
import { ThemeProvider } from "../contexts/ThemeProvider"
import React from "react"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="more" />
          <Stack.Screen name="dailies" />
          <Stack.Screen name="routines" />
          <Stack.Screen name="timer" />
        </Stack>
      </StatsProvider>
    </ThemeProvider>
  )
}
