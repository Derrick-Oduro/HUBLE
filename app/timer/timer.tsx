"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from 'expo-av'
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"

import { focusAPI, dailiesAPI, routinesAPI } from "../../lib/api"

// Keep your existing habits list exactly as is
const habitsList = [
  { id: 1, title: "Deep Work", duration: 50 * 60, color: "#3B82F6", icon: "book" },
  { id: 2, title: "Reading", duration: 30 * 60, color: "#10B981", icon: "book-outline" },
  { id: 3, title: "Meditation", duration: 15 * 60, color: "#8B5CF6", icon: "flower" },
  { id: 4, title: "Exercise", duration: 25 * 60, color: "#EF4444", icon: "fitness" },
  { id: 5, title: "Creative Work", duration: 45 * 60, color: "#F59E0B", icon: "color-palette" },
  { id: 6, title: "Writing", duration: 40 * 60, color: "#EC4899", icon: "create" },
]

// Ambient sound URLs - YouTube Audio Library free sounds
const ambientSounds = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3', // Rain
  waves: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3', // Ocean waves  
  forest: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3', // Forest ambience
  whitenoise: 'https://assets.mixkit.co/active_storage/sfx/2398/2398-preview.mp3', // White noise
  cafe: 'https://assets.mixkit.co/active_storage/sfx/2460/2460-preview.mp3', // Cafe
  fireplace: 'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3', // Fireplace
}

