import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import { useMenu } from "../../contexts/MenuContext"

// Shared header for every main tab: ☰ side menu, title, inbox shortcut.
export default function AppHeader({ title }: { title: string }) {
  const { colors } = useTheme()
  const { openMenu, unreadCount } = useMenu()
  const router = useRouter()

  return (
    <View style={[tw`flex-row items-center px-3 pt-2 pb-2`, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={openMenu}
        accessibilityLabel={unreadCount > 0 ? `Open menu, ${unreadCount} unread` : "Open menu"}
        style={[tw`w-11 h-11 rounded-xl items-center justify-center`, { backgroundColor: colors.card }]}
      >
        <Ionicons name="menu" size={22} color={colors.text} />
        {unreadCount > 0 && (
          <View
            style={[
              tw`absolute top-2 right-2 w-2.5 h-2.5 rounded-full`,
              { backgroundColor: colors.warning, borderWidth: 1.5, borderColor: colors.card },
            ]}
          />
        )}
      </TouchableOpacity>

      <Text style={[tw`flex-1 ml-3 text-xl font-bold`, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/inbox")}
        accessibilityLabel="Inbox"
        style={[tw`w-11 h-11 rounded-xl items-center justify-center`, { backgroundColor: colors.card }]}
      >
        <Ionicons name="mail-outline" size={20} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[tw`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full items-center justify-center`, { backgroundColor: colors.accent }]}>
            <Text style={tw`text-xs font-bold text-white`}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}
