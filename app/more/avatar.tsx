"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import { useStats } from "../../contexts/StatsProvider"
import { authAPI, configAPI } from "../../lib/api"
import { Button, Card, Divider, Screen, Section, RADIUS, tint } from "../../components/ui"

const defaultAvatarOptions = [
  { emoji: "🧙‍♂️", name: "Wizard", level: 1 },
  { emoji: "🧙‍♀️", name: "Sorceress", level: 1 },
  { emoji: "👨‍💻", name: "Developer", level: 3 },
  { emoji: "👩‍💻", name: "Coder", level: 3 },
  { emoji: "🦸‍♂️", name: "Hero", level: 5 },
  { emoji: "🦸‍♀️", name: "Heroine", level: 5 },
  { emoji: "🥷", name: "Ninja", level: 10 },
  { emoji: "🤴", name: "Prince", level: 15 },
  { emoji: "👸", name: "Princess", level: 15 },
  { emoji: "🧠", name: "Mastermind", level: 20 },
  { emoji: "⚡", name: "Lightning", level: 25 },
  { emoji: "🔥", name: "Fire Master", level: 30 },
]

const COLOR_OPTIONS = ["#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16", "#F59E0B", "#EF4444", "#EC4899"]

const BORDERS = [
  { id: "normal", name: "Classic", level: 1 },
  { id: "glow", name: "Glow", level: 5 },
  { id: "rainbow", name: "Bold", level: 10 },
  { id: "legendary", name: "Legendary", level: 20 },
]

