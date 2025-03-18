import { Stack } from "expo-router"

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
      <Stack.Screen name="equipment" />
      <Stack.Screen name="market" />
      <Stack.Screen name="quests" />
      <Stack.Screen name="themes" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="backup" />
      <Stack.Screen name="security" />
      <Stack.Screen name="help" />
      <Stack.Screen name="news" />
      <Stack.Screen name="feedback" />
    </Stack>
  )
}

