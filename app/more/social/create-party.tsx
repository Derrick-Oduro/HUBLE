"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function CreateParty() {
  const router = useRouter()
  const [partyName, setPartyName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedGoal, setSelectedGoal] = useState("")
  const [maxMembers, setMaxMembers] = useState(6)
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")

  const categories = [
    { id: 'study', name: 'Study & Learning', emoji: '📚', color: '#3B82F6' },
    { id: 'fitness', name: 'Fitness & Health', emoji: '💪', color: '#EF4444' },
    { id: 'productivity', name: 'Productivity', emoji: '⚡', color: '#F59E0B' },
    { id: 'mindfulness', name: 'Mindfulness', emoji: '🧘', color: '#8B5CF6' },
    { id: 'creative', name: 'Creative', emoji: '🎨', color: '#EC4899' },
    { id: 'other', name: 'Other', emoji: '🌟', color: '#10B981' }
  ]

  const goalTemplates = [
    { id: '1', text: 'Complete 100 study sessions together', category: 'study' },
    { id: '2', text: 'Exercise for 30 days straight', category: 'fitness' },
    { id: '3', text: 'Meditate daily for 2 weeks', category: 'mindfulness' },
    { id: '4', text: 'Finish 50 productive work sessions', category: 'productivity' },
    { id: '5', text: 'Create 10 creative projects', category: 'creative' },
    { id: 'custom', text: 'Custom goal...', category: 'other' }
  ]

  const handleCreateParty = () => {
    if (!partyName || !selectedGoal || !selectedCategory) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    // Implementation for creating party
    Alert.alert(
      "Party Created! 🎉",
      `"${partyName}" has been created successfully. Start inviting friends!`,
      [{ text: "Great!", onPress: () => router.back() }]
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>Create Party</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Basic Information</Text>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 font-medium mb-2`}>Party Name *</Text>
              <TextInput
                style={[
                  tw`bg-gray-700 text-white p-4 rounded-xl text-base`,
                  { borderWidth: 1, borderColor: '#374151' }
                ]}
                value={partyName}
                onChangeText={setPartyName}
                placeholder="Enter party name..."
                placeholderTextColor="#9CA3AF"
                maxLength={30}
              />
            </View>

            <View>
              <Text style={tw`text-gray-300 font-medium mb-2`}>Description</Text>
              <TextInput
                style={[
                  tw`bg-gray-700 text-white p-4 rounded-xl text-base`,
                  { borderWidth: 1, borderColor: '#374151', height: 80 }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="What's this party about?"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={150}
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Category *</Text>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    tw`w-28 p-3 rounded-xl mb-3 items-center`,
                    {
                      backgroundColor: selectedCategory === category.id ? `${category.color}20` : '#374151',
                      borderWidth: selectedCategory === category.id ? 2 : 1,
                      borderColor: selectedCategory === category.id ? category.color : '#4B5563'
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={tw`text-2xl mb-1`}>{category.emoji}</Text>
                  <Text style={[
                    tw`text-xs text-center font-medium`,
                    { color: selectedCategory === category.id ? category.color : '#9CA3AF' }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Selection */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Party Goal *</Text>
            
            {goalTemplates
              .filter(goal => goal.category === selectedCategory || goal.category === 'other')
              .map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    tw`p-4 rounded-xl mb-3 border`,
                    {
                      backgroundColor: selectedGoal === goal.text ? '#8B5CF620' : '#374151',
                      borderColor: selectedGoal === goal.text ? '#8B5CF6' : '#4B5563'
                    }
                  ]}
                  onPress={() => setSelectedGoal(goal.text)}
                >
                  <Text style={[
                    tw`font-medium`,
                    { color: selectedGoal === goal.text ? '#8B5CF6' : 'white' }
                  ]}>
                    {goal.text}
                  </Text>
                </TouchableOpacity>
              ))}

            {selectedGoal === 'Custom goal...' && (
              <TextInput
                style={[
                  tw`bg-gray-700 text-white p-4 rounded-xl text-base mt-3`,
                  { borderWidth: 1, borderColor: '#8B5CF6' }
                ]}
                placeholder="Enter your custom goal..."
                placeholderTextColor="#9CA3AF"
                onChangeText={setSelectedGoal}
                value={selectedGoal === 'Custom goal...' ? '' : selectedGoal}
              />
            )}
          </View>

          {/* Settings */}
          <View style={[
            tw`bg-gray-800 rounded-2xl p-5 mb-6`,
            { backgroundColor: '#1F2937' }
          ]}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>Settings</Text>
            
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-gray-300 font-medium`}>Max Members</Text>
              <View style={tw`flex-row items-center`}>
                <TouchableOpacity
                  style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#374151' }]}
                  onPress={() => setMaxMembers(Math.max(2, maxMembers - 1))}
                >
                  <Ionicons name="remove" size={16} color="white" />
                </TouchableOpacity>
                <Text style={tw`text-white mx-4 min-w-8 text-center font-bold`}>{maxMembers}</Text>
                <TouchableOpacity
                  style={[tw`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#374151' }]}
                  onPress={() => setMaxMembers(Math.min(20, maxMembers + 1))}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={tw`flex-row justify-between items-center`}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View>
                <Text style={tw`text-gray-300 font-medium`}>Private Party</Text>
                <Text style={tw`text-gray-400 text-sm`}>Invite only, won't appear in public search</Text>
              </View>
              <View style={[
                tw`w-12 h-6 rounded-full border-2`,
                {
                  backgroundColor: isPrivate ? '#8B5CF6' : '#374151',
                  borderColor: isPrivate ? '#8B5CF6' : '#6B7280'
                }
              ]}>
                <View style={[
                  tw`w-4 h-4 rounded-full bg-white`,
                  {
                    transform: [{ translateX: isPrivate ? 20 : 4 }],
                    marginTop: 2
                  }
                ]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={[
              tw`bg-violet-600 rounded-2xl p-4 mb-4`,
              {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]} 
            onPress={handleCreateParty}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>Create Party 🎉</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}