"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native"
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
import { routinesAPI } from "../../lib/api"
import CharacterPanel from "../../components/CharacterPanel"

export default function Routines() {
  const { colors, currentTheme } = useTheme()
  
  const defaultRoutines = [
    { 
      id: "1", 
      title: "Morning Routine", 
      icon: "sunny", 
      description: "Start your day with energy and purpose" 
    },
    { 
      id: "2", 
      title: "Afternoon Routine", 
      icon: "partly-sunny", 
      description: "Stay productive and focused throughout the day" 
    },
    { 
      id: "3", 
      title: "Evening Routine", 
      icon: "moon", 
      description: "Wind down and reflect on your achievements" 
    },
  ]

  const { stats, updateRoutineCompletion } = useStats()
  const [routines, setRoutines] = useState([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [routineStats, setRoutineStats] = useState({ completed: 0, total: 0, percentage: 0 })
  const [routineProgress, setRoutineProgress] = useState({})
  const router = useRouter()

  // Fixed - Remove dependencies that cause infinite loops
  const calculateRoutineStats = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem("routinesData")
      
      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routinesArray = Object.values(routinesData)

        let completedRoutines = 0
        let totalRoutines = routinesArray.length
        const progressMap = {}

        routinesArray.forEach((routine) => {
          const totalTasks = routine.tasks ? routine.tasks.length : 0
          const completedTasks = routine.tasks ? routine.tasks.filter(task => task.completed).length : 0
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          
          progressMap[routine.id] = {
            completedTasks,
            totalTasks,
            percentage,
            isComplete: percentage === 100 && totalTasks > 0
          }

          if (totalTasks > 0 && completedTasks === totalTasks) {
            completedRoutines++
          }
        })

        const overallPercentage = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0
        
        const newStats = {
          completed: completedRoutines,
          total: totalRoutines,
          percentage: overallPercentage,
        }

        setRoutineStats(newStats)
        setRoutineProgress(progressMap)
        
        // Only update if values actually changed
        if (updateRoutineCompletion) {
          updateRoutineCompletion(completedRoutines, totalRoutines)
        }

        return routinesArray
      } else {
        // Initialize defaults if no data
        await initializeDefaultRoutines()
        return defaultRoutines
      }
    } catch (e) {
      console.error("Failed to calculate routine stats:", e)
      setRoutineStats({ completed: 0, total: 0, percentage: 0 })
      return []
    }
  }, []) // Remove problematic dependencies

  const initializeDefaultRoutines = useCallback(async () => {
    try {
      const routinesObj = {}
      defaultRoutines.forEach((routine) => {
        routinesObj[routine.id] = {
          ...routine,
          tasks: [],
          createdAt: new Date().toISOString(),
        }
      })

      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesObj))
      setRoutines(defaultRoutines)
      setRoutineStats({ completed: 0, total: defaultRoutines.length, percentage: 0 })
    } catch (e) {
      console.error("Failed to initialize default routines:", e)
    }
  }, [])

  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')
      
      if (token && isGuest !== 'true') {
        console.log('🔄 Loading routines from backend...')
        try {
          // Load from backend
          const response = await routinesAPI.getRoutines()
          
          if (response.success && response.routines) {
            // Convert backend format to your frontend format
            const convertedRoutines = response.routines.map((backendRoutine: any) => ({
              id: backendRoutine.id.toString(),
              title: backendRoutine.title,
              description: backendRoutine.description || '',
              icon: backendRoutine.icon || 'list-outline',
              tasks: typeof backendRoutine.tasks === 'string' 
                ? JSON.parse(backendRoutine.tasks) 
                : (backendRoutine.tasks || []),
              createdAt: backendRoutine.created_at || new Date().toISOString(),
              completed_today: backendRoutine.completed_today || false
            }))
            
            setRoutines(convertedRoutines)
            
            // Cache for offline use - convert to object format for compatibility
            const routinesObj = {}
            convertedRoutines.forEach((routine: any) => {
              routinesObj[routine.id] = routine
            })
            await AsyncStorage.setItem("routinesData", JSON.stringify(routinesObj))
            
            // Calculate stats after setting routines
            await calculateRoutineStats()
            
            console.log('✅ Routines loaded from backend:', convertedRoutines)
            return
          }
        } catch (error) {
          console.error('❌ Backend failed, loading from local:', error)
        }
      }

      // Load from local storage (guest mode or backup)
      console.log('📱 Loading routines from local storage...')
      const savedData = await AsyncStorage.getItem("routinesData")

      if (savedData) {
        const routinesData = JSON.parse(savedData)
        const routinesArray = Object.values(routinesData)

        if (routinesArray.length > 0) {
          setRoutines(routinesArray)
          // Calculate stats after setting routines
          await calculateRoutineStats()
        } else {
          await initializeDefaultRoutines()
        }
      } else {
        await initializeDefaultRoutines()
      }
    } catch (e) {
      console.error("Failed to load routines:", e)
      Alert.alert("Error", "Failed to load routines. Please try again.")
      setRoutines(defaultRoutines)
    } finally {
      setLoading(false)
    }
  }, [calculateRoutineStats, initializeDefaultRoutines])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadRoutines()
    setRefreshing(false)
  }, [loadRoutines])

  // Fixed - Only load once on mount
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        setLoading(true)
        
        // Check if user is logged in
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')
        
        if (token && isGuest !== 'true') {
          console.log('🔄 Loading routines from backend...')
          try {
            // Load from backend
            const response = await routinesAPI.getRoutines()
            
            if (response.success && response.routines) {
              // Convert backend format to your frontend format
              const convertedRoutines = response.routines.map((backendRoutine: any) => ({
                id: backendRoutine.id.toString(),
                title: backendRoutine.title,
                description: backendRoutine.description || '',
                icon: backendRoutine.icon || 'list-outline',
                tasks: typeof backendRoutine.tasks === 'string' 
                  ? JSON.parse(backendRoutine.tasks) 
                  : (backendRoutine.tasks || []),
                createdAt: backendRoutine.created_at || new Date().toISOString(),
                completed_today: backendRoutine.completed_today || false
              }))
              
              setRoutines(convertedRoutines)
              
              // Cache for offline use - convert to object format for compatibility
              const routinesObj = {}
              convertedRoutines.forEach((routine: any) => {
                routinesObj[routine.id] = routine
              })
              await AsyncStorage.setItem("routinesData", JSON.stringify(routinesObj))
              
              // Calculate stats after setting routines
              await calculateRoutineStats()
              
              console.log('✅ Routines loaded from backend:', convertedRoutines)
              return
            }
          } catch (error) {
            console.error('❌ Backend failed, loading from local:', error)
          }
        }

        // Load from local storage (guest mode or backup)
        console.log('📱 Loading routines from local storage...')
        const savedData = await AsyncStorage.getItem("routinesData")

        if (savedData) {
          const routinesData = JSON.parse(savedData)
          const routinesArray = Object.values(routinesData)

          if (routinesArray.length > 0) {
            setRoutines(routinesArray)
            // Calculate stats after setting routines
            await calculateRoutineStats()
          } else {
            await initializeDefaultRoutines()
          }
        } else {
          await initializeDefaultRoutines()
        }
      } catch (e) {
        console.error("Failed to load routines:", e)
        Alert.alert("Error", "Failed to load routines. Please try again.")
        setRoutines(defaultRoutines)
      } finally {
        setLoading(false)
      }
    }

    loadRoutines()
  }, []) // Remove dependencies to prevent infinite loops

  // Fixed - Only recalculate stats when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        calculateRoutineStats()
      }
    }, [loading])
  )

  const addRoutine = async (newRoutine: { title: any; icon: any; description: any; tasks?: any }) => {
    if (!newRoutine.title.trim()) {
      Alert.alert("Error", "Routine title cannot be empty")
      return
    }

    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('➕ Adding routine to backend:', newRoutine)
        
        try {
          const response = await routinesAPI.createRoutine(newRoutine)
          
          if (response.success) {
            // Convert backend routine to frontend format
            const newBackendRoutine = {
              id: response.routine.id.toString(),
              title: response.routine.title,
              description: response.routine.description || '',
              icon: response.routine.icon || 'list-outline',
              tasks: typeof response.routine.tasks === 'string' 
                ? JSON.parse(response.routine.tasks) 
                : (response.routine.tasks || []),
              createdAt: response.routine.created_at || new Date().toISOString()
            }
            
            const updatedRoutines = [...routines, newBackendRoutine]
            setRoutines(updatedRoutines)
            
            // Cache locally in object format
            const existingData = await AsyncStorage.getItem("routinesData")
            const routinesData = existingData ? JSON.parse(existingData) : {}
            routinesData[newBackendRoutine.id] = newBackendRoutine
            await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
            
            // Recalculate stats
            await calculateRoutineStats()
            
            console.log('✅ Routine added to backend successfully')
            return
          }
        } catch (error) {
          console.error('❌ Failed to add to backend, saving locally:', error)
        }
      }

      // Guest mode or backend failed - save locally
      console.log('📱 Adding routine locally:', newRoutine)
      const routineToAdd = {
        id: Date.now().toString(),
        title: newRoutine.title.trim(),
        icon: newRoutine.icon,
        description: newRoutine.description.trim(),
        createdAt: new Date().toISOString(),
        tasks: newRoutine.tasks || [],
      }

      const existingData = await AsyncStorage.getItem("routinesData")
      const routinesData = existingData ? JSON.parse(existingData) : {}

      routinesData[routineToAdd.id] = routineToAdd
      await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
      
      // Update local state
      const updatedRoutines = [...routines, routineToAdd]
      setRoutines(updatedRoutines)
      
      // Recalculate stats
      await calculateRoutineStats()
    } catch (e) {
      console.error("Failed to save routine data:", e)
      Alert.alert("Error", "Failed to save routine. Please try again.")
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
    if (!editedRoutine.title.trim()) {
      Alert.alert("Error", "Routine title cannot be empty")
      return
    }

    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('✏️ Updating routine on backend:', editedRoutine)
        
        try {
          // Get current routine data with tasks
          const currentRoutine = routines.find(r => r.id === editedRoutine.id)
          const updateData = {
            title: editedRoutine.title.trim(),
            description: editedRoutine.description.trim(),
            icon: editedRoutine.icon,
            tasks: currentRoutine?.tasks || []
          }
          
          const response = await routinesAPI.updateRoutine(parseInt(editedRoutine.id), updateData)
          
          if (response.success) {
            // Update local state
            const updatedRoutines = routines.map((routine) => 
              routine.id === editedRoutine.id 
                ? { ...routine, ...editedRoutine, title: editedRoutine.title.trim(), description: editedRoutine.description.trim() }
                : routine
            )
            setRoutines(updatedRoutines)
            
            // Update local storage
            const existingData = await AsyncStorage.getItem("routinesData")
            if (existingData) {
              const routinesData = JSON.parse(existingData)
              if (routinesData[editedRoutine.id]) {
                routinesData[editedRoutine.id] = {
                  ...routinesData[editedRoutine.id],
                  title: editedRoutine.title.trim(),
                  icon: editedRoutine.icon,
                  description: editedRoutine.description.trim(),
                }
                await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
              }
            }
            
            setEditingRoutine(null)
            await calculateRoutineStats()
            
            console.log('✅ Routine updated on backend successfully')
            return
          }
        } catch (error) {
          console.error('❌ Failed to update on backend, updating locally:', error)
        }
      }

      // Guest mode or backend failed - update locally
      console.log('📱 Updating routine locally:', editedRoutine)
      const existingData = await AsyncStorage.getItem("routinesData")
      if (existingData) {
        const routinesData = JSON.parse(existingData)
        if (routinesData[editedRoutine.id]) {
          routinesData[editedRoutine.id] = {
            ...routinesData[editedRoutine.id],
            title: editedRoutine.title.trim(),
            icon: editedRoutine.icon,
            description: editedRoutine.description.trim(),
          }
          await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
          
          // Update local state
          const updatedRoutines = routines.map((routine) => 
            routine.id === editedRoutine.id 
              ? { ...routine, ...editedRoutine, title: editedRoutine.title.trim(), description: editedRoutine.description.trim() }
              : routine
          )
          setRoutines(updatedRoutines)
          setEditingRoutine(null)
          
          // Recalculate stats
          await calculateRoutineStats()
        }
      }
    } catch (e) {
      console.error("Failed to update routine data:", e)
      Alert.alert("Error", "Failed to update routine. Please try again.")
    }
  }

  const deleteRoutine = async (id: string) => {
    const routineToDelete = routines.find(routine => routine.id === id)
    
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${routineToDelete?.title}"? This will also delete all tasks in this routine.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken')
              const isGuest = await AsyncStorage.getItem('isGuest')

              if (token && isGuest !== 'true') {
                console.log('🗑️ Deleting routine from backend:', id)
                
                try {
                  const response = await routinesAPI.deleteRoutine(parseInt(id))
                  
                  if (response.success) {
                    console.log('✅ Routine deleted from backend successfully')
                  }
                } catch (error) {
                  console.error('❌ Failed to delete from backend:', error)
                }
              }

              // Delete locally (always do this)
              const existingData = await AsyncStorage.getItem("routinesData")
              if (existingData) {
                const routinesData = JSON.parse(existingData)
                delete routinesData[id]
                await AsyncStorage.setItem("routinesData", JSON.stringify(routinesData))
                
                // Update local state
                const updatedRoutines = routines.filter((routine) => routine.id !== id)
                setRoutines(updatedRoutines)
                
                // Recalculate stats
                await calculateRoutineStats()
              }
            } catch (e) {
              console.error("Failed to delete routine data:", e)
              Alert.alert("Error", "Failed to delete routine. Please try again.")
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
        <View style={tw`flex-1 justify-center items-center px-5`}>
          <View style={[
            tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
            { backgroundColor: colors.accent + '20' }
          ]}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
          <Text style={[tw`text-lg font-bold mb-2`, { color: colors.text }]}>Loading Routines</Text>
          <Text style={[tw`text-center`, { color: colors.textSecondary }]}>
            Setting up your daily routines...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      
      <ScrollView 
        style={tw`flex-1 px-5 pt-2`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        
        {/* Character Panel Component */}
        <CharacterPanel 
          completedCount={routineStats.completed}
          totalCount={routineStats.total}
          taskType="routines"
        />

        {/* Level Up Message (if exists) */}
        {stats.levelMessage && (
          <View style={[
            tw`px-4 py-3 rounded-xl mb-4`,
            { backgroundColor: colors.success + '20' }
          ]}>
            <Text style={[tw`text-sm font-bold text-center`, { color: colors.success }]}>
              {stats.levelMessage}
            </Text>
          </View>
        )}

        {/* Enhanced Routine Cards */}
        <View style={tw`mb-8`}>
          <Text style={[tw`text-xl font-bold mb-4`, { color: colors.text }]}>
            Your Routines ({routines.length})
          </Text>
          
          {routines.length === 0 ? (
            <View style={[
              tw`rounded-2xl p-8 items-center`,
              {
                backgroundColor: colors.card,
                shadowColor: colors.cardSecondary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }
            ]}>
              <View style={[
                tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                { backgroundColor: colors.accent + '20' }
              ]}>
                <Ionicons name="list-outline" size={40} color={colors.accent} />
              </View>
              <Text style={[tw`text-xl font-bold mb-2`, { color: colors.text }]}>No routines yet</Text>
              <Text style={[tw`text-center mb-6 leading-6`, { color: colors.textSecondary }]}>
                Create your first routine to start building healthy habits and earning rewards!
              </Text>
              <TouchableOpacity
                style={[
                  tw`px-8 py-4 rounded-xl`,
                  {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }
                ]}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Text style={tw`text-white font-bold text-base`}>Create First Routine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            routines.map((routine) => {
              const progress = routineProgress[routine.id] || { completedTasks: 0, totalTasks: 0, percentage: 0, isComplete: false }
              
              return (
                <TouchableOpacity
                  key={routine.id}
                  style={[
                    tw`rounded-2xl mb-4 overflow-hidden`,
                    {
                      backgroundColor: colors.card,
                      shadowColor: progress.isComplete ? colors.success : colors.accent,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 6,
                      borderWidth: progress.isComplete ? 2 : 0,
                      borderColor: progress.isComplete ? colors.success + '40' : 'transparent',
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
                  <View style={tw`p-5`}>
                    <View style={tw`flex-row justify-between items-start mb-4`}>
                      <View style={tw`flex-row items-center flex-1`}>
                        <View
                          style={[
                            tw`w-14 h-14 rounded-2xl items-center justify-center mr-4`,
                            {
                              backgroundColor: progress.isComplete 
                                ? colors.success + '20' 
                                : colors.accent + '20',
                              borderWidth: 2,
                              borderColor: progress.isComplete 
                                ? colors.success + '40' 
                                : colors.accent + '40',
                            },
                          ]}
                        >
                          <Ionicons 
                            name={routine.icon} 
                            size={28} 
                            color={progress.isComplete ? colors.success : colors.accent} 
                          />
                        </View>
                        <View style={tw`flex-1`}>
                          <View style={tw`flex-row items-center mb-1`}>
                            <Text style={[tw`text-lg font-bold flex-1`, { color: colors.text }]} numberOfLines={1}>
                              {routine.title}
                            </Text>
                            {progress.isComplete && (
                              <View style={[tw`ml-2 px-2 py-1 rounded-full`, { backgroundColor: colors.success + '20' }]}>
                                <Text style={[tw`text-xs font-bold`, { color: colors.success }]}>✓ Done</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[tw`text-sm leading-5`, { color: colors.textSecondary }]} numberOfLines={2}>
                            {routine.description}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={tw`flex-row items-center ml-2`}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation()
                            editRoutine(routine.id)
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={[tw`p-2 rounded-lg mr-1`, { backgroundColor: colors.cardSecondary }]}
                        >
                          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation()
                            deleteRoutine(routine.id)
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={[tw`p-2 rounded-lg`, { backgroundColor: colors.error + '20' }]}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Progress Section */}
                    {progress.totalTasks > 0 && (
                      <View>
                        <View style={tw`flex-row justify-between items-center mb-2`}>
                          <Text style={[tw`text-sm font-medium`, { color: colors.text }]}>
                            Progress: {progress.completedTasks}/{progress.totalTasks} tasks
                          </Text>
                          <Text style={[tw`text-sm font-bold`, { color: progress.isComplete ? colors.success : colors.accent }]}>
                            {progress.percentage}%
                          </Text>
                        </View>
                        
                        <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
                          <View
                            style={[
                              tw`h-full rounded-full`,
                              {
                                width: `${progress.percentage}%`,
                                backgroundColor: progress.isComplete ? colors.success : colors.accent,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}

                    {progress.totalTasks === 0 && (
                      <View style={[tw`p-3 rounded-xl`, { backgroundColor: colors.cardSecondary }]}>
                        <Text style={[tw`text-sm text-center`, { color: colors.textSecondary }]}>
                          📝 Tap to add tasks to this routine
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button - ON TOP of tab bar, perfectly centered */}
      <View style={[
        tw`absolute w-full`, 
        { 
          bottom: 25, 
          left: 0, 
          right: 0,
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <TouchableOpacity 
          style={[
            tw`w-16 h-16 rounded-full items-center justify-center shadow-lg`,
            {
              backgroundColor: colors.accent,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
              borderWidth: 4,
              borderColor: colors.background,
              marginLeft: 2, // Fine adjustment for centering
            }
          ]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddRoutineModal 
        isVisible={isAddModalVisible} 
        onClose={() => setIsAddModalVisible(false)} 
        onAdd={addRoutine} 
      />

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
    </SafeAreaView>
  )
}
