"use client"

import React, { useState } from "react"
import { Alert, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeProvider"
import { dataAPI } from "../../lib/api"
import { Card, Divider, IconName, ListRow, Pill, Screen, Section, tint } from "../../components/ui"

// Only "Export data" is wired to the backend today. The rest are listed as
// "Coming soon" instead of switches that look like they work but don't.
const UPCOMING: { title: string; subtitle: string; icon: IconName }[] = [
  { title: "Change password", subtitle: "Reset your password by email", icon: "key-outline" },
  { title: "Two-factor authentication", subtitle: "A code on sign-in for extra security", icon: "shield-checkmark-outline" },
  { title: "Biometric unlock", subtitle: "Open HUBLE with fingerprint or face", icon: "finger-print-outline" },
  { title: "Active devices", subtitle: "See and sign out other devices", icon: "phone-portrait-outline" },
  { title: "Privacy mode", subtitle: "Hide details in previews and screenshots", icon: "eye-off-outline" },
  { title: "Blocked users", subtitle: "Review people you've blocked", icon: "ban-outline" },
  { title: "Delete account", subtitle: "Permanently remove your account and data", icon: "trash-outline" },
]

export default function Security() {
  const { colors } = useTheme()
  const [exporting, setExporting] = useState(false)

  const handleExportData = async () => {
    setExporting(true)
    try {
      const response = await dataAPI.exportData()
      if (!response?.success) throw new Error("Export failed")
      Alert.alert("Export ready", "A copy of your habits, dailies, routines and progress was generated.")
    } catch (error) {
      console.error("Failed to export data:", error)
      Alert.alert("Couldn't export", "Please try again in a moment.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Screen title="Privacy & security">
      <Section title="Your data">
        <Card padded={false}>
          <ListRow
            icon="download-outline"
            iconColor={colors.success}
            title="Export data"
            subtitle={exporting ? "Preparing your export…" : "Get a copy of everything you've tracked"}
            onPress={exporting ? undefined : handleExportData}
            chevron
          />
        </Card>
      </Section>

      <Section title="Coming soon">
        <Card padded={false}>
          {UPCOMING.map((item, i) => (
            <View key={item.title}>
              {i > 0 && <Divider inset={62} />}
              <View style={{ opacity: 0.6 }}>
                <ListRow icon={item.icon} iconColor={colors.textSecondary} title={item.title} subtitle={item.subtitle} right={<Pill label="Soon" />} />
              </View>
            </View>
          ))}
        </Card>
      </Section>

      <Card style={{ flexDirection: "row", gap: 12, backgroundColor: tint(colors.warning, 0.08), borderColor: tint(colors.warning, 0.3) }}>
        <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.text }}>
          Use a strong password you don't use anywhere else, and never share your login details.
        </Text>
      </Card>
    </Screen>
  )
}
