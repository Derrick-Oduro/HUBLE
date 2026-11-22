import React, { useCallback, useState } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useStats } from '../contexts/StatsProvider'
import { useTheme } from '../contexts/ThemeProvider'
import { Avatar, Card, ProgressBar } from './ui'

interface CharacterPanelProps {
  completedCount: number
  totalCount: number
  taskType: 'habits' | 'dailies' | 'routines'
}

const SINGULAR = { habits: 'habit', dailies: 'daily', routines: 'routine' } as const

// Compact hero card: avatar + level + currency on one row, three slim meters below.
export default function CharacterPanel({ completedCount, totalCount, taskType }: CharacterPanelProps) {
  const { colors } = useTheme()
  const { stats } = useStats()
  const [avatar, setAvatar] = useState<{ avatar: string; color: string }>({ avatar: '🧙‍♂️', color: colors.accent })

  // Reload the avatar whenever the screen is shown (it can change on the Avatar screen).
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('avatarData')
        .then((saved) => {
          if (!saved) return
          const parsed = JSON.parse(saved)
          setAvatar({ avatar: parsed.avatar || '🧙‍♂️', color: parsed.color || colors.accent })
        })
        .catch(() => {})
    }, [colors.accent]),
  )

  const health = stats.health || 0
  const maxHealth = stats.maxHealth || 100
  const healthPct = health / maxHealth
  const xpInLevel = (stats.experience || 0) % 100
  const todayPct = totalCount > 0 ? completedCount / totalCount : 0
  const healthColor = healthPct > 0.5 ? colors.success : healthPct > 0.25 ? colors.warning : colors.error

  const meters = [
    { label: 'Health', value: `${health}/${maxHealth}`, pct: healthPct, color: healthColor },
    { label: 'XP', value: `${xpInLevel}/100`, pct: xpInLevel / 100, color: colors.accent },
    { label: 'Today', value: `${completedCount}/${totalCount}`, pct: todayPct, color: colors.success },
  ]

  return (
    <Card style={{ padding: 14, gap: 12, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar emoji={avatar.avatar} color={avatar.color} size={44} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Level {stats.level}</Text>
            {stats.currentStreak > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flame" size={13} color={colors.warning} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.warning, marginLeft: 2 }}>{stats.currentStreak}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
            {totalCount === 0
              ? `No ${taskType} yet`
              : completedCount === totalCount
                ? `All ${taskType} done today`
                : `${totalCount - completedCount} ${totalCount - completedCount === 1 ? SINGULAR[taskType] : taskType} left today`}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="ellipse" size={9} color={colors.warning} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginLeft: 4 }}>{stats.coinsEarned}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="diamond" size={9} color={colors.accent} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginLeft: 4 }}>{stats.gemsEarned}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {meters.map((meter) => (
          <View key={meter.label} style={{ flex: 1, gap: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>{meter.label}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{meter.value}</Text>
            </View>
            <ProgressBar value={meter.pct} color={meter.color} height={5} />
          </View>
        ))}
      </View>
    </Card>
  )
}
