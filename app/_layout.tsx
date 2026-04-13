"use client"
import { Stack } from "expo-router"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { StatsProvider } from "../contexts/StatsProvider"
import { ThemeProvider, useTheme } from "../contexts/ThemeProvider"
import React, { useEffect } from "react"
import { bootstrapNotificationSchedules } from "../lib/notificationService"

function RootNavigator() {
  const { colors } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="more" />
        <Stack.Screen name="dailies" />
        <Stack.Screen name="routines" />
        <Stack.Screen name="timer" />
      </Stack>
    </SafeAreaView>
  )
}

export default function RootLayout() {
  useEffect(() => {
    bootstrapNotificationSchedules().catch((error) => {
      console.error("Failed to bootstrap notifications:", error)
    })
  }, [])

  return (
    <ThemeProvider>
      <StatsProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </StatsProvider>
    </ThemeProvider>
  )
}
