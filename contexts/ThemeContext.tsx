"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI, configAPI, statsAPI } from '../lib/api'

interface ThemeColors {
  background: string
  card: string
  cardSecondary: string
  accent: string
  text: string
  textSecondary: string
  success: string
  warning: string
  error: string
}

type UnlockType = 'none' | 'level' | 'tasks_completed' | 'streak' | 'focus_minutes'
type VisualEffect = 'none' | 'glow'
type StatusBarStyle = 'light-content' | 'dark-content'

interface Theme {
  id: string
  name: string
  description: string
  category: string
  colors: ThemeColors
  unlocked: boolean
  requirement?: string
  icon: string
  unlockType?: UnlockType
  unlockValue?: number
  visualEffect?: VisualEffect
  statusBarStyle: StatusBarStyle
}

interface UserProgress {
  level: number
  total_tasks_completed: number
  current_streak: number
  focus_minutes: number
}

interface ThemeContextType {
  currentTheme: Theme
  selectedThemeId: string
  themes: Theme[]
  setTheme: (themeId: string) => Promise<void>
  refreshThemes: (preferredThemeId?: string | null) => Promise<void>
  colors: ThemeColors
  isGlowEnabled: boolean
}

const parseColorToRgb = (color?: string): { r: number; g: number; b: number } | null => {
  if (!color) return null

  const normalizedColor = color.trim()

  const hexMatch = normalizedColor.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hexMatch) {
    const hex = hexMatch[1]

    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      }
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }

  const rgbMatch = normalizedColor.match(
    /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i,
  )
  if (rgbMatch) {
    return {
      r: Math.min(255, Number(rgbMatch[1])),
      g: Math.min(255, Number(rgbMatch[2])),
      b: Math.min(255, Number(rgbMatch[3])),
    }
  }

  return null
}

const getStatusBarStyleForBackground = (backgroundColor?: string): StatusBarStyle => {
  const rgb = parseColorToRgb(backgroundColor)
  if (!rgb) return 'light-content'

  const toLinear = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance =
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)

  return luminance > 0.52 ? 'dark-content' : 'light-content'
}

