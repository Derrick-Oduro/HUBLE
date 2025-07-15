import { Stack } from "expo-router"
import React from "react"

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111827" }, // bg-gray-900
        animation: "slide_from_right", // Better animation for auth flow
        gestureEnabled: false, // Prevent swiping back during auth
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          animation: "fade", // Smooth entry
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          animation: "slide_from_right", // Slide in from right
        }}
      />
    </Stack>
  )
}
