"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../contexts/ThemeProvider"
import { dataAPI } from "../../lib/api"
import { Card, EmptyState, LoadingState, ProgressBar, Screen, Section, Segmented, StatTile, RADIUS } from "../../components/ui"

type AnalyticsCategory = { category: string; count: number }
type FocusDay = { date?: string; total_minutes?: number; session_count?: number }
type AnalyticsData = {
  productivityScore?: number
  streakData?: { current_streak?: number; longest_streak?: number }
  focusAnalysis?: FocusDay[]
  categoryBreakdown?: AnalyticsCategory[]
}
type Period = "7" | "30" | "90"

const dayKey = (date: Date) => date.toISOString().split("T")[0]

export default function Analytics() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState<Period>("30")

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dataAPI.getAnalytics(Number(period))
      if (data.success) setAnalytics(data.analytics)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const focusDays = analytics?.focusAnalysis || []
  const totalMinutes = Math.round(focusDays.reduce((sum, day) => sum + Number(day.total_minutes || 0), 0))
  const totalSessions = focusDays.reduce((sum, day) => sum + Number(day.session_count || 0), 0)

  // Last 14 days (7 for the weekly view) as bars, filling days without sessions with 0.
  const chart = useMemo(() => {
    const days = period === "7" ? 7 : 14
    const byDate = new Map(focusDays.map((d) => [String(d.date || "").slice(0, 10), Number(d.total_minutes || 0)]))
    const series = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return { key: dayKey(date), label: date.toLocaleDateString(undefined, { weekday: "narrow" }), minutes: byDate.get(dayKey(date)) || 0 }
    })
    const max = Math.max(1, ...series.map((d) => d.minutes))
    return { series, max, days }
  }, [focusDays, period])

  const insight = useMemo(() => {
    const minutes = focusDays.map((d) => Number(d.total_minutes || 0))
    if (!minutes.length) return null
    const thisWeek = minutes.slice(-7).reduce((s, v) => s + v, 0)
    const lastWeek = minutes.slice(-14, -7).reduce((s, v) => s + v, 0)
    if (lastWeek === 0) {
      return thisWeek > 0 ? `You focused ${Math.round(thisWeek)} minutes this week — a good baseline to build on.` : null
    }
    const delta = Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    return `You focused ${Math.abs(delta)}% ${delta >= 0 ? "more" : "less"} than last week (${Math.round(thisWeek)}m vs ${Math.round(lastWeek)}m).`
  }, [focusDays])

  const exportData = async () => {
    try {
      const data = await dataAPI.exportData()
      if (data.success) {
        Alert.alert("Export ready", "Your data was exported successfully.")
        console.log("Exported data:", data.data)
      }
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const exportButton = (
    <TouchableOpacity
      onPress={exportData}
      accessibilityLabel="Export data"
      style={{ width: 40, height: 40, borderRadius: RADIUS.inner, alignItems: "center", justifyContent: "center", backgroundColor: colors.card }}
    >
      <Ionicons name="download-outline" size={19} color={colors.text} />
    </TouchableOpacity>
  )

  const categories = analytics?.categoryBreakdown || []
  const categoryTotal = categories.reduce((sum, c) => sum + c.count, 0)

  return (
    <Screen title="Analytics" subtitle="Trends over time" right={exportButton}>
      <Segmented<Period>
        value={period}
        onChange={setPeriod}
        options={[
          { value: "7", label: "7 days" },
          { value: "30", label: "30 days" },
          { value: "90", label: "90 days" },
        ]}
      />

      {loading ? (
        <LoadingState label="Crunching your numbers…" />
      ) : !analytics ? (
        <EmptyState icon="analytics-outline" title="No data yet" message="Complete tasks and focus sessions to see your trends." />
      ) : (
        <>
          {insight && (
            <Card style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <Ionicons name="bulb-outline" size={20} color={colors.accent} />
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.text }}>{insight}</Text>
            </Card>
          )}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatTile icon="checkmark-done-outline" color={colors.success} value={`${analytics.productivityScore || 0}%`} label="Completion" />
            <StatTile icon="flame-outline" color={colors.warning} value={analytics.streakData?.current_streak || 0} label="Streak" />
            <StatTile icon="trophy-outline" color={colors.accent} value={analytics.streakData?.longest_streak || 0} label="Best streak" />
          </View>

          <Section title="Focus">
            <Card style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", gap: 24 }}>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>{totalMinutes}m</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Focused</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>{totalSessions}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Sessions</Text>
                </View>
              </View>

              <View>
                <View style={{ flexDirection: "row", alignItems: "flex-end", height: 96, gap: chart.days > 7 ? 4 : 8 }}>
                  {chart.series.map((day) => (
                    <View key={day.key} style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                      <View
                        style={{
                          height: `${Math.max(day.minutes > 0 ? 6 : 3, (day.minutes / chart.max) * 100)}%`,
                          borderRadius: 4,
                          backgroundColor: day.minutes > 0 ? colors.accent : colors.cardSecondary,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row", gap: chart.days > 7 ? 4 : 8, marginTop: 6 }}>
                  {chart.series.map((day) => (
                    <Text key={day.key} style={{ flex: 1, textAlign: "center", fontSize: 10, color: colors.textSecondary }}>
                      {day.label}
                    </Text>
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>
                  Minutes per day · last {chart.days} days
                </Text>
              </View>
            </Card>
          </Section>

          {categories.length > 0 && (
            <Section title="Task categories">
              <Card style={{ gap: 14 }}>
                {categories.map((category) => (
                  <View key={category.category} style={{ gap: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{category.category}</Text>
                      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{category.count}</Text>
                    </View>
                    <ProgressBar value={categoryTotal > 0 ? category.count / categoryTotal : 0} />
                  </View>
                ))}
              </Card>
            </Section>
          )}
        </>
      )}
    </Screen>
  )
}
