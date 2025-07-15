"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import AddDailyModal from "../../components/AddDailyModal"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

// Enhanced daily task interface
interface DailyTask {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  dueDate?: string
  completed: boolean
  dateCreated: string
  tags?: string[]
  xp?: number
}

export default function DailiesScreen() {
  const { colors, currentTheme } = useTheme()
  const { updateExperience, updateHealth } = useStats()
  const [dailies, setDailies] = useState<DailyTask[]>([])
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)

  // Load dailies from storage
  useEffect(() => {
    loadDailies()
  }, [])

  const loadDailies = async () => {
    try {
      const savedDailies = await AsyncStorage.getItem("dailiesData")
      if (savedDailies) {
        setDailies(JSON.parse(savedDailies))
      }
    } catch (error) {
      console.error("Error loading dailies:", error)
    }
  }

  const saveDailies = async (newDailies: DailyTask[]) => {
    try {
      await AsyncStorage.setItem("dailiesData", JSON.stringify(newDailies))
    } catch (error) {
      console.error("Error saving dailies:", error)
    }
  }

  const addDaily = async (newDaily: any) => {
    const taskToAdd: DailyTask = {
      ...newDaily,
      id: Date.now(),
      completed: false,
      dateCreated: new Date().toISOString().split('T')[0],
    }
    
    const updatedDailies = [...dailies, taskToAdd]
    setDailies(updatedDailies)
    await saveDailies(updatedDailies)
  }

  const toggleDaily = async (id: number) => {
    const updatedDailies = dailies.map(daily => {
      if (daily.id === id) {
        const isCompleting = !daily.completed
        
        if (isCompleting) {
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
          
          Alert.alert(
            "Task Completed! ✅",
            `+${xpGain} XP earned!`,
            [{ text: "Great!", style: "default" }]
          )
        }
        
        return { ...daily, completed: isCompleting }
      }
      return daily
    })
    
    setDailies(updatedDailies)
    await saveDailies(updatedDailies)
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
            const updatedDailies = dailies.filter(daily => daily.id !== id)
            setDailies(updatedDailies)
            await saveDailies(updatedDailies)
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "⭐"
      case 'medium': return "⭐⭐"
      case 'hard': return "⭐⭐⭐"
      default: return "⭐"
    }
  }

  // Calculate stats
  const completedCount = dailies.filter(d => d.completed).length
  const totalCount = dailies.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-3`}>
        
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Daily Tasks</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {completedCount}/{totalCount} completed today
            </Text>
          </View>
          <TouchableOpacity
            style={[tw`p-3 rounded-lg`, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={[tw`rounded-lg p-4 mb-6`, { backgroundColor: colors.card }]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>Progress</Text>
            <Text style={[tw`font-bold`, { color: colors.accent }]}>{completionPercentage}%</Text>
          </View>
          <View style={[tw`h-0.5 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
            <View 
              style={[
                tw`h-full rounded-full`,
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.6,
                  shadowRadius: 2,
                  elevation: 2,
                }
              ]} 
            />
          </View>
        </View>

        {/* Tasks List */}
        <FlatList
          data={dailies}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
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
            
            return (
              <View style={[
                tw`rounded-2xl p-4 mb-3`,
                { 
                  backgroundColor: colors.card,
                  borderLeftWidth: 4,
                  borderLeftColor: priorityColor,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }
              ]}>
                <View style={tw`flex-row items-start justify-between`}>
                  <View style={tw`flex-1 mr-3`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Text style={[
                        tw`text-lg font-bold flex-1`,
                        { 
                          color: item.completed ? colors.textSecondary : colors.text,
                          textDecorationLine: item.completed ? 'line-through' : 'none'
                        }
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={tw`text-sm ml-2`}>{getDifficultyIcon(item.difficulty)}</Text>
                    </View>
                    
                    {item.description && (
                      <Text style={[
                        tw`text-sm mb-2`,
                        { color: colors.textSecondary }
                      ]}>
                        {item.description}
                      </Text>
                    )}
                    
                    <View style={tw`flex-row items-center justify-between`}>
                      <View style={tw`flex-row items-center`}>
                        <View style={[
                          tw`px-2 py-1 rounded-full mr-2`,
                          { backgroundColor: priorityColor + '20' }
                        ]}>
                          <Text style={[tw`text-xs font-bold capitalize`, { color: priorityColor }]}>
                            {item.priority}
                          </Text>
                        </View>
                        
                        {item.category && (
                          <View style={[
                            tw`px-2 py-1 rounded-full`,
                            { backgroundColor: colors.cardSecondary }
                          ]}>
                            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                              {item.category}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={tw`flex-row items-center`}>
                        <TouchableOpacity
                          style={[
                            tw`w-8 h-8 rounded-full items-center justify-center mr-2`,
                            { 
                              backgroundColor: item.completed ? colors.success : colors.cardSecondary,
                              borderWidth: 2,
                              borderColor: item.completed ? colors.success : colors.textSecondary,
                            }
                          ]}
                          onPress={() => toggleDaily(item.id)}
                        >
                          {item.completed && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => deleteDaily(item.id)}>
                          <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          }}
        />

        <AddDailyModal
          isVisible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onAdd={addDaily}
        />
      </View>
    </SafeAreaView>
  )
}
