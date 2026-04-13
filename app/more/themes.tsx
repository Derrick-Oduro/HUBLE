"use client"

import React, { useEffect, useMemo, useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"


const preferredCategoryOrder = ["Default", "Nature", "Vibrant", "Premium", "Special", "Elegant"]

export default function Themes() {
  const router = useRouter()
  const { currentTheme, selectedThemeId, themes, setTheme, refreshThemes, colors } = useTheme()
  const [previewTheme, setPreviewTheme] = useState(selectedThemeId)

  const normalizeCategory = (category?: string) => {
    if (!category || typeof category !== 'string') return 'Other'
    return category
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }

  useEffect(() => {
    refreshThemes().catch((error) => {
      console.error("Failed to refresh themes on Themes screen:", error)
    })
  }, [refreshThemes])

  const handleApplyTheme = async () => {
    const selectedTheme = themes.find(t => t.id === previewTheme)
    
    if (!selectedTheme?.unlocked) {
      Alert.alert(
        "Theme Locked",
        `This theme requires: ${selectedTheme?.requirement}`,
        [{ text: "OK" }]
      )
      return
    }

    await setTheme(previewTheme)
    Alert.alert(
      "Theme Applied!",
      `"${selectedTheme.name}" is now active across the entire app.`,
      [{ text: "Great!", onPress: () => router.back() }]
    )
  }

  const ThemePreview = ({ theme, isSelected, onSelect }) => {
    const hasGlowEffect = theme.visualEffect === 'glow'

    return (
    <TouchableOpacity
      style={[
        tw`rounded-2xl p-5 mb-4`,
        {
          backgroundColor: theme.colors.background,
          borderWidth: isSelected ? 3 : 1,
          borderColor: isSelected ? theme.colors.accent : theme.colors.cardSecondary,
          opacity: theme.unlocked ? 1 : 0.7,
          shadowColor: theme.colors.accent,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: hasGlowEffect ? 0.3 : 0,
          shadowRadius: hasGlowEffect ? 10 : 0,
          elevation: hasGlowEffect ? 8 : 0,
        }
      ]}
      onPress={() => onSelect(theme.id)}
    >
      {/* Header */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-row items-center flex-1`}>
          <View style={[
            tw`w-10 h-10 rounded-xl items-center justify-center mr-3`,
            { backgroundColor: theme.colors.accent + '20' }
          ]}>
            <Ionicons name={theme.icon} size={20} color={theme.colors.accent} />
          </View>
          
          <View style={tw`flex-1`}>
            <Text style={[tw`font-bold text-lg`, { color: theme.colors.text }]}>
              {theme.name}
            </Text>
            <Text style={[tw`text-sm`, { color: theme.colors.textSecondary }]}>
              {theme.description}
            </Text>
          </View>
        </View>
        
        <View style={tw`items-end`}>
          {!theme.unlocked && (
            <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
          )}
          
          {isSelected && (
            <View style={[
              tw`w-6 h-6 rounded-full items-center justify-center`,
              { backgroundColor: theme.colors.accent }
            ]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
          
          {theme.id === selectedThemeId && (
            <View style={[
              tw`px-2 py-1 rounded-full mt-1`,
              { backgroundColor: theme.colors.success + '20' }
            ]}>
              <Text style={[tw`text-xs font-bold`, { color: theme.colors.success }]}>
                ACTIVE
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Theme Preview Cards */}
      <View style={tw`flex-row space-x-3 mb-4`}>
        {/* Main Card Preview */}
        <View style={[
          tw`flex-1 h-20 rounded-xl p-3`,
          { backgroundColor: theme.colors.card }
        ]}>
          <View style={[
            tw`h-2 rounded mb-2`,
            { backgroundColor: theme.colors.accent }
          ]} />
          <View style={[
            tw`h-1.5 rounded mb-1.5`,
            { backgroundColor: theme.colors.text, opacity: 0.8 }
          ]} />
          <View style={[
            tw`h-1.5 rounded w-3/4`,
            { backgroundColor: theme.colors.textSecondary, opacity: 0.6 }
          ]} />
        </View>
        
        {/* Accent Button Preview */}
        <View style={[
          tw`w-20 h-20 rounded-xl items-center justify-center`,
          { backgroundColor: theme.colors.accent }
        ]}>
          <Ionicons name="star" size={24} color={theme.colors.text} />
        </View>
      </View>

      {/* Color Palette */}
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={[tw`text-sm font-medium`, { color: theme.colors.text }]}>
          Color Palette
        </Text>
        <View style={tw`flex-row space-x-1`}>
          {[
            theme.colors.accent,
            theme.colors.success,
            theme.colors.warning,
            theme.colors.error
          ].map((color, index) => (
            <View
              key={index}
              style={[
                tw`w-4 h-4 rounded-full`,
                { backgroundColor: color }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Category Tag */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={[
          tw`px-3 py-1 rounded-full`,
          { backgroundColor: theme.colors.cardSecondary }
        ]}>
          <Text style={[tw`text-xs font-medium`, { color: theme.colors.textSecondary }]}>
            {theme.category}
          </Text>
        </View>
        
        {!theme.unlocked && (
          <View style={tw`flex-row items-center`}>
            <Ionicons name="lock-closed" size={12} color={theme.colors.textSecondary} style={tw`mr-1`} />
            <Text style={[tw`text-xs`, { color: theme.colors.textSecondary }]}>
              {theme.requirement}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    )
  }

  const groupedThemes = useMemo(() => {
    const byCategory = themes.reduce((acc, theme) => {
      const categoryLabel = normalizeCategory(theme.category)
      if (!acc[categoryLabel]) {
        acc[categoryLabel] = []
      }
      acc[categoryLabel].push(theme)
      return acc
    }, {} as Record<string, typeof themes>)

    const allCategories = Object.keys(byCategory)
    const orderedCategories = [
      ...preferredCategoryOrder.filter((category) => byCategory[category]),
      ...allCategories
        .filter((category) => !preferredCategoryOrder.includes(category))
        .sort((a, b) => a.localeCompare(b)),
    ]

    return orderedCategories.map((category) => ({
      category,
      themes: byCategory[category],
    }))
  }, [themes])

  const unlockedThemeCount = useMemo(
    () => themes.filter((theme) => theme.unlocked).length,
    [themes],
  )

  const lockedThemes = useMemo(
    () => themes.filter((theme) => !theme.unlocked),
    [themes],
  )

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Themes</Text>
          
          {/* Apply Button */}
          <TouchableOpacity 
            style={[
              tw`px-4 py-2 rounded-xl`,
              { 
                backgroundColor: colors.accent,
                opacity: previewTheme !== selectedThemeId ? 1 : 0.5
              }
            ]}
            onPress={handleApplyTheme}
            disabled={previewTheme === selectedThemeId}
          >
            <Text style={tw`text-white font-semibold`}>
              {previewTheme === selectedThemeId ? 'Applied' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Theme Info */}
          <View style={[
            tw`rounded-2xl p-5 mb-6`,
            { backgroundColor: colors.card }
          ]}>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={[
                tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                { backgroundColor: colors.accent + '20' }
              ]}>
                <Ionicons name={currentTheme.icon} size={24} color={colors.accent} />
              </View>
              <View>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Current Theme</Text>
                <Text style={[tw``, { color: colors.textSecondary }]}>{currentTheme.name}</Text>
              </View>
            </View>
            
            <View style={[tw`flex-row justify-between pt-3 border-t`, { borderColor: colors.cardSecondary }]}>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                Category: {currentTheme.category}
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                {unlockedThemeCount}/{themes.length} unlocked
              </Text>
            </View>
          </View>

          {/* Grouped Themes */}
          {groupedThemes.map((group) => (
            <View key={group.category} style={tw`mb-6`}>
              <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                {group.category} Themes
              </Text>
              
              {group.themes.map((theme) => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  isSelected={previewTheme === theme.id}
                  onSelect={setPreviewTheme}
                />
              ))}
            </View>
          ))}

          {/* How to Unlock */}
          <View style={[
            tw`rounded-2xl p-5 mb-4`,
            { backgroundColor: colors.card }
          ]}>
            <View style={tw`flex-row items-center mb-3`}>
              <MaterialCommunityIcons name="key" size={24} color={colors.warning} style={tw`mr-3`} />
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>How to Unlock Themes</Text>
            </View>
            
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="stats-chart" size={20} color="#F59E0B" style={tw`mr-3`} />
                <Text style={[tw`text-sm flex-1`, { color: colors.textSecondary }]}>Level up to unlock premium themes</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={tw`mr-3`} />
                <Text style={[tw`text-sm flex-1`, { color: colors.textSecondary }]}>Complete tasks and build streaks</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="trophy" size={20} color="#3B82F6" style={tw`mr-3`} />
                <Text style={[tw`text-sm flex-1`, { color: colors.textSecondary }]}>Participate in challenges and earn badges</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="people" size={20} color="#A855F7" style={tw`mr-3`} />
                <Text style={[tw`text-sm flex-1`, { color: colors.textSecondary }]}>Join parties and earn group achievements</Text>
              </View>
            </View>
          </View>

          {/* Unlock Progress */}
          <View style={[
            tw`rounded-2xl p-5`,
            { backgroundColor: colors.card }
          ]}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="sparkles" size={24} color={colors.warning} style={tw`mr-3`} />
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Theme Unlock Progress</Text>
            </View>

            {lockedThemes.length === 0 ? (
              <Text style={[tw`mb-1`, { color: colors.textSecondary }]}> 
                You have unlocked every available theme.
              </Text>
            ) : (
              <>
                <Text style={[tw`mb-3`, { color: colors.textSecondary }]}> 
                  Keep progressing to unlock {lockedThemes.length} more theme{lockedThemes.length === 1 ? "" : "s"}.
                </Text>

                <View style={tw`flex-row flex-wrap`}>
                  {lockedThemes.slice(0, 6).map((theme) => (
                    <View
                      key={theme.id}
                      style={[
                        tw`px-3 py-2 rounded-full mr-2 mb-2 flex-row items-center`,
                        { backgroundColor: colors.cardSecondary }
                      ]}
                    >
                      <Ionicons name="lock-closed" size={14} color={colors.warning} style={tw`mr-1`} />
                      <Text style={[tw`text-sm`, { color: colors.text }]}>{theme.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}