const fallbackThemes: Theme[] = [
  {
    id: "dark",
    name: "Dark Theme",
    description: "Easy on the eyes",
    category: "Default",
    colors: {
      background: "#111827",
      card: "#1F2937",
      cardSecondary: "#374151",
      accent: "#8B5CF6",
      text: "#FFFFFF",
      textSecondary: "#9CA3AF",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    unlocked: true,
    icon: "moon",
    statusBarStyle: 'light-content'
  },
  {
    id: "light",
    name: "Light Theme",
    description: "Clean and bright",
    category: "Default",
    colors: {
      background: "#F9FAFB",
      card: "#FFFFFF",
      cardSecondary: "#F3F4F6",
      accent: "#8B5CF6",
      text: "#111827",
      textSecondary: "#6B7280",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626"
    },
    unlocked: true,
    icon: "sunny",
    statusBarStyle: 'dark-content'
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Cool and calming",
    category: "Nature",
    colors: {
      background: "#0C4A6E",
      card: "#0369A1",
      cardSecondary: "#0284C7",
      accent: "#06B6D4",
      text: "#FFFFFF",
      textSecondary: "#BAE6FD",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    unlocked: true,
    icon: "water",
    statusBarStyle: 'light-content'
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Natural and fresh",
    category: "Nature",
    colors: {
      background: "#14532D",
      card: "#166534",
      cardSecondary: "#15803D",
      accent: "#10B981",
      text: "#FFFFFF",
      textSecondary: "#BBF7D0",
      success: "#059669",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    unlocked: true,
    icon: "leaf",
    statusBarStyle: 'light-content'
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm and energetic",
    category: "Vibrant",
    colors: {
      background: "#9A3412",
      card: "#C2410C",
      cardSecondary: "#EA580C",
      accent: "#F59E0B",
      text: "#FFFFFF",
      textSecondary: "#FED7AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    unlocked: true, // Changed to true for testing
    requirement: "Reach level 10",
    icon: "sunset",
    statusBarStyle: 'light-content'
  },
  {
    id: "royal",
    name: "Royal Purple",
    description: "Elegant and premium",
    category: "Premium",
    colors: {
      background: "#581C87",
      card: "#7C3AED",
      cardSecondary: "#8B5CF6",
      accent: "#A855F7",
      text: "#FFFFFF",
      textSecondary: "#DDD6FE",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444"
    },
    unlocked: true, // Changed to true for testing
    requirement: "Complete 50 tasks",
    icon: "diamond",
    statusBarStyle: 'light-content'
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    description: "Futuristic vibes",
    category: "Special",
    colors: {
      background: "#0A0A0A",
      card: "#1A1A1A",
      cardSecondary: "#2A2A2A",
      accent: "#00FF88",
      text: "#FFFFFF",
      textSecondary: "#88FF0088",
      success: "#00FF88",
      warning: "#FFD700",
      error: "#FF0040"
    },
    unlocked: true, // Changed to true for testing
    requirement: "Join 5 challenges",
    icon: "flash",
    statusBarStyle: 'light-content'
  },
  {
    id: "rose",
    name: "Rose Gold",
    description: "Soft and elegant",
    category: "Elegant",
    colors: {
      background: "#FDF2F8",
      card: "#FFEEF6",
      cardSecondary: "#FCE7F3",
      accent: "#EC4899",
      text: "#831843",
      textSecondary: "#BE185D",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626"
    },
    unlocked: true, // Changed to true for testing
    requirement: "Earn 3 group badges",
    icon: "rose",
    statusBarStyle: 'dark-content'
  },
  {
    id: "paper",
    name: "Paper Theme",
    description: "Clean paper with black ink",
    category: "Elegant",
    colors: {
      background: "#FEFCF7",
      card: "#FFFEF9",
      cardSecondary: "#F8F6F0",
      accent: "#2C2C2E",
      text: "#1C1C1E",
      textSecondary: "#48484A",
      success: "#4A5D23",
      warning: "#8B4513",
      error: "#8B1A1A"
    },
    unlocked: true,
    icon: "document-text",
    statusBarStyle: 'dark-content'
  },
  {
    id: "vintage-paper",
    name: "Vintage Paper",
    description: "Aged paper with fountain pen ink",
    category: "Premium",
    colors: {
      background: "#F5F2E8",
      card: "#F9F6EC",
      cardSecondary: "#F0EDE1",
      accent: "#1F1F1F",
      text: "#2F2F2F",
      textSecondary: "#5C5C5C",
      success: "#355C2B",
      warning: "#A0620E",
      error: "#7A1A1A"
    },
    unlocked: false,
    requirement: "Reach level 10",
    icon: "library",
    statusBarStyle: 'dark-content'
  },
  {
    id: "notebook",
    name: "Notebook Paper",
    description: "Lined notebook with blue ink",
    category: "Default",
    colors: {
      background: "#FDFDFD",
      card: "#FFFFFF",
      cardSecondary: "#F7F7F7",
      accent: "#1E3A8A",
      text: "#1A1A1A",
      textSecondary: "#4D4D4D",
      success: "#166534",
      warning: "#B45309",
      error: "#DC2626"
    },
    unlocked: true,
    icon: "book",
    statusBarStyle: 'dark-content'
  },
  {
    id: "christmas",
    name: "Christmas Theme",
    description: "Festive red, white and green",
    category: "Default",
    colors: {
      background: "#FFFFFF",   // Pure white (snow)
      card: "#FEFEFE",         // Off-white cards
      cardSecondary: "#F8F9FA", // Very light gray
      accent: "#B91C1C",       // Deep Christmas red
      text: "#1F2937",         // Dark text
      textSecondary: "#6B7280", // Medium gray
      success: "#047857",      // Deep Christmas green
      warning: "#92400E",      // Bronze/copper (Christmas ornaments)
      error: "#7C2D12"         // Dark burgundy red
    },
    unlocked: true,
    icon: "sunny",
    statusBarStyle: 'dark-content'
  },
  {
    id: "solo-leveling",
    name: "Solo Leveling",
    description: "Rise from the weakest to the strongest",
    category: "Special",
    colors: {
      background: "#0A0A0F",   // Deep shadow black
      card: "#1A1A2E",        // Dark purple-black (like dungeons)
      cardSecondary: "#16213E", // Slightly lighter dungeon color
      accent: "#6C5CE7",      // Jin-Woo's purple power
      text: "#E6E6FA",        // Light lavender (system text)
      textSecondary: "#9CA3AF", // Gray (like system notifications)
      success: "#00D9FF",     // Bright cyan (mana/power)
      warning: "#FFD700",     // Gold (like level up effects)
      error: "#FF6B6B"        // Red (danger/boss warning)
    },
    unlocked: true,
    icon: "flash",
    statusBarStyle: 'light-content'
  },
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultThemeColors: ThemeColors = fallbackThemes[0].colors

const normalizeThemeColors = (colors?: Partial<ThemeColors>): ThemeColors => ({
  background: colors?.background ?? defaultThemeColors.background,
  card: colors?.card ?? defaultThemeColors.card,
  cardSecondary: colors?.cardSecondary ?? defaultThemeColors.cardSecondary,
  accent: colors?.accent ?? defaultThemeColors.accent,
  text: colors?.text ?? defaultThemeColors.text,
  textSecondary: colors?.textSecondary ?? defaultThemeColors.textSecondary,
  success: colors?.success ?? defaultThemeColors.success,
  warning: colors?.warning ?? defaultThemeColors.warning,
  error: colors?.error ?? defaultThemeColors.error,
})

const normalizeUnlockType = (
  unlockType?: string,
  unlockLevel?: number,
): UnlockType => {
  const normalizedType = `${unlockType || ''}`.trim().toLowerCase()
  if (
    normalizedType === 'none' ||
    normalizedType === 'level' ||
    normalizedType === 'tasks_completed' ||
    normalizedType === 'streak' ||
    normalizedType === 'focus_minutes'
  ) {
    return normalizedType
  }

  return Number(unlockLevel) > 1 ? 'level' : 'none'
}

const buildUnlockRequirement = (unlockType: UnlockType, unlockValue: number) => {
  if (unlockType === 'none') return undefined
  if (unlockType === 'level') return `Reach level ${unlockValue}`
  if (unlockType === 'tasks_completed') return `Complete ${unlockValue} tasks`
  if (unlockType === 'streak') return `Reach a ${unlockValue}-day streak`
  if (unlockType === 'focus_minutes') return `Focus for ${unlockValue} minutes`
  return undefined
}

const evaluateThemeUnlock = (
  unlockType: UnlockType,
  unlockValue: number,
  userProgress: UserProgress,
) => {
  if (unlockType === 'none') return true
  if (unlockType === 'level') return userProgress.level >= unlockValue
  if (unlockType === 'tasks_completed') {
    return userProgress.total_tasks_completed >= unlockValue
  }
  if (unlockType === 'streak') return userProgress.current_streak >= unlockValue
  if (unlockType === 'focus_minutes') return userProgress.focus_minutes >= unlockValue
  return true
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>("dark")
  const [availableThemes, setAvailableThemes] = useState<Theme[]>(fallbackThemes)

  const mapBackendThemes = useCallback((rawThemes: any[], userProgress: UserProgress): Theme[] => {
    return rawThemes
      .map((theme: any) => {
        let parsedColors = theme.colors
        if (typeof parsedColors === 'string') {
          try {
            parsedColors = JSON.parse(parsedColors)
          } catch {
            parsedColors = undefined
          }
        }

        const unlockType = normalizeUnlockType(theme.unlock_type, theme.unlock_level)

        const unlockValue = (() => {
          const rawUnlockValue = Number(theme.unlock_value)
          if (Number.isFinite(rawUnlockValue)) {
            return unlockType === 'none'
              ? 0
              : Math.max(Math.floor(rawUnlockValue), 1)
          }

          const fallbackUnlockLevel = Number(theme.unlock_level)
          if (unlockType === 'level' && Number.isFinite(fallbackUnlockLevel)) {
            return Math.max(Math.floor(fallbackUnlockLevel), 1)
          }

          return unlockType === 'none' ? 0 : 1
        })()

        const unlockRequirement = `${theme.unlock_requirement || ''}`.trim()
        const normalizedColors = normalizeThemeColors(parsedColors)

        return {
          id: theme.theme_id,
          name: theme.name,
          description: unlockRequirement || 'Available in HUBLE',
          category: theme.category,
          colors: normalizedColors,
          unlocked: evaluateThemeUnlock(unlockType, unlockValue, userProgress),
          requirement: unlockRequirement || buildUnlockRequirement(unlockType, unlockValue),
          icon: theme.is_premium ? 'diamond' : 'color-palette',
          unlockType,
          unlockValue,
          visualEffect: (`${theme.visual_effect || 'none'}`.trim().toLowerCase() === 'glow' ? 'glow' : 'none') as VisualEffect,
          statusBarStyle: getStatusBarStyleForBackground(normalizedColors.background),
        }
      })
      .filter((theme) => Boolean(theme.id))
  }, [])

  const refreshThemes = useCallback(async (preferredThemeId?: string | null) => {
    try {
      const [response, statsResponse]: [any, any] = await Promise.all([
        configAPI.getThemes(),
        statsAPI.getStats().catch(() => null),
      ])

      if (!response?.themes?.length) {
        return
      }

      const userProgress: UserProgress = {
        level: Number(statsResponse?.stats?.level) || 1,
        total_tasks_completed: Number(statsResponse?.stats?.total_tasks_completed) || 0,
        current_streak: Number(statsResponse?.stats?.current_streak) || 0,
        focus_minutes: Number(statsResponse?.stats?.focus_minutes) || 0,
      }

      const mappedThemes = mapBackendThemes(response.themes, userProgress)
      if (!mappedThemes.length) {
        return
      }

      setAvailableThemes(mappedThemes)

      setSelectedThemeId((currentThemeId) => {
        const desiredTheme = preferredThemeId || currentThemeId || "dark"
        const desiredThemeData = mappedThemes.find((theme) => theme.id === desiredTheme)
        if (desiredThemeData?.unlocked) {
          return desiredThemeData.id
        }

        const unlockedDarkTheme = mappedThemes.find(
          (theme) => theme.id === "dark" && theme.unlocked,
        )
        if (unlockedDarkTheme) {
          return unlockedDarkTheme.id
        }

        const firstUnlockedTheme = mappedThemes.find((theme) => theme.unlocked)
        return firstUnlockedTheme?.id || mappedThemes[0]?.id || "dark"
      })
    } catch (themeError) {
      console.error("Failed to load themes from backend:", themeError)
    }
  }, [mapBackendThemes])

  // Hydrate from storage immediately, then update from backend in background.
  useEffect(() => {
    let isMounted = true

    const loadThemeState = async () => {
      let savedTheme: string | null = null

      try {
        savedTheme = await AsyncStorage.getItem("selectedTheme")
        console.log("Loaded saved theme:", savedTheme)
        if (isMounted && savedTheme) {
          setSelectedThemeId(savedTheme)
        }
      } catch (storageError) {
        console.error("Failed to load saved theme:", storageError)
      }

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Theme config request timed out")), 4000)
        })

        await Promise.race([
          refreshThemes(savedTheme),
          timeoutPromise,
        ])
      } catch (themeError) {
        console.error("Failed to load themes from backend:", themeError)
      }
    }

    loadThemeState()

    return () => {
      isMounted = false
    }
  }, [])

  const setTheme = async (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    console.log("Setting theme:", themeId, theme) // Debug log
    if (theme && theme.unlocked) {
      setSelectedThemeId(themeId)
      try {
        try {
          await authAPI.updateProfile({ theme: themeId })
        } catch (profileUpdateError) {
          console.error("Failed to persist selected theme to backend:", profileUpdateError)
        }

        await AsyncStorage.setItem("selectedTheme", themeId)
        console.log("Theme saved to storage:", themeId) // Debug log
      } catch (error) {
        console.error("Failed to save theme:", error)
      }
    }
  }

  const currentTheme = availableThemes.find(t => t.id === selectedThemeId) || availableThemes[0]
  const isGlowEnabled = false

  const value: ThemeContextType = {
    currentTheme,
    selectedThemeId,
    themes: availableThemes,
    setTheme,
    refreshThemes,
    colors: currentTheme.colors,
    isGlowEnabled,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export { fallbackThemes as themes }