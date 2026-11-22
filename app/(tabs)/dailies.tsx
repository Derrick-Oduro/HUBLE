"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Alert, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AddDailyModal from "../../components/AddDailyModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"

import { dailiesAPI } from "../../lib/api"
import CharacterPanel from "../../components/CharacterPanel"

// Enhanced daily task interface
interface DailyTask {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  dueDate?: string
  reminderTime?: string | null
  completed: boolean
  dateCreated: string
  tags?: string[]
  xp?: number
  // Backend fields
  is_completed_today?: boolean
  created_at?: string
  updated_at?: string
}

export default function DailiesScreen() {
  const { colors, currentTheme, isGlowEnabled } = useTheme()
  const { stats, updateExperience, updateHealth, updateCoins } = useStats()
  
  const [dailies, setDailies] = useState<DailyTask[]>([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingDaily, setEditingDaily] = useState<DailyTask | null>(null)

  // Load dailies from storage
  useEffect(() => {
    const loadDailies = async () => {
      try {
        // Check if user is logged in
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')
        
        if (token && isGuest !== 'true') {
          console.log('🔄 Loading dailies from backend...')
          try {
            // Load from backend
            const response = await dailiesAPI.getDailies()
            
            if (response.success && response.dailies) {
              // Convert backend format to your frontend format
              const convertedDailies = response.dailies.map((backendDaily: any) => ({
                id: backendDaily.id,
                title: backendDaily.title,
                description: backendDaily.description || '',
                priority: backendDaily.priority || 'medium',
                difficulty: backendDaily.difficulty || 'medium',
                category: backendDaily.category || 'General',
                dueDate: backendDaily.due_date,
                reminderTime: backendDaily.reminder_time || null,
                completed: backendDaily.is_completed_today || false,
                dateCreated: backendDaily.created_at ? new Date(backendDaily.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                tags: typeof backendDaily.tags === 'string' 
                  ? JSON.parse(backendDaily.tags || '[]') 
                  : (backendDaily.tags || [])
              }))
              
              setDailies(convertedDailies)
              
              // Cache for offline use
              await AsyncStorage.setItem("dailiesData", JSON.stringify(convertedDailies))
              
              console.log('✅ Dailies loaded from backend:', convertedDailies)
              return
            }
          } catch (error) {
            console.error('❌ Backend failed, loading from local:', error)
          }
        }

        // Load from local storage (guest mode or backup)
        console.log('📱 Loading dailies from local storage...')
        const savedDailies = await AsyncStorage.getItem("dailiesData")
        if (savedDailies) {
          setDailies(JSON.parse(savedDailies))
        }
        
      } catch (error) {
        console.error("Error loading dailies:", error)
      }
    }

    loadDailies()
  }, [])

  const addDaily = async (newDaily: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('➕ Adding daily to backend:', newDaily)
        
        try {
          const response = await dailiesAPI.createDaily(newDaily)
          
          if (response.success) {
            // Convert backend daily to frontend format
            const newBackendDaily = {
              id: response.daily.id,
              title: response.daily.title,
              description: response.daily.description || '',
              priority: response.daily.priority || 'medium',
              difficulty: response.daily.difficulty || 'medium',
              category: response.daily.category || 'General',
              dueDate: response.daily.due_date,
              reminderTime: response.daily.reminder_time || newDaily.reminderTime || null,
              completed: false,
              dateCreated: new Date().toISOString().split('T')[0],
              tags: typeof response.daily.tags === 'string' 
                ? JSON.parse(response.daily.tags || '[]') 
                : (response.daily.tags || [])
            }
            
            const updatedDailies = [...dailies, newBackendDaily]
            setDailies(updatedDailies)
            
            // Cache locally
            await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
            
            console.log('✅ Daily added to backend successfully')
            return
          }
        } catch (error) {
          console.error('❌ Failed to add to backend, saving locally:', error)
        }
      }

      // Guest mode or backend failed - save locally
      console.log('📱 Adding daily locally:', newDaily)
      const taskToAdd: DailyTask = {
        ...newDaily,
        id: Date.now(),
        reminderTime: newDaily.reminderTime || null,
        completed: false,
        dateCreated: new Date().toISOString().split('T')[0],
      }
      
      const updatedDailies = [...dailies, taskToAdd]
      setDailies(updatedDailies)
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
      
    } catch (error) {
      console.error("Error adding daily:", error)
    }
  }

  const toggleDaily = async (id: number) => {
    try {
      const daily = dailies.find(d => d.id === id)
      if (!daily) return

      const isCompleting = !daily.completed
      
      if (isCompleting) {
        const token = await AsyncStorage.getItem('userToken')
        const isGuest = await AsyncStorage.getItem('isGuest')

        if (token && isGuest !== 'true') {
          console.log('✅ Completing daily on backend:', id)
          
          try {
            const response = await dailiesAPI.completeDaily(id)
            
            if (response.success) {
              // Update local state with backend response
              const updatedDailies = dailies.map(d => 
                d.id === id 
                  ? { ...d, completed: true } 
                  : d
              )
              
              setDailies(updatedDailies)
              await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))

              // Calculate XP based on difficulty and priority
              let xpGain = 0
              switch (daily.difficulty) {
                case 'easy': xpGain = 3; break
                case 'medium': xpGain = 6; break
                case 'hard': xpGain = 10; break
              }
              
              // Priority bonus
              switch (daily.priority) {
                case 'medium': xpGain += 2; break
                case 'high': xpGain += 5; break
              }

              updateExperience(xpGain)
              updateHealth(1)
              updateCoins(2) // Give 2 coins for completing a daily
              
              Alert.alert(
                "Task Completed! ✅",
                `+${xpGain} XP, +1 Health, +2 Coins earned!`,
                [{ text: "Great!", style: "default" }]
              )
              
              console.log('✅ Daily completed on backend successfully')
              return
            }
          } catch (error) {
            console.error('❌ Failed to complete on backend, updating locally:', error)
          }
        }

        // Guest mode or backend failed - handle locally
        console.log('📱 Completing daily locally:', id)
        
        // Calculate XP based on difficulty and priority
        let xpGain = 0
        switch (daily.difficulty) {
          case 'easy': xpGain = 3; break
          case 'medium': xpGain = 6; break
          case 'hard': xpGain = 10; break
        }
        
        // Priority bonus
        switch (daily.priority) {
          case 'medium': xpGain += 2; break
          case 'high': xpGain += 5; break
        }
        
        updateExperience(xpGain)
        updateHealth(1)
        updateCoins(2) // Give 2 coins for completing a daily
        
        Alert.alert(
          "Task Completed! ✅",
          `+${xpGain} XP, +1 Health, +2 Coins earned!`,
          [{ text: "Great!", style: "default" }]
        )
      }
      
      // Update local state (always do this)
      const updatedDailies = dailies.map(d => 
        d.id === id 
          ? { ...d, completed: isCompleting } 
          : d
      )
      
      setDailies(updatedDailies)
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
      
    } catch (error) {
      console.error("Error toggling daily:", error)
    }
  }

  const updateDaily = async (id: number, updatedData: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      const isGuest = await AsyncStorage.getItem('isGuest')

      if (token && isGuest !== 'true') {
        console.log('📝 Updating daily on backend:', id, updatedData)
        
        try {
          const response = await dailiesAPI.updateDaily(id, updatedData)
          
          if (response.success && response.daily) {
            const updatedDaily = {
              id: response.daily.id,
              title: response.daily.title,
              description: response.daily.description || '',
              priority: response.daily.priority || 'medium',
              difficulty: response.daily.difficulty || 'medium',
              category: response.daily.category || 'General',
              dueDate: response.daily.due_date,
              reminderTime: response.daily.reminder_time || null,
              completed: response.daily.is_completed_today || false,
              dateCreated: response.daily.created_at
                ? new Date(response.daily.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              tags: typeof response.daily.tags === 'string'
                ? JSON.parse(response.daily.tags || '[]')
                : (response.daily.tags || []),
            }

            const updatedDailies = dailies.map(d => 
              d.id === id 
                ? { ...d, ...updatedDaily } 
                : d
            )
            
            setDailies(updatedDailies)
            await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
            
            console.log('✅ Daily updated on backend successfully')
            Alert.alert("Success", "Task updated successfully!")
            return
          }
        } catch (error) {
          console.error('❌ Failed to update on backend, updating locally:', error)
        }
      }

      // Guest mode or backend failed - update locally
      console.log('📱 Updating daily locally:', id, updatedData)
      const updatedDailies = dailies.map(d => 
        d.id === id 
          ? { ...d, ...updatedData } 
          : d
      )
      
      setDailies(updatedDailies)
      await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
      Alert.alert("Success", "Task updated successfully!")
      
    } catch (error) {
      console.error("Error updating daily:", error)
      Alert.alert("Error", "Failed to update task")
    }
  }

  const deleteDaily = async (id: number) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
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
                console.log('🗑️ Deleting daily from backend:', id)
                
                try {
                  const response = await dailiesAPI.deleteDaily(id)
                  
                  if (response.success) {
                    console.log('✅ Daily deleted from backend successfully')
                  }
                } catch (error) {
                  console.error('❌ Failed to delete from backend:', error)
                }
              }

              // Delete locally (always do this)
              const updatedDailies = dailies.filter(daily => daily.id !== id)
              setDailies(updatedDailies)
              await AsyncStorage.setItem("dailiesData", JSON.stringify(updatedDailies))
              
            } catch (error) {
              console.error("Error deleting daily:", error)
            }
          }
        }
      ]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error
      case 'medium': return colors.warning
      case 'low': return colors.success
      default: return colors.textSecondary
    }
  }

  const getDifficultyInfo = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { icon: 'leaf', color: colors.success, label: 'Easy' }
      case 'medium':
        return { icon: 'flash', color: colors.warning, label: 'Medium' }
      case 'hard':
        return { icon: 'diamond', color: colors.error, label: 'Hard' }
      default:
        return { icon: 'leaf', color: colors.success, label: 'Easy' }
    }
  }

  const formatReminderTime = (value?: string | null) => {
    if (!value || typeof value !== 'string') return null

    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
    if (!match) return null

    const hour24 = Number(match[1])
    const minute = Number(match[2])
    const meridiem = hour24 >= 12 ? 'PM' : 'AM'
    const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
    return `${hour}:${minute.toString().padStart(2, '0')} ${meridiem}`
  }

  // Calculate stats
  // Calculate daily completion stats
  const completedDailies = dailies.filter(daily => daily.completed).length
  const totalDailies = dailies.length

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.statusBarStyle} />
      
      <FlatList
        style={tw`flex-1 px-2 pt-2`}
        data={dailies}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
        ListHeaderComponent={() => (
          <View>
            
            <CharacterPanel 
              completedCount={completedDailies}
              totalCount={totalDailies}
              taskType="dailies"
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
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={tw`items-center py-8`}>
            <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
            <Text style={[tw`text-lg mt-3`, { color: colors.textSecondary }]}>No daily tasks yet</Text>
            <Text style={[tw`text-center mt-1`, { color: colors.textSecondary }]}>
              Add your first task to get started
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const priorityColor = getPriorityColor(item.priority)
          const difficultyInfo = getDifficultyInfo(item.difficulty)
          const reminderLabel = formatReminderTime(item.reminderTime)
          
          return (
            <View style={tw`mb-2.5`}>
              <Pressable
                onPress={() => {
                  setEditingDaily(item)
                  setIsAddModalVisible(true)
                }}
                style={[
                  tw`rounded-xl p-2`,
                  { 
                    backgroundColor: colors.card,
                    borderLeftWidth: 4,
                    borderLeftColor: priorityColor,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isGlowEnabled ? 0.08 : 0,
                    shadowRadius: isGlowEnabled ? 4 : 0,
                    elevation: isGlowEnabled ? 2 : 0,
                  }
                ]}
              >
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-1 mr-2`}>
                    {/* Title with difficulty icon */}
                    <View style={tw`flex-row items-center`}>
                      <View
                        style={[
                          tw`w-7 h-7 rounded-lg items-center justify-center mr-2`,
                          { backgroundColor: `${difficultyInfo.color}20` }
                        ]}
                      >
                        <Ionicons
                          name={difficultyInfo.icon as keyof typeof Ionicons.glyphMap}
                          size={16}
                          color={difficultyInfo.color}
                        />
                      </View>
                      
                      <View style={tw`flex-1`}>
                        <Text style={[
                          tw`text-sm font-semibold`,
                          { 
                            color: item.completed ? colors.textSecondary : colors.text,
                            textDecorationLine: item.completed ? 'line-through' : 'none'
                          }
                        ]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        
                        {/* Compact subtitle */}
                        {item.description && (
                          <Text style={[
                            tw`text-xs mt-0.5`,
                            { color: colors.textSecondary }
                          ]} numberOfLines={1}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {/* Right side buttons */}
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                      onPress={(event) => {
                        event.stopPropagation()
                        void toggleDaily(item.id)
                      }}
                      style={[
                        tw`w-6 h-6 rounded-lg items-center justify-center mr-1.5`,
                        { 
                          backgroundColor: item.completed ? colors.success : colors.cardSecondary,
                          borderWidth: 1.5,
                          borderColor: item.completed ? colors.success : colors.textSecondary,
                        }
                      ]}
                    >
                      {item.completed && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {reminderLabel && (
                  <View style={tw`mt-1.5 ml-9 mr-1`}> 
                    <Text style={[tw`text-xs`, { color: colors.textSecondary }]} numberOfLines={1}>
                      {`Reminder ${reminderLabel}`}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          )
        }}
      />

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
              shadowOpacity: isGlowEnabled ? 0.3 : 0,
              shadowRadius: isGlowEnabled ? 6 : 0,
              elevation: isGlowEnabled ? 8 : 0,
              borderWidth: 4,
              borderColor: colors.background,
              marginLeft: 2, // Fine adjustment for centering
            }
          ]}
          onPress={() => {
            setEditingDaily(null)
            setIsAddModalVisible(true)
          }}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {editingDaily ? (
        <AddDailyModal
          isVisible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false)
            setEditingDaily(null)
          }}
          onAdd={(updatedDaily) => updateDaily(editingDaily.id, updatedDaily)}
          initialValues={editingDaily}
          onDelete={(dailyId) => {
            setIsAddModalVisible(false)
            setEditingDaily(null)
            deleteDaily(dailyId)
          }}
        />
      ) : (
        <AddDailyModal
          isVisible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false)
            setEditingDaily(null)
          }}
          onAdd={addDaily}
        />
      )}
    </SafeAreaView>
  )
}