const ringFor = (border: string, color: string) => {
  switch (border) {
    case "glow":
      return { borderWidth: 3, borderColor: color, shadowColor: color, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }
    case "rainbow":
      return { borderWidth: 4, borderColor: color }
    case "legendary":
      return { borderWidth: 4, borderColor: "#F5B700", shadowColor: "#F5B700", shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
    default:
      return { borderWidth: 2, borderColor: tint(color, 0.6) }
  }
}

export default function Avatar() {
  const router = useRouter()
  const { stats } = useStats()
  const { colors } = useTheme()

  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("🧙‍♂️")
  const [selectedColor, setSelectedColor] = useState("#8B5CF6")
  const [selectedBorder, setSelectedBorder] = useState("normal")
  const [avatarOptions, setAvatarOptions] = useState(defaultAvatarOptions)
  const [saving, setSaving] = useState(false)

  const loadAvatarData = useCallback(async () => {
    try {
      try {
        const [profileResponse, avatarsResponse] = await Promise.all([authAPI.getProfile(), configAPI.getAvatars()])
        if (avatarsResponse?.avatars?.length) {
          setAvatarOptions(avatarsResponse.avatars.map((option: any) => ({ emoji: option.emoji, name: option.name, level: option.unlock_level || 1 })))
        }
        if (profileResponse?.user) {
          setUsername(profileResponse.user.username || "")
          setSelectedAvatar(profileResponse.user.avatar || "🧙‍♂️")
          setSelectedColor(profileResponse.user.avatar_color || "#8B5CF6")
          setSelectedBorder(profileResponse.user.avatar_border || "normal")
        }
      } catch (profileError) {
        console.log("Backend profile load failed, falling back to local avatar data:", profileError)
      }

      const savedData = await AsyncStorage.getItem("avatarData")
      if (savedData) {
        const { username: savedUsername, avatar, color, border } = JSON.parse(savedData)
        if (savedUsername) setUsername(savedUsername)
        setSelectedAvatar(avatar || "🧙‍♂️")
        setSelectedColor(color || "#8B5CF6")
        setSelectedBorder(border || "normal")
      }
    } catch (error) {
      console.log("Error loading avatar data:", error)
    }
  }, [])

  useEffect(() => {
    loadAvatarData()
  }, [loadAvatarData])

  const handleSave = async () => {
    const trimmed = username.trim()
    if (!trimmed) {
      Alert.alert("Username needed", "Enter a username before saving.")
      return
    }
    setSaving(true)
    try {
      await authAPI.updateProfile({ username: trimmed, avatar: selectedAvatar, avatar_color: selectedColor, avatar_border: selectedBorder })
      await AsyncStorage.setItem("avatarData", JSON.stringify({ username: trimmed, avatar: selectedAvatar, color: selectedColor, border: selectedBorder }))
      router.back()
    } catch {
      Alert.alert("Couldn't save", "Please try again in a moment.")
    } finally {
      setSaving(false)
    }
  }

  const locked = (level: number) => stats.level < level

  return (
    <Screen
      title="Avatar"
      subtitle="Your look across HUBLE"
      right={<Button label="Save" small onPress={handleSave} loading={saving} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Preview */}
      <Card style={{ alignItems: "center", paddingVertical: 24, gap: 12 }}>
        <View
          style={{
            width: 104,
            height: 104,
            borderRadius: 34,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tint(selectedColor, 0.16),
            ...ringFor(selectedBorder, selectedColor),
          }}
        >
          <Text style={{ fontSize: 52 }}>{selectedAvatar}</Text>
        </View>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Username"
          maxLength={20}
          autoCapitalize="none"
          style={{
            minWidth: 180,
            height: 42,
            paddingHorizontal: 14,
            borderRadius: RADIUS.inner,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: tint(colors.cardSecondary, 0.9),
          }}
        />
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          Level {stats.level} · {stats.experience} XP
        </Text>
      </Card>

      {/* Character */}
      <Section title="Character">
        <Card style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 }}>
          {avatarOptions.map((option) => {
            const isLocked = locked(option.level)
            const selected = selectedAvatar === option.emoji
            return (
              <TouchableOpacity
                key={option.emoji}
                accessibilityLabel={isLocked ? `${option.name}, locked until level ${option.level}` : option.name}
                accessibilityState={{ selected }}
                onPress={() =>
                  isLocked ? Alert.alert("Locked", `Reach level ${option.level} to unlock ${option.name}.`) : setSelectedAvatar(option.emoji)
                }
                style={{
                  width: "23%",
                  aspectRatio: 1,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  backgroundColor: selected ? tint(selectedColor, 0.16) : colors.background,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? selectedColor : tint(colors.cardSecondary, 0.8),
                  opacity: isLocked ? 0.45 : 1,
                }}
              >
                <Text style={{ fontSize: 28 }}>{option.emoji}</Text>
                {isLocked ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                    <Ionicons name="lock-closed" size={9} color={colors.textSecondary} />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textSecondary }}>Lv {option.level}</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 10, fontWeight: "600", color: colors.textSecondary }} numberOfLines={1}>
                    {option.name}
                  </Text>
                )}
              </TouchableOpacity>
            )
          })}
        </Card>
      </Section>

      {/* Color */}
      <Section title="Color">
        <Card style={{ flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
          {COLOR_OPTIONS.map((color) => {
            const selected = selectedColor === color
            return (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                accessibilityLabel={`Color ${color}`}
                accessibilityState={{ selected }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: selected ? 3 : 0,
                  borderColor: colors.text,
                }}
              >
                {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            )
          })}
        </Card>
      </Section>

      {/* Frame */}
      <Section title="Frame">
        <Card padded={false}>
          {BORDERS.map((border, i) => {
            const isLocked = locked(border.level)
            const selected = selectedBorder === border.id
            return (
              <View key={border.id}>
                {i > 0 && <Divider inset={70} />}
                <TouchableOpacity
                  onPress={() =>
                    isLocked ? Alert.alert("Locked", `Reach level ${border.level} to unlock the ${border.name} frame.`) : setSelectedBorder(border.id)
                  }
                  accessibilityState={{ selected }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12, opacity: isLocked ? 0.5 : 1 }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: tint(selectedColor, 0.16),
                      ...ringFor(border.id, selectedColor),
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{selectedAvatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{border.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{isLocked ? `Unlocks at level ${border.level}` : "Available"}</Text>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={18} color={colors.textSecondary} />
                  ) : null}
                </TouchableOpacity>
              </View>
            )
          })}
        </Card>
      </Section>
    </Screen>
  )
}
