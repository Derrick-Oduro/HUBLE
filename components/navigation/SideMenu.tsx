import React, { useEffect, useRef, useState } from "react"
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, type Href } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import { useStats } from "../../contexts/StatsProvider"
import { useMenu } from "../../contexts/MenuContext"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

interface MenuRow {
  label: string
  icon: IconName
  href: Href
}

const MENU_GROUPS: { title: string; rows: MenuRow[] }[] = [
  {
    title: "Progress",
    rows: [
      { label: "Stats", icon: "stats-chart-outline", href: "/more/stats" },
      { label: "Achievements", icon: "trophy-outline", href: "/more/achievements" },
      { label: "Analytics", icon: "analytics-outline", href: "/more/analytics" },
    ],
  },
  {
    title: "Social",
    rows: [
      { label: "Social hub", icon: "people-outline", href: "/more/social" },
      { label: "Friends", icon: "person-add-outline", href: "/more/social/friends" },
      { label: "Parties", icon: "star-outline", href: "/more/social/parties" },
      { label: "Challenges", icon: "flag-outline", href: "/more/social/challenges" },
      { label: "Group badges", icon: "ribbon-outline", href: "/more/social/group-badges" },
    ],
  },
  {
    title: "Compete",
    rows: [{ label: "Leaderboards", icon: "podium-outline", href: "/more/leaderboards" }],
  },
  {
    title: "Customize",
    rows: [
      { label: "Avatar", icon: "happy-outline", href: "/more/avatar" },
      { label: "Themes", icon: "color-palette-outline", href: "/more/themes" },
    ],
  },
  {
    title: "Support",
    rows: [{ label: "Help & support", icon: "help-circle-outline", href: "/more/help" }],
  },
]

export default function SideMenu() {
  const { isOpen, closeMenu, unreadCount } = useMenu()
  const { colors } = useTheme()
  const { stats } = useStats()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const panelWidth = Math.min(320, Math.round(width * 0.84))

  const progress = useRef(new Animated.Value(0)).current
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<{ avatar: string; color: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()

      AsyncStorage.multiGet(["userData", "avatarData"])
        .then(([[, userData], [, avatarData]]) => {
          if (userData) setUsername(JSON.parse(userData)?.username ?? null)
          if (avatarData) {
            const parsed = JSON.parse(avatarData)
            setAvatar({ avatar: parsed.avatar || "🧙‍♂️", color: parsed.color || colors.accent })
          }
        })
        .catch(() => {})
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [isOpen])

  // Android back button closes the menu first.
  useEffect(() => {
    if (!isOpen) return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeMenu()
      return true
    })
    return () => sub.remove()
  }, [isOpen, closeMenu])

  if (!mounted) return null

  const go = (href: Href) => {
    closeMenu()
    router.push(href)
  }

  const handleLogout = async () => {
    closeMenu()
    try {
      await AsyncStorage.multiRemove(["userToken", "userData", "isLoggedIn", "isGuest"])
    } finally {
      router.replace("/(auth)/login")
    }
  }

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-panelWidth, 0] })
  const backdropOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  const healthPct = Math.min(100, Math.round(((stats.health || 0) / (stats.maxHealth || 1)) * 100))
  const xpPct = Math.min(100, Math.round(((stats.experience || 0) / (stats.maxExperience || 1)) * 100))

  return (
    <View style={tw`absolute inset-0`} pointerEvents="box-none">
      <Animated.View style={[tw`absolute inset-0`, { backgroundColor: "rgba(0,0,0,0.6)", opacity: backdropOpacity }]}>
        <Pressable style={tw`flex-1`} onPress={closeMenu} accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: panelWidth,
            backgroundColor: colors.card,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={tw`px-3.5 pb-4`} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <TouchableOpacity
            onPress={() => go("/more/avatar")}
            style={[tw`rounded-2xl p-3`, { backgroundColor: colors.background }]}
            accessibilityLabel="Open profile"
          >
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                  { backgroundColor: (avatar?.color || colors.accent) + "30" },
                ]}
              >
                <Text style={tw`text-2xl`}>{avatar?.avatar || "🧙‍♂️"}</Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`font-bold text-base`, { color: colors.text }]} numberOfLines={1}>
                  {username || "Hero"}
                </Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Level {stats.level} · View profile</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="logo-bitcoin" size={14} color={colors.warning} />
                <Text style={[tw`text-sm font-bold ml-1`, { color: colors.warning }]}>{stats.coinsEarned}</Text>
              </View>
            </View>
            <View style={tw`flex-row mt-3`}>
              <View style={[tw`flex-1 h-1.5 rounded-full mr-2`, { backgroundColor: colors.cardSecondary }]}>
                <View style={[tw`h-1.5 rounded-full`, { width: `${healthPct}%`, backgroundColor: colors.success }]} />
              </View>
              <View style={[tw`flex-1 h-1.5 rounded-full`, { backgroundColor: colors.cardSecondary }]}>
                <View style={[tw`h-1.5 rounded-full`, { width: `${xpPct}%`, backgroundColor: colors.accent }]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Inbox */}
          <TouchableOpacity
            onPress={() => go("/inbox")}
            style={[tw`mt-3 h-12 px-3 rounded-xl flex-row items-center`, { backgroundColor: colors.accent + "26" }]}
          >
            <Ionicons name="mail-outline" size={20} color={colors.accent} />
            <Text style={[tw`flex-1 ml-3 font-bold text-base`, { color: colors.text }]}>Inbox</Text>
            {unreadCount > 0 && (
              <View style={[tw`min-w-6 h-6 px-2 rounded-full items-center justify-center`, { backgroundColor: colors.accent }]}>
                <Text style={tw`text-xs font-bold text-white`}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Groups */}
          {MENU_GROUPS.map((group) => (
            <View key={group.title} style={tw`mt-2`}>
              <Text
                style={[tw`px-3 pt-3 pb-1 text-xs font-bold uppercase`, { color: colors.textSecondary, letterSpacing: 0.8 }]}
              >
                {group.title}
              </Text>
              {group.rows.map((row) => (
                <TouchableOpacity
                  key={row.label}
                  onPress={() => go(row.href)}
                  style={tw`h-11 px-3 rounded-lg flex-row items-center`}
                >
                  <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
                  <Text style={[tw`ml-3 text-base`, { color: colors.text }]}>{row.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Settings + logout */}
        <View style={tw`flex-row px-3.5 pt-2`}>
          <TouchableOpacity
            onPress={() => go("/more/settings")}
            style={[tw`flex-1 h-12 rounded-xl flex-row items-center justify-center mr-2`, { backgroundColor: colors.cardSecondary }]}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
            <Text style={[tw`ml-2 font-bold text-base`, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            accessibilityLabel="Log out"
            style={[tw`w-12 h-12 rounded-xl items-center justify-center`, { borderWidth: 1, borderColor: colors.cardSecondary }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}
