"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

interface Theme {
  id: string
  name: string
  description: string
  category: string
  colors: ThemeColors
  unlocked: boolean
  requirement?: string
  icon: string
}

interface ThemeContextType {
  currentTheme: Theme
  selectedThemeId: string
  themes: Theme[]
  setTheme: (themeId: string) => Promise<void>
  colors: ThemeColors
}

const themes: Theme[] = [
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
    icon: "moon"
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
    icon: "sunny"
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
    icon: "water"
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
    icon: "leaf"
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
    icon: "sunset"
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
    icon: "diamond"
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
    icon: "flash"
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
    icon: "rose"
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
    icon: "document-text"
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
    icon: "library"
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
    icon: "book"
  },
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>("dark")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved theme on app start
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("selectedTheme")
        console.log("Loaded saved theme:", savedTheme) // Debug log
        if (savedTheme && themes.find(t => t.id === savedTheme)) {
          setSelectedThemeId(savedTheme)
        }
      } catch (error) {
        console.error("Failed to load saved theme:", error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadSavedTheme()
  }, [])

  const setTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    console.log("Setting theme:", themeId, theme) // Debug log
    if (theme && theme.unlocked) {
      setSelectedThemeId(themeId)
      try {
        await AsyncStorage.setItem("selectedTheme", themeId)
        console.log("Theme saved to storage:", themeId) // Debug log
      } catch (error) {
        console.error("Failed to save theme:", error)
      }
    }
  }

  const currentTheme = themes.find(t => t.id === selectedThemeId) || themes[0]

  const value: ThemeContextType = {
    currentTheme,
    selectedThemeId,
    themes,
    setTheme,
    colors: currentTheme.colors
  }

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null
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

export { themes }