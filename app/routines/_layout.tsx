import { Stack } from "expo-router"

export default function RoutinesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="routine-detail"
        options={{
          presentation: "modal",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  )
}

