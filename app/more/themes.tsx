"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import { Button, Card, ProgressBar, Screen, Section, tint } from "../../components/ui"

const preferredCategoryOrder = ["Default", "Nature", "Vibrant", "Premium", "Special", "Elegant"]

const normalizeCategory = (category?: string) => {
  if (!category || typeof category !== "string") return "Other"
  return category
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export default function Themes() {
  const router = useRouter()
  const { currentTheme, selectedThemeId, themes, setTheme, refreshThemes, colors } = useTheme()
  const [previewTheme, setPreviewTheme] = useState(selectedThemeId)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    refreshThemes().catch((error) => console.error("Failed to refresh themes on Themes screen:", error))
  }, [refreshThemes])

  const handleApplyTheme = async () => {
    const theme = themes.find((t) => t.id === previewTheme)
    if (!theme) return
    if (!theme.unlocked) {
      Alert.alert("Theme locked", theme.requirement ? `To unlock: ${theme.requirement}` : "Keep progressing to unlock this theme.")
      return
    }
    setApplying(true)
    try {
      await setTheme(previewTheme)
    } finally {
      setApplying(false)
    }
  }

  const groupedThemes = useMemo(() => {
    const byCategory = themes.reduce(
      (acc, theme) => {
        const label = normalizeCategory(theme.category)
        ;(acc[label] ||= []).push(theme)
        return acc
      },
      {} as Record<string, typeof themes>,
    )
    const all = Object.keys(byCategory)
    return [
      ...preferredCategoryOrder.filter((c) => byCategory[c]),
      ...all.filter((c) => !preferredCategoryOrder.includes(c)).sort((a, b) => a.localeCompare(b)),
    ].map((category) => ({ category, themes: byCategory[category] }))
  }, [themes])

  const unlockedCount = themes.filter((t) => t.unlocked).length
  const changed = previewTheme !== selectedThemeId

  return (
    <Screen
      title="Themes"
      subtitle={`${unlockedCount} of ${themes.length} unlocked`}
      right={<Button label={changed ? "Apply" : "Applied"} small disabled={!changed} loading={applying} onPress={handleApplyTheme} />}
    >
      {/* Current */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: tint(colors.accent, 0.16) }}>
            <Ionicons name={(currentTheme.icon as any) || "color-palette"} size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Current theme</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{currentTheme.name}</Text>
          </View>
        </View>
        <ProgressBar value={themes.length ? unlockedCount / themes.length : 0} />
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Level up, keep streaks and finish challenges to unlock more.</Text>
      </Card>

      {groupedThemes.map((group) => (
        <Section key={group.category} title={group.category}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {group.themes.map((theme) => {
              const selected = previewTheme === theme.id
              const active = selectedThemeId === theme.id
              const c = theme.colors
              return (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setPreviewTheme(theme.id)}
                  accessibilityLabel={`${theme.name}${theme.unlocked ? "" : ", locked"}`}
                  accessibilityState={{ selected }}
                  style={{
                    width: "47.5%",
                    borderRadius: 16,
                    padding: 10,
                    gap: 10,
                    backgroundColor: colors.card,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.accent : tint(colors.cardSecondary, 0.6),
                  }}
                >
                  {/* Mini preview in the theme's own colors */}
                  <View style={{ height: 78, borderRadius: 10, padding: 8, gap: 6, backgroundColor: c.background, opacity: theme.unlocked ? 1 : 0.55 }}>
                    <View style={{ flex: 1, borderRadius: 6, padding: 6, gap: 4, backgroundColor: c.card }}>
                      <View style={{ width: "55%", height: 5, borderRadius: 3, backgroundColor: c.text, opacity: 0.85 }} />
                      <View style={{ width: "80%", height: 4, borderRadius: 2, backgroundColor: c.textSecondary, opacity: 0.6 }} />
                      <View style={{ width: "40%", height: 4, borderRadius: 2, backgroundColor: c.accent }} />
                    </View>
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {[c.accent, c.success, c.warning, c.error].map((swatch, i) => (
                        <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: swatch }} />
                      ))}
                    </View>
                    {!theme.unlocked && (
                      <View style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.55)" }}>
                        <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: colors.text }} numberOfLines={1}>
                      {theme.name}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
                  </View>
                  {!theme.unlocked && !!theme.requirement && (
                    <Text style={{ marginTop: -6, fontSize: 11, color: colors.textSecondary }} numberOfLines={2}>
                      {theme.requirement}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </Section>
      ))}

      {changed && <Button label="Apply theme" icon="color-palette-outline" loading={applying} onPress={handleApplyTheme} />}
      <Button label="Done" variant="ghost" onPress={() => router.back()} />
    </Screen>
  )
}
