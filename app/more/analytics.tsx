"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../contexts/ThemeProvider"
import { dataAPI } from "../../lib/api"
import tw from "../../lib/tailwind"


type AnalyticsCategory = {
  category: string
  count: number
}

type AnalyticsData = {
  productivityScore?: number
  streakData?: {
    current_streak?: number
    longest_streak?: number
  }
  focusAnalysis?: {
    total_minutes?: number
    session_count?: number
  }[]
  categoryBreakdown?: AnalyticsCategory[]
}

export default function Analytics() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState(30) // 7, 30, or 90 days

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dataAPI.getAnalytics(period)
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const weeklyFocusInsight = useMemo(() => {
    const focusSeries = analytics?.focusAnalysis || []
    if (!focusSeries.length) return null

    const minuteSeries = focusSeries.map((day) => {
      const parsed = Number(day.total_minutes || 0)
      return Number.isFinite(parsed) ? parsed : 0
    })

    const currentWeek = minuteSeries.slice(-7).reduce((sum, value) => sum + value, 0)
    const previousWeek = minuteSeries.slice(-14, -7).reduce((sum, value) => sum + value, 0)

    if (previousWeek === 0) {
      return {
        message:
          currentWeek > 0
            ? `You focused ${Math.round(currentWeek)} minutes this week. Great baseline to build from.`
            : "No focus sessions tracked this week yet. Start one session to generate insights.",
      }
    }

    const delta = ((currentWeek - previousWeek) / previousWeek) * 100
    const roundedDelta = Math.round(Math.abs(delta))

    if (delta >= 0) {
      return {
        message: `You focused ${roundedDelta}% more than last week (${Math.round(currentWeek)}m vs ${Math.round(previousWeek)}m).`,
      }
    }

    return {
      message: `You focused ${roundedDelta}% less than last week (${Math.round(currentWeek)}m vs ${Math.round(previousWeek)}m).`,
    }
  }, [analytics])

  const exportData = async () => {
    try {
      const data = await dataAPI.exportData()
      if (data.success) {
        // In a real app, save this file
        Alert.alert("Success", "Data exported successfully!")
        console.log("Exported data:", data.data)
      }
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.text }]}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-6 mt-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Analytics</Text>
          </View>
          <TouchableOpacity onPress={exportData} style={[tw`px-4 py-2 rounded-lg`, { backgroundColor: colors.accent }]}>
            <Text style={tw`text-white font-semibold`}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={tw`flex-row mb-6`}>
          {[7, 30, 90].map((days) => (
            <TouchableOpacity
              key={days}
              onPress={() => setPeriod(days)}
              style={[
                tw`flex-1 py-3 rounded-lg mr-2`,
                { backgroundColor: period === days ? colors.accent : colors.card }
              ]}
            >
              <Text style={[tw`text-center font-semibold`, { color: period === days ? '#FFF' : colors.text }]}>
                {days} Days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {weeklyFocusInsight && (
            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}> 
              <View style={tw`flex-row items-center mb-2`}>
                <Ionicons name="bulb-outline" size={20} color={colors.accent} style={tw`mr-2`} />
                <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Weekly Insight</Text>
              </View>
              <Text style={[tw`text-sm leading-5`, { color: colors.textSecondary }]}>
                {weeklyFocusInsight.message}
              </Text>
            </View>
          )}

          {/* Productivity Score */}
          <View style={[tw`rounded-2xl p-6 mb-4`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Productivity Score</Text>
            <View style={tw`items-center`}>
              <View style={[tw`w-32 h-32 rounded-full items-center justify-center`, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[tw`text-4xl font-bold`, { color: colors.accent }]}>
                  {analytics?.productivityScore || 0}%
                </Text>
              </View>
              <Text style={[tw`mt-3`, { color: colors.textSecondary }]}>Completion Rate</Text>
            </View>
          </View>

          {/* Streak Stats */}
          {analytics?.streakData && (
            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}>
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Streak Performance</Text>
              <View style={tw`flex-row justify-around`}>
                <View style={tw`items-center`}>
                  <Ionicons name="flame" size={32} color="#F97316" />
                  <Text style={[tw`text-2xl font-bold mt-2`, { color: colors.text }]}>
                    {analytics.streakData?.current_streak || 0}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Current</Text>
                </View>
                <View style={tw`items-center`}>
                  <Ionicons name="trophy" size={32} color="#F59E0B" />
                  <Text style={[tw`text-2xl font-bold mt-2`, { color: colors.text }]}>
                    {analytics.streakData?.longest_streak || 0}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Longest</Text>
                </View>
              </View>
            </View>
          )}

          {/* Focus Analysis */}
          {analytics?.focusAnalysis && analytics.focusAnalysis.length > 0 && (
            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}>
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Focus Time</Text>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={[{ color: colors.textSecondary }]}>Total Minutes</Text>
                <Text style={[tw`font-bold text-lg`, { color: colors.accent }]}>
                  {Math.round(analytics.focusAnalysis.reduce((sum: number, day) => sum + (day.total_minutes || 0), 0))}m
                </Text>
              </View>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={[{ color: colors.textSecondary }]}>Total Sessions</Text>
                <Text style={[tw`font-bold text-lg`, { color: colors.accent }]}>
                  {analytics.focusAnalysis.reduce((sum: number, day) => sum + (day.session_count || 0), 0)}
                </Text>
              </View>
            </View>
          )}

          {/* Category Breakdown */}
          {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
            <View style={[tw`rounded-2xl p-5 mb-4`, { backgroundColor: colors.card }]}>
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Task Categories</Text>
              {(() => {
                const totalCategories = analytics.categoryBreakdown.reduce((sum: number, item: AnalyticsCategory) => sum + item.count, 0)

                return analytics.categoryBreakdown.map((category: AnalyticsCategory, index: number) => (
                  <View key={index} style={tw`mb-3`}>
                    <View style={tw`flex-row justify-between mb-1`}>
                      <Text style={[{ color: colors.text }]}>{category.category}</Text>
                      <Text style={[tw`font-semibold`, { color: colors.accent }]}>{category.count}</Text>
                    </View>
                    <View style={[tw`h-2 rounded-full`, { backgroundColor: colors.cardSecondary }]}>
                      <View 
                        style={[
                          tw`h-2 rounded-full`,
                          { 
                            backgroundColor: colors.accent,
                            width: `${(category.count / totalCategories) * 100}%`
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))
              })()}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