export default function Timer() {
  const { colors, currentTheme } = useTheme()
  
  // Add this state to track the current preset
  const [currentPreset, setCurrentPreset] = useState(null)
  
  // Keep ALL your existing state exactly as is
  const [time, setTime] = useState(25 * 60)
  const [originalTime, setOriginalTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [, setIsPaused] = useState(false)
  const [isWorkSession, setIsWorkSession] = useState(true)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalSessionsToday, setTotalSessionsToday] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [workTime, setWorkTime] = useState(25 * 60)
  const [breakTime, setBreakTime] = useState(5 * 60)
  const [longBreakTime, setLongBreakTime] = useState(15 * 60)
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showHabitSelector, setShowHabitSelector] = useState(false)
  const [showTimeEditor, setShowTimeEditor] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [countdownToStart, setCountdownToStart] = useState(0)
  
  // NEW FEATURES STATE
  const [showSessionNotes, setShowSessionNotes] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')
  const [completedSessionData, setCompletedSessionData] = useState(null)
  const [customPresets, setCustomPresets] = useState([])
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [dailyFocusGoal, setDailyFocusGoal] = useState(120) // default 2 hours in minutes
  const [totalFocusToday, setTotalFocusToday] = useState(0)
  const [sessionHistory, setSessionHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  
  // Simple break tip state
  const [consecutiveSessions, setConsecutiveSessions] = useState(0)
  const BREAK_TIP_THRESHOLD = 3
  
  // Streak Visualization State
  const [showStreakView, setShowStreakView] = useState(false)
  const [activityData, setActivityData] = useState({}) // { 'YYYY-MM-DD': { sessions: 0, minutes: 0 } }
  
  // Task Linking State
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [linkedTask, setLinkedTask] = useState(null)
  const [userDailies, setUserDailies] = useState([])
  const [userRoutines, setUserRoutines] = useState([])
  
  // Background Sounds State
  const [backgroundSoundEnabled, setBackgroundSoundEnabled] = useState(false)
  const [selectedSound, setSelectedSound] = useState('none')
  const [soundVolume, setSoundVolume] = useState(0.5)
  const soundRef = useRef(null)

  // Keep your animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Keep your stats context
  const { updateFocusSessions, updateFocusTime, updateExperience } = useStats()

  // Keep ALL your existing functions and useEffects EXACTLY the same
  const defaultTimerPreferences = {
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    autoStartEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  }

  // Keep ALL your useEffects exactly as they are...
  useEffect(() => {
    const loadTimerSettings = async () => {
      try {
        setLoading(true)
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')

        if (token && isGuest !== 'true') {
          console.log('🔄 Loading timer preferences from backend...')
          try {
            const response = await focusAPI.getPreferences()
            
            if (response.success && response.preferences) {
              const prefs = response.preferences
              setWorkTime(prefs.work_duration || defaultTimerPreferences.workTime)
              setBreakTime(prefs.short_break || defaultTimerPreferences.breakTime)
              setLongBreakTime(prefs.long_break || defaultTimerPreferences.longBreakTime)
              setAutoStartEnabled(prefs.auto_start ?? defaultTimerPreferences.autoStartEnabled)
              setSoundEnabled(prefs.sound_enabled ?? defaultTimerPreferences.soundEnabled)
              setVibrationEnabled(prefs.vibration_enabled ?? defaultTimerPreferences.vibrationEnabled)

              if (!isRunning) {
                const initialTime = prefs.work_duration || defaultTimerPreferences.workTime
                setTime(initialTime)
                setOriginalTime(initialTime)
              }

              console.log('✅ Timer preferences loaded from backend')
              
              const preferencesToCache = {
                workTime: prefs.work_duration || defaultTimerPreferences.workTime,
                breakTime: prefs.short_break || defaultTimerPreferences.breakTime,
                longBreakTime: prefs.long_break || defaultTimerPreferences.longBreakTime,
                autoStartEnabled: prefs.auto_start ?? defaultTimerPreferences.autoStartEnabled,
                soundEnabled: prefs.sound_enabled ?? defaultTimerPreferences.soundEnabled,
                vibrationEnabled: prefs.vibration_enabled ?? defaultTimerPreferences.vibrationEnabled
              }
              await AsyncStorage.setItem("timerPreferences", JSON.stringify(preferencesToCache))
              
            } else {
              throw new Error('No backend preferences found')
            }
          } catch (error) {
            console.log('❌ Backend preferences failed, loading from local:', error.message)
            
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
          }
        } else {
          console.log('📱 Loading timer preferences locally (guest mode)')
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
        setTime(defaultTimerPreferences.workTime)
        setOriginalTime(defaultTimerPreferences.workTime)
      } finally {
        setLoading(false)
      }
    }

    loadTimerSettings()
  }, [])
  
  // Load custom presets, daily goal, and session history
  useEffect(() => {
    const loadFocusData = async () => {
      try {
        // Load custom presets
        const savedPresets = await AsyncStorage.getItem("customTimerPresets")
        if (savedPresets) {
          setCustomPresets(JSON.parse(savedPresets))
        }
        
        // Load daily focus goal
        const savedGoal = await AsyncStorage.getItem("dailyFocusGoal")
        if (savedGoal) {
          setDailyFocusGoal(parseInt(savedGoal))
        }
        
        // Load today's focus time
        const savedFocusTime = await AsyncStorage.getItem("todayFocusTime")
        const todayDate = new Date().toDateString()
        if (savedFocusTime) {
          const focusData = JSON.parse(savedFocusTime)
          if (focusData.date === todayDate) {
            setTotalFocusToday(focusData.minutes)
          } else {
            // New day, reset
            await AsyncStorage.setItem("todayFocusTime", JSON.stringify({ date: todayDate, minutes: 0 }))
            setTotalFocusToday(0)
          }
        }
        
        // Load session history (last 7 days)
        const savedHistory = await AsyncStorage.getItem("sessionHistory")
        if (savedHistory) {
          setSessionHistory(JSON.parse(savedHistory))
        }
        
        // Load activity data for streak calendar
        const savedActivityData = await AsyncStorage.getItem("activityData")
        if (savedActivityData) {
          setActivityData(JSON.parse(savedActivityData))
        }
      } catch (error) {
        console.error("Failed to load focus data:", error)
      }
    }
    
    loadFocusData()
  }, [])
  
  // Load user tasks (dailies and routines) for task linking
  useEffect(() => {
    const loadUserTasks = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')
        
        if (token && isGuest !== 'true') {
          const [dailies, routines] = await Promise.all([
            dailiesAPI.getDailies(),
            routinesAPI.getRoutines()
          ])
          
          setUserDailies(dailies || [])
          setUserRoutines(routines || [])
        }
      } catch (error) {
        console.error('Failed to load user tasks:', error)
      }
    }
    
    loadUserTasks()
  }, [])

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

        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')

        if (token && isGuest !== 'true') {
          console.log('☁️ Syncing timer preferences to backend...')
          try {
            const response = await focusAPI.syncPreferences(preferences)
            if (response.success) {
              console.log('✅ Timer preferences synced to backend')
            }
          } catch (error) {
            console.error('❌ Failed to sync preferences to backend:', error)
          }
        }
      } catch (e) {
        console.error("Failed to save timer preferences:", e)
      }
    }

    if (workTime > 0) {
      saveTimerPreferences()
    }
  }, [workTime, breakTime, longBreakTime, autoStartEnabled, soundEnabled, vibrationEnabled])

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
  
  // Audio playback effect
  useEffect(() => {
    const playSound = async () => {
      try {
        // Set audio mode for background playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        })
        
        if (backgroundSoundEnabled && isRunning && selectedSound && ambientSounds[selectedSound]) {
          console.log('🎵 Loading ambient sound:', selectedSound)
          
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: ambientSounds[selectedSound] },
            { 
              isLooping: true, 
              volume: soundVolume,
              shouldPlay: true
            }
          )

          soundRef.current = newSound
          
          console.log('✅ Sound playing')
        }
      } catch (error) {
        console.error('❌ Failed to play sound:', error)
        Alert.alert(
          'Audio Error',
          'Failed to load ambient sound. Please check your connection or try a different sound.'
        )
      }
    }
    
    const stopSound = async () => {
      try {
        if (soundRef.current) {
          console.log('⏹️ Stopping sound')
          await soundRef.current.stopAsync()
          await soundRef.current.unloadAsync()
          soundRef.current = null
        }
      } catch (error) {
        console.error('Failed to stop sound:', error)
      }
    }
    
    if (backgroundSoundEnabled && isRunning && selectedSound) {
      playSound()
    } else {
      stopSound()
    }
    
    // Cleanup on unmount or when dependencies change
    return () => {
      stopSound()
    }
  }, [isRunning, backgroundSoundEnabled, selectedSound])
  
  // Update volume when it changes
  useEffect(() => {
    const updateVolume = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.setVolumeAsync(soundVolume)
        }
      } catch (error) {
        console.error('Failed to update volume:', error)
      }
    }
    
    updateVolume()
  }, [soundVolume])

  // Keep ALL your existing functions exactly the same
  const handleSessionEnd = async () => {
    setIsRunning(false)
    setIsPaused(false)

    if (vibrationEnabled) {
      Vibration.vibrate([0, 500, 200, 500])
    }

    if (isWorkSession) {
      const actualMinutes = Math.ceil((originalTime - time) / 60)
      const xpGain = actualMinutes * 2
      const coinsGain = Math.floor(actualMinutes / 5) + 1
      
      updateExperience(xpGain)
      updateFocusTime(actualMinutes)
      
      const newTotalSessions = totalSessionsToday + 1
      setTotalSessionsToday(newTotalSessions)
      setStreak((prev) => prev + 1)
      setSessionCount((prevCount) => prevCount + 1)
      
      // Track consecutive work sessions for break suggestions
      const newConsecutive = consecutiveSessions + 1
      setConsecutiveSessions(newConsecutive)
      
      // Track focus time for daily goal
      setTotalFocusToday(prev => prev + actualMinutes)

      // Store session data for notes modal
      const sessionData = {
        type: 'work',
        duration: actualMinutes,
        xpGained: xpGain,
        coinsGained: coinsGain,
        timestamp: new Date().toISOString(),
        habit: selectedHabit?.title || 'Focus Session',
        habitColor: selectedHabit?.color || colors.accent,
        linkedTask: linkedTask ? {
          id: linkedTask.id,
          type: linkedTask.type,
          title: linkedTask.title
        } : null
      }
      
      setCompletedSessionData(sessionData)
      
      // Show session notes modal
      setShowSessionNotes(true)

      try {
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')

        if (token && isGuest !== 'true') {
          console.log('📊 Recording focus session to backend...')
          
          const backendSessionData = {
            session_type: 'work',
            duration_planned: originalTime,
            duration_actual: originalTime - time,
            habit_id: selectedHabit?.id || null,
            focus_topic: selectedHabit?.title || 'Focus Session',
            completed: true,
            experience_gained: xpGain,
            coins_gained: coinsGain
          }

          const response = await focusAPI.recordSession(backendSessionData)
          
          if (response.success) {
            console.log('✅ Focus session recorded successfully')
          }
        }
      } catch (error) {
        console.error('❌ Failed to record session, continuing offline:', error)
      }

      if ((sessionCount + 1) % 4 === 0) {
        setTime(longBreakTime)
        setOriginalTime(longBreakTime)
      } else {
        setTime(breakTime)
        setOriginalTime(breakTime)
      }
    } else {
      try {
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')

        if (token && isGuest !== 'true') {
          const breakData = {
            session_type: 'break',
            duration_planned: originalTime,
            duration_actual: originalTime - time,
            completed: true,
            experience_gained: 5,
            coins_gained: 1
          }

          await focusAPI.recordSession(breakData)
          console.log('✅ Break session recorded')
        }
      } catch (error) {
        console.error('❌ Failed to record break session:', error)
      }

      setTime(workTime)
      setOriginalTime(workTime)
      setSelectedHabit(null)
      
      // Reset consecutive sessions after a break
      setConsecutiveSessions(0)
    }

    setIsWorkSession(!isWorkSession)

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
    // Don't clear currentPreset here so it shows after reset
  }

  const selectHabit = (habit) => {
    setSelectedHabit(habit)
    setTime(habit.duration)
    setOriginalTime(habit.duration)
    setWorkTime(habit.duration)
    setCurrentPreset(null) // Clear preset when selecting a habit
    setShowHabitSelector(false)
  }

  const handleTimerTap = () => {
    if (!isRunning) {
      setShowTimeEditor(true)
    }
  }

  const updateTimeFromEditor = (totalSeconds) => {
    setTime(totalSeconds)
    setOriginalTime(totalSeconds)
    
    if (isWorkSession) {
      setWorkTime(totalSeconds)
    }
    
    setShowTimeEditor(false)
  }

  const progressPercentage = originalTime > 0 ? ((originalTime - time) / originalTime) * 100 : 0
  
  // NEW FEATURE HANDLERS
  const saveSessionNotes = async() => {
    try {
      if (completedSessionData) {
        const sessionWithNotes = {
          ...completedSessionData,
          notes: sessionNotes.trim(),
          id: Date.now()
        }
        
        // Add to history
        const updatedHistory = [sessionWithNotes, ...sessionHistory].slice(0, 50) // Keep last 50
        setSessionHistory(updatedHistory)
        await AsyncStorage.setItem("sessionHistory", JSON.stringify(updatedHistory))
        
        // Save today's focus time
        const todayDate = new Date().toDateString()
        await AsyncStorage.setItem("todayFocusTime", JSON.stringify({ 
          date: todayDate, 
          minutes: totalFocusToday 
        }))
        
        // Update activity data for streak calendar
        const dateKey = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const updatedActivityData = {
          ...activityData,
          [dateKey]: {
            sessions: (activityData[dateKey]?.sessions || 0) + 1,
            minutes: (activityData[dateKey]?.minutes || 0) + sessionWithNotes.duration
          }
        }
        setActivityData(updatedActivityData)
        await AsyncStorage.setItem("activityData", JSON.stringify(updatedActivityData))
      }
      
      setSessionNotes('')
      setShowSessionNotes(false)
      setCompletedSessionData(null)
    } catch (error) {
      console.error("Failed to save session notes:", error)
    }
  }
  
  const skipSessionNotes = () => {
    if (completedSessionData) {
      const sessionWithoutNotes = {
        ...completedSessionData,
        notes: '',
        id: Date.now()
      }
      
      const updatedHistory = [sessionWithoutNotes, ...sessionHistory].slice(0, 50)
      setSessionHistory(updatedHistory)
      AsyncStorage.setItem("sessionHistory", JSON.stringify(updatedHistory))
    }
    
    setSessionNotes('')
    setShowSessionNotes(false)
    setCompletedSessionData(null)
  }
  
  const addCustomPreset = async (title, minutes) => {
    try {
      const newPreset = {
        id: Date.now(),
        title,
        time: minutes,
        icon: "time"
      }
      
      const updatedPresets = [...customPresets, newPreset]
      setCustomPresets(updatedPresets)
      await AsyncStorage.setItem("customTimerPresets", JSON.stringify(updatedPresets))
      setShowAddPreset(false)
    } catch (error) {
      console.error("Failed to add custom preset:", error)
    }
  }
  
  const deleteCustomPreset = async (id) => {
    try {
      const updatedPresets = customPresets.filter(p => p.id !== id)
      setCustomPresets(updatedPresets)
      await AsyncStorage.setItem("customTimerPresets", JSON.stringify(updatedPresets))
    } catch (error) {
      console.error("Failed to delete preset:", error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.statusBarStyle} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4 text-base`, { color: colors.textSecondary }]}>Loading timer...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      
      <ScrollView 
        style={tw`flex-1`} 
        contentContainerStyle={tw`px-5 pt-4 pb-4`}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Clean Header - Updated to show focus activity + preset */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View style={tw`flex-1`}>
            {selectedHabit ? (
              <Text style={[tw`text-2xl font-bold mb-0.5`, { color: colors.text }]}>
                {selectedHabit.title}
              </Text>
            ) : (
              <View style={tw`flex-row items-center mb-0.5`}>
                <Ionicons 
                  name={isWorkSession ? "target" : "cafe"} 
                  size={24} 
                  color={colors.accent} 
                  style={tw`mr-2`} 
                />
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
                  {isWorkSession ? "Focus Time" : "Break Time"}
                </Text>
              </View>
            )}
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {selectedHabit && currentPreset ? 
                `${currentPreset.time} minute ${currentPreset.title.toLowerCase()} session` :
               currentPreset && !selectedHabit ? 
                `${currentPreset.time} minute ${currentPreset.title.toLowerCase()} session` :
               isWorkSession ? `Session ${sessionCount + 1}` : "Time to recharge"}
            </Text>
          </View>
          <View style={tw`flex-row items-center`}>
            {backgroundSoundEnabled && isRunning && selectedSound !== 'none' && (
              <View style={[tw`px-2 py-1 rounded-lg mr-2 flex-row items-center`, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="volume-medium" size={16} color={colors.accent} />
                <Text style={[tw`text-xs ml-1 font-semibold`, { color: colors.accent }]}>
                  {selectedSound}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={[
                tw`p-2 rounded-xl`,
                { backgroundColor: colors.card }
              ]} 
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={tw`flex-row justify-between mb-4`}>
          <TouchableOpacity 
            style={[tw`flex-1 rounded-xl p-3 mr-2 items-center`, { backgroundColor: colors.card }]}
            onPress={() => setShowStreakView(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="flame" size={20} color="#F59E0B" style={tw`mb-0.5`} />
            <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{streak}</Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Streak</Text>
          </TouchableOpacity>
          
          <View style={[tw`flex-1 rounded-xl p-3 ml-2 items-center`, { backgroundColor: colors.card }]}>
            <Text style={tw`text-xl mb-0.5`}>⏱️</Text>
            <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{totalSessionsToday}</Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Sessions Today</Text>
          </View>
        </View>

        {consecutiveSessions >= BREAK_TIP_THRESHOLD && (
          <View style={[tw`rounded-xl p-3 mb-4 flex-row items-start`, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning} style={tw`mr-2 mt-0.5`} />
            <Text style={[tw`text-sm leading-5 flex-1`, { color: colors.textSecondary }]}>
              Tip: after {BREAK_TIP_THRESHOLD} consecutive Pomodoros, take a short break to stay sharp.
            </Text>
          </View>
        )}
        
        {/* Daily Focus Goal */}
        <View style={[tw`rounded-xl p-3 mb-4`, { backgroundColor: colors.card }]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw`font-semibold`, { color: colors.text }]}>
              Today&apos;s Focus
            </Text>
            <Text style={[tw`text-sm font-bold`, { color: colors.accent }]}>
              {totalFocusToday}/{dailyFocusGoal} min
            </Text>
          </View>
          <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
            <View 
              style={[
                tw`h-full rounded-full`,
                { 
                  backgroundColor: totalFocusToday >= dailyFocusGoal ? colors.success : colors.accent,
                  width: `${Math.min((totalFocusToday / dailyFocusGoal) * 100, 100)}%`
                }
              ]} 
            />
          </View>
        </View>

        {/* Main Timer Circle */}
        <View style={tw`items-center mb-4`}>
          <TouchableOpacity 
            onPress={handleTimerTap}
            disabled={isRunning}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                tw`w-72 h-72 rounded-full items-center justify-center`,
                {
                  backgroundColor: colors.card,
                  transform: [{ scale: pulseAnim }],
                  shadowColor: selectedHabit?.color || colors.accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 10,
                }
              ]}
            >
              {/* Simple Progress Ring */}
              <View style={tw`absolute inset-4`}>
                <View
                  style={{
                    width: 256,
                    height: 256,
                    borderRadius: 128,
                    borderWidth: 5,
                    borderColor: colors.cardSecondary,
                  }}
                />
                {progressPercentage > 0 && (
                  <View
                    style={{
                      width: 256,
                      height: 256,
                      borderRadius: 128,
                      borderWidth: 5,
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

              {/* Timer Display */}
              <View style={tw`items-center`}>
                {/* Show focus activity icon if selected */}
                {selectedHabit && (
                  <Ionicons name={selectedHabit.icon} size={40} color={selectedHabit.color} style={tw`mb-1.5`} />
                )}
                
                <Text style={[
                  tw`text-5xl font-bold mb-1.5`,
                  { 
                    color: selectedHabit?.color || colors.text,
                    fontFamily: 'monospace',
                  }
                ]}>
                  {formatTime(time)}
                </Text>
                
                {/* Show preset name under timer */}
                {currentPreset && !isRunning && (
                  <Text style={[tw`text-base font-semibold mb-0.5`, { color: colors.accent }]}>
                    {currentPreset.title}
                  </Text>
                )}
                
                {!isRunning && (
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                    Tap to edit time
                  </Text>
                )}
                
                {countdownToStart > 0 && (
                  <Text style={[tw`text-base font-bold mt-1.5`, { color: colors.accent }]}>
                    Starting in {countdownToStart}...
                  </Text>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View style={tw`flex-row justify-center items-center mb-4`}>
          <TouchableOpacity 
            style={[
              tw`w-14 h-14 rounded-full items-center justify-center mx-3`,
              { backgroundColor: colors.card }
            ]} 
            onPress={resetTimer}
          >
            <Ionicons name="refresh-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              tw`w-16 h-16 rounded-full items-center justify-center mx-3`,
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
              name={isRunning ? "pause" : "play"} 
              size={28} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              tw`w-14 h-14 rounded-full items-center justify-center mx-3`,
              { backgroundColor: colors.card }
            ]} 
            onPress={() => setShowHabitSelector(true)}
          >
            <Ionicons name="list-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Presets - Keep as the main selection */}
        {!isRunning && (
          <View>
            <Text style={[tw`text-base font-bold mb-3`, { color: colors.text }]}>
              {selectedHabit ? `${selectedHabit.title} Sessions` : 'Quick Start'}
            </Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {[
                { title: "Pomodoro", time: 25, icon: "timer" },
                { title: "Short", time: 15, icon: "flash" },
                { title: "Deep Work", time: 50, icon: "briefcase" },
                { title: "Quick", time: 10, icon: "time" },
              ].map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`rounded-xl p-3 items-center mb-2`,
                    { 
                      backgroundColor: currentPreset?.title === preset.title ? colors.accent + '20' : colors.card, 
                      width: '48%',
                      borderWidth: currentPreset?.title === preset.title ? 2 : 0,
                      borderColor: currentPreset?.title === preset.title ? colors.accent : 'transparent'
                    }
                  ]}
                  onPress={() => {
                    const newTime = preset.time * 60
                    setTime(newTime)
                    setOriginalTime(newTime)
                    setWorkTime(newTime)
                    setCurrentPreset(preset)
                  }}
                >
                  <Ionicons 
                    name={preset.icon} 
                    size={24} 
                    color={currentPreset?.title === preset.title ? colors.accent : colors.text} 
                    style={tw`mb-1.5`} 
                  />
                  <Text style={[
                    tw`font-semibold text-sm`, 
                    { color: currentPreset?.title === preset.title ? colors.accent : colors.text }
                  ]}>
                    {preset.title}
                  </Text>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>{preset.time}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Presets */}
            {customPresets.length > 0 && (
              <>
                <Text style={[tw`text-sm font-bold mt-3 mb-2`, { color: colors.textSecondary }]}>
                  Custom Presets
                </Text>
                <View style={tw`flex-row flex-wrap justify-between`}>
                  {customPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        tw`rounded-xl p-3 items-center mb-2 relative`,
                        { 
                          backgroundColor: currentPreset?.id === preset.id ? colors.accent + '20' : colors.card, 
                          width: '48%',
                          borderWidth: currentPreset?.id === preset.id ? 2 : 0,
                          borderColor: currentPreset?.id === preset.id ? colors.accent : 'transparent'
                        }
                      ]}
                      onPress={() => {
                        const newTime = preset.time * 60
                        setTime(newTime)
                        setOriginalTime(newTime)
                        setWorkTime(newTime)
                        setCurrentPreset(preset)
                      }}
                      onLongPress={() => {
                        Alert.alert(
                          "Delete Preset",
                          `Delete "${preset.title}"?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteCustomPreset(preset.id) }
                          ]
                        )
                      }}
                    >
                      <Ionicons 
                        name={preset.icon} 
                        size={24} 
                        color={currentPreset?.id === preset.id ? colors.accent : colors.text} 
                        style={tw`mb-1.5`} 
                      />
                      <Text style={[
                        tw`font-semibold text-sm`, 
                        { color: currentPreset?.id === preset.id ? colors.accent : colors.text }
                      ]} numberOfLines={1}>
                        {preset.title}
                      </Text>
                      <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>{preset.time}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            {/* Quick Actions */}
            <View style={tw`flex-row justify-between mt-3`}>
              <TouchableOpacity
                style={[tw`flex-1 py-2 rounded-xl mr-1 flex-row items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                onPress={() => setShowAddPreset(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.text} />
                <Text style={[tw`ml-1 text-xs font-semibold`, { color: colors.text }]}>Add Preset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[tw`flex-1 py-2 rounded-xl mx-1 flex-row items-center justify-center`, { 
                  backgroundColor: linkedTask ? colors.accent + '30' : colors.cardSecondary 
                }]}
                onPress={() => setShowTaskSelector(true)}
              >
                <Ionicons 
                  name={linkedTask ? "link" : "link-outline"} 
                  size={16} 
                  color={linkedTask ? colors.accent : colors.text} 
                />
                <Text style={[tw`ml-1 text-xs font-semibold`, { 
                  color: linkedTask ? colors.accent : colors.text 
                }]}>
                  {linkedTask ? 'Linked' : 'Link Task'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[tw`flex-1 py-2 rounded-xl ml-1 flex-row items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
                onPress={() => setShowHistory(true)}
              >
                <Ionicons name="stats-chart-outline" size={16} color={colors.text} />
                <Text style={[tw`ml-1 text-xs font-semibold`, { color: colors.text }]}>History</Text>
              </TouchableOpacity>
            </View>
            
            {/* Show linked task if any */}
            {linkedTask && (
              <View style={[tw`mt-3 p-3 rounded-xl flex-row items-center`, { backgroundColor: colors.accent + '10' }]}>
                <Ionicons 
                  name={linkedTask.type === 'daily' ? "checkbox" : "repeat"} 
                  size={20} 
                  color={colors.accent} 
                  style={tw`mr-2`}
                />
                <Text style={[tw`flex-1 font-semibold`, { color: colors.text }]}>
                  {linkedTask.title}
                </Text>
                <TouchableOpacity onPress={() => setLinkedTask(null)}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Keep ALL your existing modals exactly the same */}
      {/* Time Editor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeEditor}
        onRequestClose={() => setShowTimeEditor(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center px-6`}>
          <View style={[tw`rounded-3xl p-6 w-full max-w-sm`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-2xl font-bold text-center mb-6`, { color: colors.text }]}>Set Timer</Text>
            
            {/* Scrollable Time Picker */}
            <View style={tw`items-center mb-6`}>
              <View style={tw`flex-row items-center justify-center`}>
                {/* Hours Picker */}
                <View style={tw`items-center mx-2`}>
                  <View style={[tw`h-32 w-20 rounded-xl overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      snapToInterval={40}
                      decelerationRate="fast"
                      contentContainerStyle={tw`py-12`}
                      onMomentumScrollEnd={(e) => {
                        const hours = Math.round(e.nativeEvent.contentOffset.y / 40)
                        const currentMinutes = Math.floor(time / 60) % 60
                        const currentSeconds = time % 60
                        const totalSeconds = (hours * 3600) + (currentMinutes * 60) + currentSeconds
                        setTime(totalSeconds)
                        setOriginalTime(totalSeconds)
                        if (isWorkSession) setWorkTime(totalSeconds)
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <TouchableOpacity key={i} style={tw`h-10 justify-center items-center`}>
                          <Text style={[
                            tw`text-2xl font-bold`,
                            { color: Math.floor(time / 3600) === i ? colors.accent : colors.textSecondary }
                          ]}>
                            {String(i).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={[tw`text-xs mt-2 font-semibold`, { color: colors.textSecondary }]}>Hours</Text>
                </View>

                <Text style={[tw`text-3xl font-bold mx-1`, { color: colors.text }]}>:</Text>

                {/* Minutes Picker */}
                <View style={tw`items-center mx-2`}>
                  <View style={[tw`h-32 w-20 rounded-xl overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      snapToInterval={40}
                      decelerationRate="fast"
                      contentContainerStyle={tw`py-12`}
                      onMomentumScrollEnd={(e) => {
                        const minutes = Math.round(e.nativeEvent.contentOffset.y / 40)
                        const currentHours = Math.floor(time / 3600)
                        const currentSeconds = time % 60
                        const totalSeconds = (currentHours * 3600) + (minutes * 60) + currentSeconds
                        setTime(totalSeconds)
                        setOriginalTime(totalSeconds)
                        if (isWorkSession) setWorkTime(totalSeconds)
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <TouchableOpacity key={i} style={tw`h-10 justify-center items-center`}>
                          <Text style={[
                            tw`text-2xl font-bold`,
                            { color: Math.floor(time / 60) % 60 === i ? colors.accent : colors.textSecondary }
                          ]}>
                            {String(i).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={[tw`text-xs mt-2 font-semibold`, { color: colors.textSecondary }]}>Minutes</Text>
                </View>

                <Text style={[tw`text-3xl font-bold mx-1`, { color: colors.text }]}>:</Text>

                {/* Seconds Picker */}
                <View style={tw`items-center mx-2`}>
                  <View style={[tw`h-32 w-20 rounded-xl overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      snapToInterval={40}
                      decelerationRate="fast"
                      contentContainerStyle={tw`py-12`}
                      onMomentumScrollEnd={(e) => {
                        const seconds = Math.round(e.nativeEvent.contentOffset.y / 40)
                        const currentHours = Math.floor(time / 3600)
                        const currentMinutes = Math.floor(time / 60) % 60
                        const totalSeconds = (currentHours * 3600) + (currentMinutes * 60) + seconds
                        setTime(totalSeconds)
                        setOriginalTime(totalSeconds)
                        if (isWorkSession) setWorkTime(totalSeconds)
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <TouchableOpacity key={i} style={tw`h-10 justify-center items-center`}>
                          <Text style={[
                            tw`text-2xl font-bold`,
                            { color: time % 60 === i ? colors.accent : colors.textSecondary }
                          ]}>
                            {String(i).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={[tw`text-xs mt-2 font-semibold`, { color: colors.textSecondary }]}>Seconds</Text>
                </View>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={[tw`text-xs font-semibold mb-2`, { color: colors.textSecondary }]}>QUICK PRESETS</Text>
            <View style={tw`flex-row flex-wrap justify-between mb-6`}>
              {[5, 10, 15, 25, 30, 45, 50, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    tw`px-3 py-2 rounded-xl mb-2`,
                    { 
                      backgroundColor: Math.floor(time / 60) === minutes && time % 60 === 0 ? colors.accent : colors.cardSecondary,
                      width: '23%'
                    }
                  ]}
                  onPress={() => updateTimeFromEditor(minutes * 60)}
                >
                  <Text style={[
                    tw`font-semibold text-xs text-center`,
                    { color: Math.floor(time / 60) === minutes && time % 60 === 0 ? "white" : colors.text }
                  ]}>
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row`}>
              <TouchableOpacity
                style={[tw`flex-1 py-3 rounded-xl mr-2`, { backgroundColor: colors.cardSecondary }]}
                onPress={() => {
                  setShowTimeEditor(false)
                }}
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
              <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4 max-h-80`}>
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
                  },
                  { 
                    label: "Background sounds", 
                    desc: "Play ambient sounds during focus", 
                    value: backgroundSoundEnabled, 
                    setter: setBackgroundSoundEnabled 
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
                
                {/* Background Sound Selection */}
                {backgroundSoundEnabled && (
                  <View style={tw`mt-4 pt-4 border-t border-gray-700`}>
                    <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Ambient Sound</Text>
                    <View style={tw`flex-row flex-wrap`}>
                      {[
                        { id: 'rain', label: 'Rain', icon: 'rainy' },
                        { id: 'waves', label: 'Ocean', icon: 'water' },
                        { id: 'forest', label: 'Forest', icon: 'leaf' },
                        { id: 'whitenoise', label: 'White Noise', icon: 'radio' },
                        { id: 'cafe', label: 'Café', icon: 'cafe' },
                        { id: 'fireplace', label: 'Fireplace', icon: 'flame' }
                      ].map((sound) => (
                        <TouchableOpacity
                          key={sound.id}
                          style={[
                            tw`px-3 py-2 rounded-xl mb-2 mr-2 flex-row items-center`,
                            { 
                              backgroundColor: selectedSound === sound.id ? colors.accent : colors.cardSecondary,
                              minWidth: '30%'
                            }
                          ]}
                          onPress={() => setSelectedSound(sound.id)}
                        >
                          <Ionicons 
                            name={sound.icon} 
                            size={16} 
                            color={selectedSound === sound.id ? "white" : colors.text} 
                            style={tw`mr-1`}
                          />
                          <Text style={[
                            tw`font-semibold text-xs`,
                            { color: selectedSound === sound.id ? "white" : colors.text }
                          ]}>
                            {sound.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Volume Control */}
                    <View style={tw`mt-3`}>
                      <View style={tw`flex-row justify-between items-center mb-2`}>
                        <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Volume</Text>
                        <Text style={[tw`text-sm font-bold`, { color: colors.text }]}>
                          {Math.round(soundVolume * 100)}%
                        </Text>
                      </View>
                      <View style={tw`flex-row items-center`}>
                        <Ionicons name="volume-low" size={20} color={colors.textSecondary} />
                        <View style={tw`flex-1 mx-3`}>
                          <View style={[tw`h-2 rounded-full`, { backgroundColor: colors.cardSecondary }]}>
                            <View 
                              style={[
                                tw`h-full rounded-full`,
                                { 
                                  backgroundColor: colors.accent,
                                  width: `${soundVolume * 100}%`
                                }
                              ]} 
                            />
                          </View>
                        </View>
                        <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
                      </View>
                      <View style={tw`flex-row justify-between mt-2`}>
                        {[0.25, 0.5, 0.75, 1].map((vol) => (
                          <TouchableOpacity
                            key={vol}
                            style={[
                              tw`px-2 py-1 rounded`,
                              { backgroundColor: soundVolume === vol ? colors.accent + '30' : 'transparent' }
                            ]}
                            onPress={() => setSoundVolume(vol)}
                          >
                            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                              {vol * 100}%
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
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

      {/* Habit Selector Modal - Keep this for the list button */}
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
                  <Ionicons name={habit.icon} size={40} color={habit.color} style={tw`mr-4`} />
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
      
      {/* Task Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTaskSelector}
        onRequestClose={() => setShowTaskSelector(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={[tw`rounded-t-3xl p-6 max-h-3/4`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Link to Task</Text>
              <TouchableOpacity onPress={() => setShowTaskSelector(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={tw`mb-4`} showsVerticalScrollIndicator={false}>
              {/* Clear Selection */}
              {linkedTask && (
                <TouchableOpacity
                  style={[tw`flex-row items-center p-4 rounded-2xl mb-3`, { backgroundColor: colors.cardSecondary }]}
                  onPress={() => {
                    setLinkedTask(null)
                    setShowTaskSelector(false)
                  }}
                >
                  <Ionicons name="close-circle" size={32} color={colors.textSecondary} style={tw`mr-4`} />
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>Clear Task Link</Text>
                </TouchableOpacity>
              )}
              
              {/* Dailies */}
              {userDailies.length > 0 && (
                <>
                  <Text style={[tw`text-sm font-bold mb-3 mt-2`, { color: colors.textSecondary }]}>DAILIES</Text>
                  {userDailies.map((daily) => (
                    <TouchableOpacity
                      key={`daily-${daily.id}`}
                      style={[
                        tw`flex-row items-center p-4 rounded-2xl mb-3`,
                        { 
                          backgroundColor: linkedTask?.id === `daily-${daily.id}` ? colors.accent + '20' : colors.cardSecondary,
                          borderLeftWidth: 3,
                          borderLeftColor: daily.priority === 'high' ? '#EF4444' : daily.priority === 'medium' ? '#F59E0B' : '#10B981'
                        }
                      ]}
                      onPress={() => {
                        setLinkedTask({ id: `daily-${daily.id}`, type: 'daily', title: daily.title, data: daily })
                        setShowTaskSelector(false)
                      }}
                    >
                      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: colors.accent + '20' }]}>
                        <Ionicons name="checkbox" size={24} color={colors.accent} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[tw`font-semibold`, { color: colors.text }]}>{daily.title}</Text>
                        <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                          {daily.priority} priority
                        </Text>
                      </View>
                      {linkedTask?.id === `daily-${daily.id}` && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
              
              {/* Routines */}
              {userRoutines.length > 0 && (
                <>
                  <Text style={[tw`text-sm font-bold mb-3 mt-4`, { color: colors.textSecondary }]}>ROUTINES</Text>
                  {userRoutines.map((routine) => (
                    <TouchableOpacity
                      key={`routine-${routine.id}`}
                      style={[
                        tw`flex-row items-center p-4 rounded-2xl mb-3`,
                        { 
                          backgroundColor: linkedTask?.id === `routine-${routine.id}` ? colors.accent + '20' : colors.cardSecondary,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.success
                        }
                      ]}
                      onPress={() => {
                        setLinkedTask({ id: `routine-${routine.id}`, type: 'routine', title: routine.title, data: routine })
                        setShowTaskSelector(false)
                      }}
                    >
                      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="repeat" size={24} color={colors.success} />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[tw`font-semibold`, { color: colors.text }]}>{routine.title}</Text>
                        <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                          {routine.tasks?.length || 0} tasks
                        </Text>
                      </View>
                      {linkedTask?.id === `routine-${routine.id}` && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
              
              {userDailies.length === 0 && userRoutines.length === 0 && (
                <View style={tw`items-center py-8`}>
                  <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
                  <Text style={[tw`mt-4 text-center`, { color: colors.textSecondary }]}>
                    No tasks found. Create dailies or routines to link them to your focus sessions.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Session Notes Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSessionNotes}
        onRequestClose={skipSessionNotes}
      >
        <KeyboardAvoidingView 
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
            <View style={[tw`rounded-3xl p-6 mx-6 w-11/12`, { backgroundColor: colors.card }]}>
              <View style={tw`items-center mb-4`}>
                <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-3`, { backgroundColor: completedSessionData?.habitColor || colors.accent + '20' }]}>
                  <Ionicons name="checkmark-circle" size={40} color={completedSessionData?.habitColor || colors.accent} />
                </View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Session Complete!</Text>
                <Text style={[tw`text-center mt-1`, { color: colors.textSecondary }]}>
                  {completedSessionData?.duration} min • +{completedSessionData?.xpGained} XP • +{completedSessionData?.coinsGained} Coins
                </Text>
              </View>
              
              <Text style={[tw`font-semibold mb-2`, { color: colors.text }]}>
                What did you accomplish?
              </Text>
              <TextInput
                style={[
                  tw`rounded-xl p-3 mb-4 min-h-24`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    textAlignVertical: 'top'
                  }
                ]}
                placeholder="Write your accomplishments..."
                placeholderTextColor={colors.textSecondary}
                value={sessionNotes}
                onChangeText={setSessionNotes}
                multiline
                autoFocus
              />
              
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity 
                  style={[tw`flex-1 py-3 rounded-xl mr-2`, { backgroundColor: colors.cardSecondary }]} 
                  onPress={skipSessionNotes}
                >
                  <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[tw`flex-1 py-3 rounded-xl ml-2`, { backgroundColor: colors.accent }]} 
                  onPress={saveSessionNotes}
                >
                  <Text style={[tw`text-center font-semibold text-white`]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Streak Visualization Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStreakView}
        onRequestClose={() => setShowStreakView(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={[tw`rounded-t-3xl p-6 h-5/6`, { backgroundColor: colors.card }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Activity Streak</Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Your focus journey</Text>
              </View>
              <TouchableOpacity onPress={() => setShowStreakView(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Streak Stats */}
            <View style={tw`flex-row justify-around mb-6`}>
              <View style={tw`items-center`}>
                <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-2`, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name="flame" size={32} color="#F59E0B" />
                </View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>{streak}</Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Day Streak</Text>
              </View>
              
              <View style={tw`items-center`}>
                <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-2`, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="calendar" size={32} color={colors.success} />
                </View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
                  {Object.keys(activityData).length}
                </Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Active Days</Text>
              </View>
              
              <View style={tw`items-center`}>
                <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-2`, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name="timer" size={32} color={colors.accent} />
                </View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
                  {Object.values(activityData).reduce((sum, day) => sum + (day.minutes || 0), 0)}
                </Text>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Total Minutes</Text>
              </View>
            </View>
            
            {/* Calendar Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[tw`text-sm font-bold mb-3`, { color: colors.text }]}>Last 90 Days</Text>
              
              {/* Day labels */}
              <View style={tw`flex-row justify-around mb-2`}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Text key={day} style={[tw`text-xs w-8 text-center`, { color: colors.textSecondary }]}>
                    {day}
                  </Text>
                ))}
              </View>
              
              {/* Calendar Days - last 90 days */}
              <View style={tw`flex-row flex-wrap`}>
                {Array.from({ length: 90 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (89 - i))
                  const dateKey = date.toISOString().split('T')[0]
                  const dayData = activityData[dateKey]
                  const hasActivity = !!dayData
                  const intensity = hasActivity 
                    ? Math.min(dayData.minutes / 30, 4) // Max intensity at 120 minutes
                    : 0
                  
                  // Determine color based on intensity
                  let backgroundColor = colors.cardSecondary
                  if (intensity > 0) {
                    const opacities = ['20', '40', '60', '80', 'FF']
                    const opacityIndex = Math.floor(intensity)
                    backgroundColor = colors.accent + opacities[Math.min(opacityIndex, 4)]
                  }
                  
                  return (
                    <View key={dateKey} style={tw`w-1/7 p-0.5`}>
                      <View 
                        style={[
                          tw`w-full aspect-square rounded`,
                          { 
                            backgroundColor,
                            borderWidth: dateKey === new Date().toISOString().split('T')[0] ? 2 : 0,
                            borderColor: colors.accent
                          }
                        ]}
                      >
                        {hasActivity && (
                          <View style={tw`flex-1 items-center justify-center`}>
                            <Text style={[tw`text-xs font-bold`, { color: 'white' }]}>
                              {dayData.sessions}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
              
              {/* Legend */}
              <View style={[tw`mt-6 p-4 rounded-xl`, { backgroundColor: colors.cardSecondary }]}>
                <Text style={[tw`text-xs font-bold mb-2`, { color: colors.text }]}>Activity Level</Text>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Less</Text>
                  <View style={tw`flex-row`}>
                    {[0, 1, 2, 3, 4].map((level) => {
                      const opacities = ['20', '40', '60', '80', 'FF']
                      return (
                        <View 
                          key={level}
                          style={[
                            tw`w-6 h-6 rounded mx-0.5`,
                            { backgroundColor: level === 0 ? colors.cardSecondary : colors.accent + opacities[level - 1] }
                          ]}
                        />
                      )
                    })}
                  </View>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>More</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add Custom Preset Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddPreset}
        onRequestClose={() => setShowAddPreset(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
          <View style={[tw`rounded-3xl p-6 mx-6 w-11/12`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-2xl font-bold mb-4`, { color: colors.text }]}>Add Custom Preset</Text>
            
            <Text style={[tw`font-semibold mb-2`, { color: colors.text }]}>Preset Name</Text>
            <TextInput
              style={[
                tw`rounded-xl p-3 mb-4`,
                {
                  backgroundColor: colors.cardSecondary,
                  color: colors.text
                }
              ]}
              placeholder="e.g., Study Session"
              placeholderTextColor={colors.textSecondary}
              value={sessionNotes}
              onChangeText={setSessionNotes}
            />
            
            <Text style={[tw`font-semibold mb-2`, { color: colors.text }]}>Duration (minutes)</Text>
            <View style={tw`flex-row flex-wrap justify-between mb-4`}>
              {[20, 30, 40, 45, 60, 90].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    tw`rounded-xl p-3 mb-2`,
                    { 
                      backgroundColor: colors.cardSecondary, 
                      width: '31%'
                    }
                  ]}
                  onPress={() => {
                    addCustomPreset(sessionNotes || `${minutes} min`, minutes)
                  }}
                >
                  <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>{minutes}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[tw`py-3 rounded-xl`, { backgroundColor: colors.cardSecondary }]} 
              onPress={() => {
                setSessionNotes('')
                setShowAddPreset(false)
              }}
            >
              <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Session History Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      >
        <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
          <View style={[tw`flex-row items-center justify-between p-5 border-b`, { borderColor: colors.cardSecondary }]}>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Session History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={tw`flex-1 p-5`}>
            {sessionHistory.length === 0 ? (
              <View style={tw`items-center py-12`}>
                <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
                <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No sessions yet</Text>
                <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                  Complete focus sessions to see your history
                </Text>
              </View>
            ) : (
              sessionHistory.map((session) => (
                <View 
                  key={session.id} 
                  style={[
                    tw`rounded-xl p-4 mb-3`,
                    { 
                      backgroundColor: colors.card,
                      borderLeftWidth: 4,
                      borderLeftColor: session.habitColor
                    }
                  ]}
                >
                  <View style={tw`flex-row justify-between items-start mb-2`}>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`font-bold text-base`, { color: colors.text }]}>
                        {session.habit}
                      </Text>
                      <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
                        {new Date(session.timestamp).toLocaleDateString()} • {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={tw`items-end`}>
                      <Text style={[tw`font-bold`, { color: session.habitColor }]}>
                        {session.duration}m
                      </Text>
                      <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                        +{session.xpGained} XP
                      </Text>
                    </View>
                  </View>
                  
                  {session.notes && (
                    <View style={[tw`rounded-lg p-2 mt-2`, { backgroundColor: colors.cardSecondary }]}>
                      <Text style={[tw`text-sm`, { color: colors.text }]}>
                        {session.notes}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

