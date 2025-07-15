"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import tw from "../../lib/tailwind"
import AddRoutineModal from "../../components/AddRoutineModal"
import EditRoutineModal from "../../components/EditRoutineModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

export default function Routines() {
  const { colors } = useTheme()
  const defaultRoutines = [
    { id: "1", title: "Morning Routine", icon: "sunny", description: "Start your day with good habits" },
    { id: "2", title: "Afternoon Routine", icon: "partly-sunny", description: "Stay productive through the day" },
    { id: "3", title: "Evening Routine", icon: "moon", description: "End your day on a positive note" },
  ]

  const { stats, updateRoutineCompletion } = useStats()
  const [routines, setRoutines] = useState(defaultRoutines)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [routineStats, setRoutineStats] = useState({ completed: 0, total: 0, percentage: 0 })
  const router = useRouter()

  // Function to calculate routine completion stats
  const calculateRoutineStats = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routinesArray = Object.values(routinesData)

        let completedRoutines = 0
        let totalRoutines = routinesArray.length

        routinesArray.forEach((routine) => {
          if (routine.tasks && routine.tasks.length > 0) {
            const allTasksCompleted = routine.tasks.every((task) => task.completed)
            if (allTasksCompleted) {
              completedRoutines++
            }
          }
        })

        const percentage = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0
        
        const newStats = {
          completed: completedRoutines,
          total: totalRoutines,
          percentage: percentage,
        }

        setRoutineStats(newStats)
        updateRoutineCompletion(completedRoutines, totalRoutines)

        return { completedRoutines, totalRoutines }
      } else {
        await initializeDefaultRoutines()
        const newStats = { completed: 0, total: defaultRoutines.length, percentage: 0 }
        setRoutineStats(newStats)
        updateRoutineCompletion(0, defaultRoutines.length)
      }
    } catch (e) {
      console.error("Failed to calculate routine stats:", e)
      const newStats = { completed: 0, total: 0, percentage: 0 }
      setRoutineStats(newStats)
    }

    return { completedRoutines: 0, totalRoutines: 0 }
  }, [updateRoutineCompletion])

  const initializeDefaultRoutines = async () => {
    try {
      const routinesObj = {}
      defaultRoutines.forEach((routine) => {
        routinesObj[routine.id] = {
          ...routine,
          tasks: [],
        }
      })

      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesObj))
      setRoutines(defaultRoutines)
    } catch (e) {
      console.error("Failed to initialize default routines:", e)
    }
  }

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        setLoading(true)
        const savedData = await AsyncStorage.getItem("routinesData")

        if (savedData) {
          const routinesData = JSON.parse(savedData)
          const routinesArray = Object.values(routinesData)

          if (routinesArray.length > 0) {
            setRoutines(routinesArray)
            await calculateRoutineStats()
          } else {
            await initializeDefaultRoutines()
          }
        } else {
          await initializeDefaultRoutines()
        }
      } catch (e) {
        console.error("Failed to load routines:", e)
        await initializeDefaultRoutines()
      } finally {
        setLoading(false)
      }
    }

    loadRoutines()
  }, [])

  useFocusEffect(
    useCallback(() => {
      calculateRoutineStats()
    }, [calculateRoutineStats])
  )

  const addRoutine = async (newRoutine: { title: any; icon: any; description: any; tasks: any }) => {
    const routineToAdd = {
      id: Date.now().toString(),
      title: newRoutine.title,
      icon: newRoutine.icon,
      description: newRoutine.description,
    }

    const updatedRoutines = [...routines, routineToAdd]
    setRoutines(updatedRoutines)

    try {
      const existingData = await AsyncStorage.getItem("routinesData")
      const routinesData = existingData ? JSON.parse(existingData) : {}

      routinesData[routineToAdd.id] = {
        ...routineToAdd,
        tasks: newRoutine.tasks || [],
      }

      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      await calculateRoutineStats()
    } catch (e) {
      console.error("Failed to save routine data:", e)
    }
  }

  const editRoutine = (id: string) => {
    const routineToEdit = routines.find((routine) => routine.id === id)
    if (routineToEdit) {
      setEditingRoutine(routineToEdit)
      setIsEditModalVisible(true)
    }
  }

  const saveEditedRoutine = async (editedRoutine: { id: string; title: any; icon: any; description: any }) => {
    const updatedRoutines = routines.map((routine) => (routine.id === editedRoutine.id ? editedRoutine : routine))
    setRoutines(updatedRoutines)
    setEditingRoutine(null)

    try {
      const existingData = await AsyncStorage.getItem("routinesData")
      if (existingData) {
        const routinesData = JSON.parse(existingData)
        if (routinesData[editedRoutine.id]) {
          routinesData[editedRoutine.id] = {
            ...routinesData[editedRoutine.id],
            title: editedRoutine.title,
            icon: editedRoutine.icon,
            description: editedRoutine.description,
          }
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
          await calculateRoutineStats()
        }
      }
    } catch (e) {
      console.error("Failed to update routine data:", e)
    }
  }

  const deleteRoutine = async (id) => {
    const updatedRoutines = routines.filter((routine) => routine.id !== id)
    setRoutines(updatedRoutines)

    try {
      const existingData = await AsyncStorage.getItem("routinesData")
      if (existingData) {
        const routinesData = JSON.parse(existingData)
        delete routinesData[id]
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
        await calculateRoutineStats()
      }
    } catch (e) {
      console.error("Failed to delete routine data:", e)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading routines...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Daily Routines</Text>
          <TouchableOpacity
            style={[
              tw`rounded-xl p-3 shadow-lg`,
              {
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 4,
              },
            ]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Cool Stats Card - Matching other pages */}
        <View style={[tw`rounded-lg p-4 mb-6`, { backgroundColor: colors.card }]}>
          {stats.levelMessage && (
            <View style={[tw`px-3 py-2 rounded-lg mb-3`, { backgroundColor: colors.success + '20' }]}>
              <Text style={[tw`text-sm font-bold text-center`, { color: colors.success }]}>
                🎉 {stats.levelMessage}
              </Text>
            </View>
          )}

          {/* Health Progress - Cool Custom */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-lg mr-2`}>❤️</Text>
                <Text style={[tw`font-medium`, { color: colors.text }]}>Health</Text>
              </View>
              <Text style={[tw`text-sm`, { color: colors.text }]}>
                {stats.health}/{stats.maxHealth} • Level {stats.level}
              </Text>
            </View>
            {/* Ultra-thin health bar */}
            <View style={[tw`h-0.5 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
              <View
                style={[
                  tw`h-full rounded-full`,
                  {
                    width: `${Math.min(100, Math.max(0, (stats.health / stats.maxHealth) * 100))}%`,
                    backgroundColor: colors.error,
                    shadowColor: colors.error,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              />
            </View>
          </View>

          {/* Experience Progress - Cool Custom */}
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-lg mr-2`}>⭐</Text>
                <Text style={[tw`font-medium`, { color: colors.text }]}>Experience</Text>
              </View>
              <Text style={[tw`text-sm`, { color: colors.text }]}>
                {stats.experience}/{stats.maxExperience} XP
              </Text>
            </View>
            {/* Ultra-thin experience bar */}
            <View style={[tw`h-0.5 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
              <View
                style={[
                  tw`h-full rounded-full`,
                  {
                    width: `${Math.min(100, Math.max(0, (stats.experience / stats.maxExperience) * 100))}%`,
                    backgroundColor: colors.warning,
                    shadowColor: colors.warning,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[tw`flex-row justify-between items-center pt-3 border-t`, { borderColor: colors.cardSecondary }]}>
            <Text style={[tw``, { color: colors.text }]}>
              💎 {stats.gemsEarned} 🪙 {stats.coinsEarned}
            </Text>
            <Text style={[tw`font-bold`, { color: colors.accent }]}>Level {stats.level}</Text>
          </View>
        </View>

        {/* Routines Progress - Now using real stats */}
        <View style={[tw`rounded-xl p-4 mb-4 shadow-lg`, { backgroundColor: colors.card }]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Routines Progress</Text>
            <Text style={[tw`text-lg font-medium`, { color: colors.text }]}>
              {routineStats.completed}/{routineStats.total}
            </Text>
          </View>

          {/* Ultra-thin Progress Bar */}
          <View style={[tw`h-0.5 rounded-full overflow-hidden mb-1`, { backgroundColor: colors.cardSecondary }]}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: `${routineStats.percentage}%`,
                  backgroundColor: colors.success,
                  shadowColor: colors.success,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
            />
          </View>

          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            {routineStats.percentage === 100 && routineStats.total > 0
              ? "All routines completed! Great job! 🎉"
              : `${routineStats.total - routineStats.completed} routines remaining`}
          </Text>
        </View>

        {/* Cool Routine Cards */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={[
                tw`rounded-2xl mb-3 overflow-hidden shadow-lg`,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/routines/routine-detail",
                  params: { id: routine.id },
                })
              }
              activeOpacity={0.8}
            >
              <View style={tw`p-3`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <View style={tw`flex-row items-center flex-1`}>
                    <View
                      style={[
                        tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
                        {
                          backgroundColor: colors.accent + '20',
                          borderWidth: 2,
                          borderColor: colors.accent,
                          shadowColor: colors.accent,
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                          elevation: 2,
                        },
                      ]}
                    >
                      <Ionicons name={routine.icon} size={24} color={colors.accent} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`text-lg font-bold`, { color: colors.text }]} numberOfLines={1}>
                        {routine.title}
                      </Text>
                      <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]} numberOfLines={1}>
                        {routine.description}
                      </Text>
                    </View>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation()
                        editRoutine(routine.id)
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={tw`mr-2`}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation()
                        deleteRoutine(routine.id)
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <AddRoutineModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addRoutine} />

        {editingRoutine && (
          <EditRoutineModal
            isVisible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false)
              setEditingRoutine(null)
            }}
            onSave={saveEditedRoutine}
            routine={editingRoutine}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
