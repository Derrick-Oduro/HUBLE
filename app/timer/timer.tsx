"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  Vibration,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

// Mock data for habits
const habitsList = [
  { id: 1, title: "📚 Deep Work", duration: 50 * 60, color: "#3B82F6", emoji: "📚" },
  { id: 2, title: "📖 Reading", duration: 30 * 60, color: "#10B981", emoji: "📖" },
  { id: 3, title: "🧘 Meditation", duration: 15 * 60, color: "#8B5CF6", emoji: "🧘" },
  { id: 4, title: "💪 Exercise", duration: 25 * 60, color: "#EF4444", emoji: "💪" },
  { id: 5, title: "🎨 Creative Work", duration: 45 * 60, color: "#F59E0B", emoji: "🎨" },
  { id: 6, title: "📝 Writing", duration: 40 * 60, color: "#EC4899", emoji: "📝" },
]

export default function Timer() {
  const { colors } = useTheme()
  
  // Timer states
  const [time, setTime] = useState(25 * 60)
  const [originalTime, setOriginalTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isWorkSession, setIsWorkSession] = useState(true)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalSessionsToday, setTotalSessionsToday] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // Settings
  const [workTime, setWorkTime] = useState(25 * 60)
  const [breakTime, setBreakTime] = useState(5 * 60)
  const [longBreakTime, setLongBreakTime] = useState(15 * 60)
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  // UI states
  const [showSettings, setShowSettings] = useState(false)
  const [showHabitSelector, setShowHabitSelector] = useState(false)
  const [showTimeEditor, setShowTimeEditor] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [countdownToStart, setCountdownToStart] = useState(0)

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Stats context
  const { stats, updateFocusSessions, updateFocusTime, updateExperience } = useStats()

  // Default preferences
  const defaultTimerPreferences = {
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    autoStartEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  }

  // Load timer settings
  useEffect(() => {
    const loadTimerSettings = async () => {
      try {
        setLoading(true)

        const savedPreferences = await AsyncStorage.getItem("timerPreferences")
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences)
          setWorkTime(preferences.workTime || defaultTimerPreferences.workTime)
          setBreakTime(preferences.breakTime || defaultTimerPreferences.breakTime)
          setLongBreakTime(preferences.longBreakTime || defaultTimerPreferences.longBreakTime)
          setAutoStartEnabled(preferences.autoStartEnabled ?? defaultTimerPreferences.autoStartEnabled)
          setSoundEnabled(preferences.soundEnabled ?? defaultTimerPreferences.soundEnabled)
          setVibrationEnabled(preferences.vibrationEnabled ?? defaultTimerPreferences.vibrationEnabled)

          if (!isRunning) {
            const initialTime = preferences.workTime || defaultTimerPreferences.workTime
            setTime(initialTime)
            setOriginalTime(initialTime)
          }
        } else {
          setTime(defaultTimerPreferences.workTime)
          setOriginalTime(defaultTimerPreferences.workTime)
        }

        const savedStats = await AsyncStorage.getItem("timerStats")
        if (savedStats) {
          const stats = JSON.parse(savedStats)
          setTotalSessionsToday(stats.totalSessionsToday || 0)
          setStreak(stats.streak || 0)
          updateFocusSessions(stats.totalSessionsToday || 0)
        }
      } catch (e) {
        console.error("Failed to load timer settings:", e)
      } finally {
        setLoading(false)
      }
    }

    loadTimerSettings()
  }, [])

  // Timer countdown effect
  useEffect(() => {
    let interval

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0 && isRunning) {
      handleSessionEnd()
    }

    return () => clearInterval(interval)
  }, [isRunning, time])

  // Auto-start countdown
  useEffect(() => {
    let countdownInterval

    if (countdownToStart > 0) {
      countdownInterval = setInterval(() => {
        setCountdownToStart((prev) => {
          if (prev <= 1) {
            setIsRunning(true)
            setIsPaused(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(countdownInterval)
  }, [countdownToStart])

  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isRunning])

  // Save preferences
  useEffect(() => {
    const saveTimerPreferences = async () => {
      try {
        const preferences = {
          workTime,
          breakTime,
          longBreakTime,
          autoStartEnabled,
          soundEnabled,
          vibrationEnabled,
        }
        await AsyncStorage.setItem("timerPreferences", JSON.stringify(preferences))
      } catch (e) {
        console.error("Failed to save timer preferences:", e)
      }
    }

    saveTimerPreferences()
  }, [workTime, breakTime, longBreakTime, autoStartEnabled, soundEnabled, vibrationEnabled])

  // Save stats
  useEffect(() => {
    const saveTimerStats = async () => {
      try {
        const stats = { totalSessionsToday, streak }
        await AsyncStorage.setItem("timerStats", JSON.stringify(stats))
        updateFocusSessions(totalSessionsToday)
      } catch (e) {
        console.error("Failed to save timer stats:", e)
      }
    }

    saveTimerStats()
  }, [totalSessionsToday, streak])

  const handleSessionEnd = () => {
    setIsRunning(false)
    setIsPaused(false)

    // Haptic feedback
    if (vibrationEnabled) {
      Vibration.vibrate([0, 500, 200, 500])
    }

    if (isWorkSession) {
      // Work session completed - award XP and update stats
      const sessionMinutes = Math.ceil(originalTime / 60)
      const xpGain = sessionMinutes * 2 // 2 XP per minute
      
      updateExperience(xpGain)
      updateFocusTime(sessionMinutes)
      
      const newTotalSessions = totalSessionsToday + 1
      setTotalSessionsToday(newTotalSessions)
      setStreak((prev) => prev + 1)
      setSessionCount((prevCount) => prevCount + 1)

      // Determine next break type
      if ((sessionCount + 1) % 4 === 0) {
        setTime(longBreakTime)
        setOriginalTime(longBreakTime)
      } else {
        setTime(breakTime)
        setOriginalTime(breakTime)
      }
    } else {
      // Break session completed
      setTime(workTime)
      setOriginalTime(workTime)
      setSelectedHabit(null)
    }

    setIsWorkSession(!isWorkSession)

    // Auto-start if enabled
    if (autoStartEnabled) {
      setCountdownToStart(3)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false)
      setIsPaused(true)
    } else {
      setIsRunning(true)
      setIsPaused(false)
      setCountdownToStart(0)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    const resetTime = selectedHabit ? selectedHabit.duration : workTime
    setTime(resetTime)
    setOriginalTime(resetTime)
    setIsWorkSession(true)
    setSessionCount(0)
    setCountdownToStart(0)
  }

  const selectHabit = (habit) => {
    setSelectedHabit(habit)
    setTime(habit.duration)
    setOriginalTime(habit.duration)
    setWorkTime(habit.duration)
    setShowHabitSelector(false)
  }

  // Handle timer tap for editing
  const handleTimerTap = () => {
    if (!isRunning) {
      setShowTimeEditor(true)
    }
  }

  // Update time from editor
  const updateTimeFromEditor = (newTimeInMinutes) => {
    const newTimeInSeconds = newTimeInMinutes * 60
    setTime(newTimeInSeconds)
    setOriginalTime(newTimeInSeconds)
    
    if (isWorkSession) {
      setWorkTime(newTimeInSeconds)
    }
    
    setShowTimeEditor(false)
  }

  // Calculate progress
  const progressPercentage = originalTime > 0 ? ((originalTime - time) / originalTime) * 100 : 0
  const circumference = 2 * Math.PI * 120 // radius of 120
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading timer...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-5 pt-6 pb-4`}>
        
        {/* Modern Header */}
        <View style={tw`flex-row justify-between items-center mb-8`}>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-3xl font-bold mb-1`, { color: colors.text }]}>
              {selectedHabit ? selectedHabit.title : isWorkSession ? "🎯 Focus Time" : "☕ Break Time"}
            </Text>
            <Text style={[tw`text-base`, { color: colors.textSecondary }]}>
              {isWorkSession ? `Session ${sessionCount + 1}` : "Recharge & relax"}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              tw`p-3 rounded-xl`,
              { backgroundColor: colors.card }
            ]} 
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={tw`flex-row mb-8`}>
          <View style={[tw`flex-1 rounded-2xl p-4 mr-2`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row items-center mb-2`}>
              <Text style={tw`text-2xl mr-2`}>🔥</Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Streak</Text>
            </View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{streak}</Text>
          </View>
          
          <View style={[tw`flex-1 rounded-2xl p-4 ml-2`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row items-center mb-2`}>
              <Text style={tw`text-2xl mr-2`}>⏱️</Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Today</Text>
            </View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{totalSessionsToday}</Text>
          </View>
        </View>

        {/* Main Timer Circle */}
        <View style={tw`items-center mb-8`}>
          <TouchableOpacity 
            onPress={handleTimerTap}
            style={tw`items-center justify-center`}
            disabled={isRunning}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                tw`w-80 h-80 rounded-full items-center justify-center relative`,
                {
                  backgroundColor: colors.card,
                  transform: [{ scale: pulseAnim }],
                  shadowColor: selectedHabit?.color || colors.accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isRunning ? 0.3 : 0.1,
                  shadowRadius: 20,
                  elevation: 10,
                }
              ]}
            >
              {/* Progress Circle */}
              <View style={tw`absolute inset-4`}>
                <View
                  style={{
                    width: 288,
                    height: 288,
                    borderRadius: 144,
                    borderWidth: 8,
                    borderColor: colors.cardSecondary,
                    position: 'absolute',
                  }}
                />
                {progressPercentage > 0 && (
                  <View
                    style={{
                      width: 288,
                      height: 288,
                      borderRadius: 144,
                      borderWidth: 8,
                      borderColor: 'transparent',
                      borderTopColor: selectedHabit?.color || colors.accent,
                      position: 'absolute',
                      transform: [
                        { rotate: '-90deg' },
                        { rotateZ: `${(progressPercentage * 3.6)}deg` }
                      ],
                    }}
                  />
                )}
              </View>

              {/* Timer Content */}
              <View style={tw`items-center justify-center`}>
                <Text style={[
                  tw`text-6xl font-bold mb-2`,
                  { color: selectedHabit?.color || colors.text }
                ]}>
                  {formatTime(time)}
                </Text>
                
                {!isRunning && (
                  <Text style={[tw`text-base mb-2`, { color: colors.textSecondary }]}>
                    Tap to edit time
                  </Text>
                )}
                
                {selectedHabit && (
                  <View style={tw`items-center`}>
                    <Text style={[tw`text-lg font-semibold`, { color: colors.text }]}>
                      {selectedHabit.title}
                    </Text>
                  </View>
                )}
                
                {countdownToStart > 0 && (
                  <View style={[
                    tw`absolute -bottom-8 px-4 py-2 rounded-xl`,
                    { backgroundColor: selectedHabit?.color || colors.accent }
                  ]}>
                    <Text style={tw`text-white font-bold`}>
                      Starting in {countdownToStart}...
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View style={tw`flex-row justify-center items-center mb-8`}>
          <TouchableOpacity 
            style={[
              tw`w-16 h-16 rounded-full items-center justify-center mx-4`,
              { backgroundColor: colors.card }
            ]} 
            onPress={resetTimer}
          >
            <Ionicons name="refresh-outline" size={28} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              tw`w-20 h-20 rounded-full items-center justify-center mx-4`,
              { 
                backgroundColor: selectedHabit?.color || colors.accent,
                shadowColor: selectedHabit?.color || colors.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]} 
            onPress={toggleTimer}
          >
            <Ionicons 
              name={isRunning ? "pause" : isPaused ? "play" : "play"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              tw`w-16 h-16 rounded-full items-center justify-center mx-4`,
              { backgroundColor: colors.card }
            ]} 
            onPress={() => setShowHabitSelector(true)}
          >
            <Ionicons name="list-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Action Cards */}
        {!isRunning && (
          <View style={tw`mb-6`}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Quick Start</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`-mx-1`}>
              {[
                { title: "Pomodoro", time: 25, color: "#EF4444", emoji: "🍅" },
                { title: "Short Focus", time: 15, color: "#F59E0B", emoji: "⚡" },
                { title: "Deep Work", time: 50, color: "#3B82F6", emoji: "🎯" },
                { title: "Quick Task", time: 10, color: "#10B981", emoji: "⚡" },
              ].map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`rounded-xl p-4 mx-1 items-center`,
                    { backgroundColor: colors.card, minWidth: 100 }
                  ]}
                  onPress={() => {
                    const newTime = preset.time * 60
                    setTime(newTime)
                    setOriginalTime(newTime)
                    setWorkTime(newTime)
                    setSelectedHabit({ 
                      title: preset.title, 
                      duration: newTime, 
                      color: preset.color, 
                      emoji: preset.emoji 
                    })
                  }}
                >
                  <Text style={tw`text-2xl mb-1`}>{preset.emoji}</Text>
                  <Text style={[tw`text-sm font-semibold`, { color: colors.text }]}>{preset.title}</Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>{preset.time}m</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats Integration */}
        <View style={[tw`rounded-2xl p-4`, { backgroundColor: colors.card }]}>
          <Text style={[tw`text-lg font-bold mb-3`, { color: colors.text }]}>Progress Today</Text>
          
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw``, { color: colors.textSecondary }]}>Focus Sessions</Text>
            <Text style={[tw`font-semibold`, { color: colors.text }]}>{stats.focusSessionsToday}</Text>
          </View>
          
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw``, { color: colors.textSecondary }]}>Total Focus Time</Text>
            <Text style={[tw`font-semibold`, { color: colors.text }]}>{stats.totalFocusTime}m</Text>
          </View>
          
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={[tw``, { color: colors.textSecondary }]}>XP Earned</Text>
            <Text style={[tw`font-semibold`, { color: colors.accent }]}>+{stats.totalFocusTime * 2} XP</Text>
          </View>
        </View>

      </ScrollView>

      {/* Time Editor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeEditor}
        onRequestClose={() => setShowTimeEditor(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
          <View style={[tw`rounded-3xl p-6 mx-8`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-2xl font-bold text-center mb-6`, { color: colors.text }]}>Set Timer</Text>
            
            <View style={tw`items-center mb-6`}>
              <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>Minutes</Text>
              <View style={tw`flex-row items-center justify-center`}>
                <TouchableOpacity
                  style={[
                    tw`w-12 h-12 rounded-full items-center justify-center`,
                    { backgroundColor: colors.cardSecondary }
                  ]}
                  onPress={() => {
                    const currentMinutes = Math.floor(time / 60)
                    if (currentMinutes > 1) {
                      updateTimeFromEditor(currentMinutes - 1)
                    }
                  }}
                >
                  <Ionicons name="remove" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={[tw`text-4xl font-bold mx-8`, { color: colors.text }]}>
                  {Math.floor(time / 60)}
                </Text>
                
                <TouchableOpacity
                  style={[
                    tw`w-12 h-12 rounded-full items-center justify-center`,
                    { backgroundColor: colors.cardSecondary }
                  ]}
                  onPress={() => {
                    const currentMinutes = Math.floor(time / 60)
                    updateTimeFromEditor(currentMinutes + 1)
                  }}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick time presets */}
            <View style={tw`flex-row flex-wrap justify-center mb-6`}>
              {[5, 10, 15, 25, 30, 45, 50, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    tw`px-4 py-2 rounded-xl m-1`,
                    { 
                      backgroundColor: Math.floor(time / 60) === minutes ? colors.accent : colors.cardSecondary
                    }
                  ]}
                  onPress={() => updateTimeFromEditor(minutes)}
                >
                  <Text style={[
                    tw`font-semibold`,
                    { color: Math.floor(time / 60) === minutes ? "white" : colors.text }
                  ]}>
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={tw`flex-row`}>
              <TouchableOpacity
                style={[tw`flex-1 py-3 rounded-xl mr-2`, { backgroundColor: colors.cardSecondary }]}
                onPress={() => setShowTimeEditor(false)}
              >
                <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[tw`flex-1 py-3 rounded-xl ml-2`, { backgroundColor: colors.accent }]}
                onPress={() => setShowTimeEditor(false)}
              >
                <Text style={tw`text-white text-center font-semibold`}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Timer Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4 max-h-80`}>
              {/* Default Times */}
              <View style={tw`mb-6`}>
                <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Default Times</Text>
                
                {[
                  { label: "Work Session", value: workTime, setter: setWorkTime },
                  { label: "Short Break", value: breakTime, setter: setBreakTime },
                  { label: "Long Break", value: longBreakTime, setter: setLongBreakTime }
                ].map((item, index) => (
                  <View key={index} style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={[tw``, { color: colors.text }]}>{item.label}</Text>
                    <View style={tw`flex-row items-center`}>
                      <TouchableOpacity
                        style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                        onPress={() => item.setter(prev => Math.max(prev - 60, 60))}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={[tw`mx-4 min-w-12 text-center`, { color: colors.text }]}>
                        {Math.floor(item.value / 60)}m
                      </Text>
                      <TouchableOpacity
                        style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                        onPress={() => item.setter(prev => prev + 60)}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Preferences */}
              <View style={tw`mb-6`}>
                <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Preferences</Text>
                
                {[
                  { 
                    label: "Auto-start sessions", 
                    desc: "Automatically start next session", 
                    value: autoStartEnabled, 
                    setter: setAutoStartEnabled 
                  },
                  { 
                    label: "Sound alerts", 
                    desc: "Play sound when session ends", 
                    value: soundEnabled, 
                    setter: setSoundEnabled 
                  },
                  { 
                    label: "Vibration", 
                    desc: "Vibrate when session ends", 
                    value: vibrationEnabled, 
                    setter: setVibrationEnabled 
                  }
                ].map((setting, index) => (
                  <View key={index} style={tw`flex-row justify-between items-center mb-4`}>
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={[tw`font-medium`, { color: colors.text }]}>{setting.label}</Text>
                      <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{setting.desc}</Text>
                    </View>
                    <Switch
                      value={setting.value}
                      onValueChange={setting.setter}
                      trackColor={{ false: colors.cardSecondary, true: colors.accent }}
                      thumbColor={setting.value ? "#f4f3f4" : "#f4f3f4"}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[tw`py-4 rounded-xl`, { backgroundColor: colors.accent }]}
              onPress={() => {
                if (!isRunning) {
                  setTime(isWorkSession ? workTime : breakTime)
                  setOriginalTime(isWorkSession ? workTime : breakTime)
                }
                setShowSettings(false)
              }}
            >
              <Text style={tw`text-white text-center font-bold`}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Habit Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHabitSelector}
        onRequestClose={() => setShowHabitSelector(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Choose Focus</Text>
              <TouchableOpacity onPress={() => setShowHabitSelector(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4 max-h-80`}>
              {habitsList.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    tw`flex-row items-center p-4 rounded-2xl mb-3`,
                    { 
                      backgroundColor: colors.cardSecondary,
                      borderLeftWidth: 4,
                      borderLeftColor: habit.color
                    }
                  ]}
                  onPress={() => selectHabit(habit)}
                >
                  <Text style={tw`text-4xl mr-4`}>{habit.emoji}</Text>
                  <View style={tw`flex-1`}>
                    <Text style={[tw`font-bold text-lg`, { color: colors.text }]}>{habit.title}</Text>
                    <Text style={[tw``, { color: colors.textSecondary }]}>{Math.floor(habit.duration / 60)} minutes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[tw`py-4 rounded-xl`, { backgroundColor: colors.cardSecondary }]} 
              onPress={() => setShowHabitSelector(false)}
            >
              <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
