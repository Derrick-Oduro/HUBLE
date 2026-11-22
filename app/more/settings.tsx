"use client"

import React, { useState, useEffect } from "react"
import { Alert, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import { loadAppSettings, saveAppSettings, syncNotificationSchedules } from "../../lib/notificationService"
import { Card, Divider, IconName, ListRow, Screen, Section, Toggle } from "../../components/ui"

type Row =
  | { kind: "link"; title: string; subtitle?: string; icon: IconName; color: string; href: Href; value?: string }
  | { kind: "toggle"; title: string; subtitle?: string; icon: IconName; color: string; value: boolean; onChange: (v: boolean) => void }
  | { kind: "action"; title: string; subtitle?: string; icon: IconName; color: string; onPress: () => void; destructive?: boolean }

export default function Settings() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()

  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false)

  useEffect(() => {
    loadAppSettings()
      .then((settings) => {
        setNotifications(settings.notifications)
        setSound(settings.sound)
        setVibration(settings.vibration)
        setAutoBackup(settings.autoBackup)
        setAnalytics(settings.analytics)
      })
      .catch((error) => console.error("Error loading settings:", error))
      .finally(() => setHasLoadedSettings(true))
  }, [])

  // Persist whenever a setting changes (after the first load).
  useEffect(() => {
    if (!hasLoadedSettings) return
    saveAppSettings({ notifications, sound, vibration, autoBackup, analytics }).catch((error) => console.error("Error saving settings:", error))
  }, [hasLoadedSettings, notifications, sound, vibration, autoBackup, analytics])

  useEffect(() => {
    if (!hasLoadedSettings) return
    syncNotificationSchedules(notifications).catch((error) => console.error("Failed to sync notification schedules:", error))
  }, [hasLoadedSettings, notifications])

  const resetAllData = () =>
    Alert.alert(
      "Reset all data",
      "This permanently deletes your habits, dailies, routines and progress stored on this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["habitsData", "dailiesData", "routinesData", "statsData"])
              Alert.alert("Done", "Your local data has been reset.")
            } catch {
              Alert.alert("Couldn't reset", "Please try again.")
            }
          },
        },
      ],
    )

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Account",
      rows: [{ kind: "link", title: "Profile & avatar", subtitle: "Username, avatar and frame", icon: "person-circle-outline", color: colors.accent, href: "/more/avatar" }],
    },
    {
      title: "Privacy & security",
      rows: [
        { kind: "link", title: "Privacy & security", subtitle: "Export your data, account security", icon: "shield-checkmark-outline", color: colors.success, href: "/more/security" },
      ],
    },
    {
      title: "Notifications",
      rows: [
        { kind: "toggle", title: "Reminders", subtitle: "Habit and daily reminders", icon: "notifications-outline", color: colors.accent, value: notifications, onChange: setNotifications },
        { kind: "toggle", title: "Sound", icon: "volume-high-outline", color: colors.success, value: sound, onChange: setSound },
        { kind: "toggle", title: "Vibration", icon: "phone-portrait-outline", color: colors.warning, value: vibration, onChange: setVibration },
      ],
    },
    {
      title: "App",
      rows: [
        { kind: "link", title: "Theme", icon: "color-palette-outline", color: "#EC4899", href: "/more/themes", value: currentTheme.name },
        { kind: "link", title: "Help & support", icon: "help-circle-outline", color: "#06B6D4", href: "/more/help" },
      ],
    },
    {
      title: "Data",
      rows: [
        { kind: "toggle", title: "Auto backup", subtitle: "Back up your data automatically", icon: "cloud-upload-outline", color: "#06B6D4", value: autoBackup, onChange: setAutoBackup },
        { kind: "toggle", title: "Share usage analytics", subtitle: "Help improve HUBLE", icon: "analytics-outline", color: colors.accent, value: analytics, onChange: setAnalytics },
        { kind: "action", title: "Reset all data", subtitle: "Delete everything stored on this device", icon: "trash-outline", color: colors.error, onPress: resetAllData, destructive: true },
      ],
    },
  ]

  return (
    <Screen title="Settings">
      {sections.map((section) => (
        <Section key={section.title} title={section.title}>
          <Card padded={false}>
            {section.rows.map((row, i) => (
              <View key={row.title}>
                {i > 0 && <Divider inset={62} />}
                {row.kind === "link" ? (
                  <ListRow
                    icon={row.icon}
                    iconColor={row.color}
                    title={row.title}
                    subtitle={row.subtitle}
                    onPress={() => router.push(row.href)}
                    chevron
                    right={row.value ? <Text style={{ fontSize: 13, color: colors.textSecondary }}>{row.value}</Text> : undefined}
                  />
                ) : row.kind === "toggle" ? (
                  <ListRow
                    icon={row.icon}
                    iconColor={row.color}
                    title={row.title}
                    subtitle={row.subtitle}
                    onPress={() => row.onChange(!row.value)}
                    right={<Toggle value={row.value} onChange={row.onChange} label={row.title} />}
                  />
                ) : (
                  <ListRow icon={row.icon} iconColor={row.color} title={row.title} subtitle={row.subtitle} onPress={row.onPress} chevron />
                )}
              </View>
            ))}
          </Card>
        </Section>
      ))}

      <Text style={{ textAlign: "center", fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>HUBLE · version 1.0.0</Text>
    </Screen>
  )
}
