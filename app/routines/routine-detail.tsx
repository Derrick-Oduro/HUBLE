"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function RoutineDetailScreen() {
  const { colors } = useTheme()
  const params = useLocalSearchParams()
  const router = useRouter()
  const [routine, setRoutine] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRoutineDetail()
  }, [params.id])

  const loadRoutineDetail = async () => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routineDetail = routinesData[params.id]
        if (routineDetail) {
          setRoutine(routineDetail)
        }
      }
    } catch (e) {
      console.error("Failed to load routine detail:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTask = async (taskIndex: number) => {
    if (!routine) return

    const updatedRoutine = { ...routine }
    updatedRoutine.tasks[taskIndex].completed = !updatedRoutine.tasks[taskIndex].completed
    setRoutine(updatedRoutine)

    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        routinesData[params.id] = updatedRoutine
        await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      }
    } catch (e) {
      console.error("Failed to update task:", e)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={[tw``, { color: colors.textSecondary }]}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!routine) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={[tw`text-lg`, { color: colors.text }]}>Routine not found</Text>
          <TouchableOpacity
            style={[tw`mt-4 px-6 py-3 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={tw`text-white font-bold`}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const completedTasks = routine.tasks?.filter((t: any) => t.completed).length || 0
  const totalTasks = routine.tasks?.length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={tw`flex-row items-center justify-between p-5`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[tw`p-2 rounded-xl`, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
          Routine Details
        </Text>
        <View style={tw`w-10`} />
      </View>

      <ScrollView style={tw`flex-1 px-5`} showsVerticalScrollIndicator={false}>
        {/* Routine Header */}
        <View style={[tw`rounded-2xl p-6 mb-6`, { backgroundColor: colors.card }]}>
          <View style={tw`flex-row items-center mb-4`}>
            <View
              style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                { backgroundColor: colors.accent + '20' }
              ]}
            >
              <Ionicons name={routine.icon} size={32} color={colors.accent} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
                {routine.title}
              </Text>
              <Text style={[tw`text-base`, { color: colors.textSecondary }]}>
                {routine.description}
              </Text>
            </View>
          </View>

          {/* Progress */}
          {totalTasks > 0 && (
            <View>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`font-medium`, { color: colors.text }]}>Progress</Text>
                <Text style={[tw`font-bold`, { color: colors.text }]}>
                  {completedTasks}/{totalTasks}
                </Text>
              </View>
              <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                <View
                  style={[
                    tw`h-full rounded-full`,
                    {
                      width: `${progress}%`,
                      backgroundColor: colors.success,
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Tasks Section */}
        {routine.tasks && routine.tasks.length > 0 ? (
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>
              Tasks
            </Text>
            
            {routine.tasks.map((task: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`flex-row items-center p-4 rounded-xl mb-3`,
                  { backgroundColor: colors.cardSecondary }
                ]}
                onPress={() => toggleTask(index)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    tw`w-8 h-8 rounded-full border-2 items-center justify-center mr-4`,
                    {
                      backgroundColor: task.completed ? colors.success : 'transparent',
                      borderColor: task.completed ? colors.success : colors.textSecondary,
                    }
                  ]}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[
                    tw`text-base font-medium`,
                    { 
                      color: task.completed ? colors.textSecondary : colors.text,
                      textDecorationLine: task.completed ? 'line-through' : 'none'
                    }
                  ]}>
                    {task.title}
                  </Text>
                  {task.duration && (
                    <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                      Estimated: {task.duration} minutes
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[tw`rounded-2xl p-8 items-center`, { backgroundColor: colors.card }]}>
            <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
            <Text style={[tw`text-lg font-medium mt-4 mb-2`, { color: colors.text }]}>
              No Tasks Yet
            </Text>
            <Text style={[tw`text-center`, { color: colors.textSecondary }]}>
              Add tasks to this routine to track your progress
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

