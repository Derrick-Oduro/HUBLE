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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsContext"

// Mock data for habits - in a real app, this would come from your habits state/database
const habitsList = [
  { id: 1, title: "Read", duration: 30 * 60, color: "green-500" },
  { id: 2, title: "Study", duration: 45 * 60, color: "blue-500" },
  { id: 3, title: "Meditate", duration: 10 * 60, color: "purple-500" },
  { id: 4, title: "Exercise", duration: 20 * 60, color: "red-500" },
]

export default function Timer() {
  // Timer states
  const [time, setTime] = useState(25 * 60) // 25 minutes default
  const [isRunning, setIsRunning] = useState(false)
  const [isWorkSession, setIsWorkSession] = useState(true)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalSessionsToday, setTotalSessionsToday] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // Settings
  const [workTime, setWorkTime] = useState(25 * 60)
  const [breakTime, setBreakTime] = useState(5 * 60)
  const [longBreakTime, setLongBreakTime] = useState(15 * 60)
  const [autoStartEnabled, setAutoStartEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  // UI states
  const [showSettings, setShowSettings] = useState(false)
  const [showHabitSelector, setShowHabitSelector] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [countdownToStart, setCountdownToStart] = useState(0)

  // Stats context
  const { updateFocusSessions } = useStats()

  // Audio reference (mock - would use actual audio API in a real app)
  const audioRef = useRef(null)

  // Default timer preferences
  const defaultTimerPreferences = {
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    autoStartEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  }

  // Reset function
  const resetToTimerDefaults = async () => {
    try {
      // Save default timer preferences to AsyncStorage
      await AsyncStorage.setItem("timerPreferences", JSON.stringify(defaultTimerPreferences))

      // Reset timer stats
      await AsyncStorage.setItem(
        "timerStats",
        JSON.stringify({
          totalSessionsToday: 0,
          streak: 0,
        }),
      )

      // Reset timer settings
      setWorkTime(defaultTimerPreferences.workTime)
      setBreakTime(defaultTimerPreferences.breakTime)
      setLongBreakTime(defaultTimerPreferences.longBreakTime)
      setAutoStartEnabled(defaultTimerPreferences.autoStartEnabled)
      setSoundEnabled(defaultTimerPreferences.soundEnabled)
      setVibrationEnabled(defaultTimerPreferences.vibrationEnabled)

      // Reset timer state
      setTime(defaultTimerPreferences.workTime)
      setIsRunning(false)
      setIsWorkSession(true)
      setSessionCount(0)
      setTotalSessionsToday(0)
      setStreak(0)

      // Update stats context
      updateFocusSessions(0)

      console.log("Reset to default timer settings completed")
    } catch (e) {
      console.error("Failed to reset timer settings:", e)
    }
  }

  // Load timer settings from AsyncStorage
  useEffect(() => {
    const loadTimerSettings = async () => {
      try {
        setLoading(true)

        // Load timer preferences
        const savedPreferences = await AsyncStorage.getItem("timerPreferences")
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences)
          setWorkTime(preferences.workTime)
          setBreakTime(preferences.breakTime)
          setLongBreakTime(preferences.longBreakTime)
          setAutoStartEnabled(preferences.autoStartEnabled)
          setSoundEnabled(preferences.soundEnabled)
          setVibrationEnabled(preferences.vibrationEnabled)

          // Also set the current time if not in a session
          if (!isRunning) {
            setTime(isWorkSession ? preferences.workTime : preferences.breakTime)
          }
        } else {
          // No preferences saved, use defaults
          await resetToTimerDefaults()
        }

        // Load timer stats
        const savedStats = await AsyncStorage.getItem("timerStats")
        if (savedStats) {
          const stats = JSON.parse(savedStats)
          setTotalSessionsToday(stats.totalSessionsToday || 0)
          setStreak(stats.streak || 0)

          // Update stats context
          updateFocusSessions(stats.totalSessionsToday || 0)
        }
      } catch (e) {
        console.error("Failed to load timer settings:", e)
        // Use defaults if there's an error
        setWorkTime(defaultTimerPreferences.workTime)
        setBreakTime(defaultTimerPreferences.breakTime)
        setLongBreakTime(defaultTimerPreferences.longBreakTime)
      } finally {
        setLoading(false)
      }
    }

    loadTimerSettings()
  }, [])

  // Effect for the main timer
  useEffect(() => {
    let interval

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      handleSessionEnd()
    }

    return () => clearInterval(interval)
  }, [isRunning, time])

  // Effect for auto-start countdown
  useEffect(() => {
    let countdownInterval

    if (countdownToStart > 0) {
      countdownInterval = setInterval(() => {
        setCountdownToStart((prev) => {
          if (prev <= 1) {
            setIsRunning(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(countdownInterval)
  }, [countdownToStart])

  // Save timer settings when they change
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

  // Save timer stats when they change
  useEffect(() => {
    const saveTimerStats = async () => {
      try {
        const stats = {
          totalSessionsToday,
          streak,
        }

        await AsyncStorage.setItem("timerStats", JSON.stringify(stats))

        // Update stats context
        updateFocusSessions(totalSessionsToday)
      } catch (e) {
        console.error("Failed to save timer stats:", e)
      }
    }

    saveTimerStats()
  }, [totalSessionsToday, streak])

  const handleSessionEnd = () => {
    setIsRunning(false)

    // Play sound and vibrate if enabled
    if (soundEnabled) {
      // In a real app, you would play a sound here
      console.log("Playing sound alert")
      // Example: audioRef.current.play();
    }

    if (vibrationEnabled) {
      // In a real app, you would trigger vibration here
      console.log("Vibrating")
      // Example: Vibration.vibrate();
    }

    if (isWorkSession) {
      // Work session completed
      const newTotalSessions = totalSessionsToday + 1
      setTotalSessionsToday(newTotalSessions)
      setStreak((prev) => prev + 1)
      setSessionCount((prevCount) => prevCount + 1)

      // Update stats context
      updateFocusSessions(newTotalSessions)

      // Determine next break type
      if (sessionCount === 3) {
        setTime(longBreakTime)
        setSessionCount(0)
      } else {
        setTime(breakTime)
      }
    } else {
      // Break session completed
      setTime(workTime)
      setSelectedHabit(null) // Clear selected habit after break
    }

    setIsWorkSession(!isWorkSession)

    // Auto-start next session after a brief countdown if enabled
    if (autoStartEnabled) {
      setCountdownToStart(5) // 5 second countdown
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
    setCountdownToStart(0) // Cancel any auto-start countdown
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(workTime)
    setIsWorkSession(true)
    setSessionCount(0)
    setSelectedHabit(null)
    setCountdownToStart(0)
  }

  const selectHabit = (habit) => {
    setSelectedHabit(habit)
    setTime(habit.duration)
    setWorkTime(habit.duration)
    setShowHabitSelector(false)
  }

  // Calculate progress percentage
  const progressPercentage = isWorkSession
    ? ((workTime - time) / workTime) * 100
    : ((breakTime - time) / breakTime) * 100

  // Helper function to create circular progress segments
  const getCircularProgressStyles = (percentage) => {
    const size = 256 // Size of the circle in pixels
    const strokeWidth = 8 // Width of the progress stroke
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return {
      size,
      radius,
      strokeWidth,
      circumference,
      strokeDashoffset,
    }
  }

  const progressStyles = getCircularProgressStyles(progressPercentage)

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-6 pb-4`}>
        {/* Header with edit button */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {selectedHabit ? selectedHabit.title : isWorkSession ? "Focus Time" : "Break Time"}
          </Text>
          <TouchableOpacity style={tw`p-2`} onPress={() => setShowSettings(true)}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Streak display */}
        <View style={tw`bg-gray-800 rounded-xl p-3 mb-6`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-white font-medium`}>Today's Sessions:</Text>
            <Text style={tw`text-white font-bold`}>{totalSessionsToday}</Text>
          </View>
          <View style={tw`flex-row justify-between items-center mt-1`}>
            <Text style={tw`text-white font-medium`}>Current Streak:</Text>
            <Text style={tw`text-white font-bold`}>{streak} 🔥</Text>
          </View>
        </View>

        {/* Timer display */}
        <View style={tw`items-center`}>
          <View
            style={tw`w-64 h-64 rounded-full bg-gray-800 flex justify-center items-center shadow-lg mb-4 relative overflow-hidden`}
          >
            {/* SVG-like circular progress indicator */}
            <View
              style={{
                position: "absolute",
                width: progressStyles.size,
                height: progressStyles.size,
                borderRadius: progressStyles.size / 2,
                borderWidth: progressStyles.strokeWidth,
                borderColor: "transparent",
                borderTopColor: "#8B5CF6", // Violet color
                transform: [{ rotate: `-90deg` }],
                opacity: progressPercentage > 0 ? 1 : 0,
                // This creates a rotation animation as the progress increases
                transform: [{ rotateZ: `-${90 - progressPercentage * 3.6}deg` }],
              }}
            />

            {/* Additional segments to create a more complete circle */}
            {progressPercentage > 25 && (
              <View
                style={{
                  position: "absolute",
                  width: progressStyles.size,
                  height: progressStyles.size,
                  borderRadius: progressStyles.size / 2,
                  borderWidth: progressStyles.strokeWidth,
                  borderColor: "transparent",
                  borderRightColor: "#8B5CF6",
                  transform: [{ rotate: `0deg` }],
                }}
              />
            )}

            {progressPercentage > 50 && (
              <View
                style={{
                  position: "absolute",
                  width: progressStyles.size,
                  height: progressStyles.size,
                  borderRadius: progressStyles.size / 2,
                  borderWidth: progressStyles.strokeWidth,
                  borderColor: "transparent",
                  borderBottomColor: "#8B5CF6",
                  transform: [{ rotate: `0deg` }],
                }}
              />
            )}

            {progressPercentage > 75 && (
              <View
                style={{
                  position: "absolute",
                  width: progressStyles.size,
                  height: progressStyles.size,
                  borderRadius: progressStyles.size / 2,
                  borderWidth: progressStyles.strokeWidth,
                  borderColor: "transparent",
                  borderLeftColor: "#8B5CF6",
                  transform: [{ rotate: `0deg` }],
                }}
              />
            )}

            <Text style={tw`text-6xl font-bold text-white`}>{formatTime(time)}</Text>
            <Text style={tw`text-lg text-gray-400 mt-2`}>
              {isWorkSession ? `Session ${sessionCount + 1} / 4` : "Break"}
            </Text>

            {/* Auto-start countdown */}
            {countdownToStart > 0 && (
              <View style={tw`absolute bottom-4 bg-violet-600 px-3 py-1 rounded-full`}>
                <Text style={tw`text-white font-bold`}>Starting in {countdownToStart}...</Text>
              </View>
            )}
          </View>

          {/* Control buttons */}
          <View style={tw`flex-row justify-center items-center mb-6`}>
            <TouchableOpacity style={tw`mx-2 p-4 bg-violet-600 rounded-full shadow-lg`} onPress={toggleTimer}>
              <Ionicons name={isRunning ? "pause" : "play"} size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={tw`mx-2 p-4 bg-gray-700 rounded-full shadow-lg`} onPress={resetTimer}>
              <Ionicons name="refresh" size={32} color="white" />
            </TouchableOpacity>
          </View>

          {/* Habit selection button - only show during work sessions and when not running */}
          {isWorkSession && !isRunning && (
            <TouchableOpacity
              style={tw`bg-gray-800 py-3 px-6 rounded-xl mb-6 flex-row items-center`}
              onPress={() => setShowHabitSelector(true)}
            >
              <Ionicons name="list-outline" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-medium`}>
                {selectedHabit ? `Change Habit (${selectedHabit.title})` : "Select a Habit"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info section */}
        <View style={tw`bg-gray-800 rounded-xl p-4 shadow-lg mt-auto`}>
          <Text style={tw`text-white text-center mb-2`}>Pomodoro Technique</Text>
          <Text style={tw`text-gray-400 text-center`}>
            Work for 25 minutes, then take a 5-minute break.
            {"\n"}
            After 4 sessions, take a longer 15-minute break.
          </Text>
        </View>
      </View>
      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-white text-2xl font-bold`}>Timer Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4`}>
              {/* Time settings */}
              <Text style={tw`text-white text-lg font-bold mb-2`}>Time Settings (minutes)</Text>

              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-white`}>Work Session:</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setWorkTime((prev) => Math.max(prev - 60, 60))}
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={tw`text-white mx-3`}>{Math.floor(workTime / 60)}</Text>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setWorkTime((prev) => prev + 60)}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-white`}>Short Break:</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setBreakTime((prev) => Math.max(prev - 60, 60))}
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={tw`text-white mx-3`}>{Math.floor(breakTime / 60)}</Text>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setBreakTime((prev) => prev + 60)}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={tw`text-white`}>Long Break:</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setLongBreakTime((prev) => Math.max(prev - 60, 60))}
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={tw`text-white mx-3`}>{Math.floor(longBreakTime / 60)}</Text>
                  <TouchableOpacity
                    style={tw`bg-gray-700 w-8 h-8 rounded-full items-center justify-center`}
                    onPress={() => setLongBreakTime((prev) => prev + 60)}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Other settings */}
              <Text style={tw`text-white text-lg font-bold mb-2`}>Preferences</Text>

              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-white`}>Auto-start next session</Text>
                <Switch
                  value={autoStartEnabled}
                  onValueChange={setAutoStartEnabled}
                  trackColor={{ false: "#767577", true: "#8B5CF6" }}
                  thumbColor={autoStartEnabled ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-white`}>Sound alerts</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: "#767577", true: "#8B5CF6" }}
                  thumbColor={soundEnabled ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>

              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-white`}>Vibration</Text>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: "#767577", true: "#8B5CF6" }}
                  thumbColor={vibrationEnabled ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={tw`bg-violet-600 p-4 rounded-lg`}
              onPress={() => {
                // Apply settings
                if (!isRunning) {
                  setTime(isWorkSession ? workTime : breakTime)
                }
                setShowSettings(false)
              }}
            >
              <Text style={tw`text-white text-center font-bold`}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      ;
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHabitSelector}
        onRequestClose={() => setShowHabitSelector(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-white text-2xl font-bold`}>Select a Habit</Text>
              <TouchableOpacity onPress={() => setShowHabitSelector(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4 max-h-80`}>
              {habitsList.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={tw`flex-row items-center p-4 bg-gray-700 rounded-lg mb-2 border-l-4 border-${habit.color}`}
                  onPress={() => selectHabit(habit)}
                >
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold`}>{habit.title}</Text>
                    <Text style={tw`text-gray-400`}>{Math.floor(habit.duration / 60)} minutes</Text>
                  </View>
                  <Ionicons name="timer-outline" size={24} color="white" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={() => setShowHabitSelector(false)}>
              <Text style={tw`text-white text-center`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

