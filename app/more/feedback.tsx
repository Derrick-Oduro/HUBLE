"use client"

import { View, Text, TouchableOpacity, TextInput } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Feedback() {
  const [feedbackType, setFeedbackType] = useState("suggestion")
  const [feedbackText, setFeedbackText] = useState("")

  const feedbackTypes = [
    { id: "suggestion", label: "Suggestion", icon: "bulb-outline" },
    { id: "bug", label: "Bug Report", icon: "bug-outline" },
    { id: "question", label: "Question", icon: "help-circle-outline" },
  ]

  return (
    <PageTemplate title="Feedback & Support">
      <Text style={tw`text-white text-lg font-bold mb-3`}>Send Feedback</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <Text style={tw`text-white mb-3`}>Feedback Type</Text>
        <View style={tw`flex-row mb-4`}>
          {feedbackTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={tw`flex-1 items-center justify-center p-3 rounded-lg mr-2 ${feedbackType === type.id ? "bg-violet-600" : "bg-gray-700"}`}
              onPress={() => setFeedbackType(type.id)}
            >
              <Ionicons name={type.icon} size={20} color="white" style={tw`mb-1`} />
              <Text style={tw`text-white text-xs`}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={tw`text-white mb-2`}>Your Feedback</Text>
        <TextInput
          style={tw`bg-gray-700 text-white p-3 rounded-lg min-h-[120px] mb-4`}
          placeholder="Describe your feedback, issue, or question..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          value={feedbackText}
          onChangeText={setFeedbackText}
        />

        <TouchableOpacity style={tw`bg-violet-600 rounded-lg p-4 items-center`}>
          <Text style={tw`text-white font-medium`}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Contact Support</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <TouchableOpacity style={tw`flex-row items-center mb-4 pb-4 border-b border-gray-700`}>
          <View style={tw`bg-violet-600/20 p-3 rounded-full mr-3`}>
            <Ionicons name="mail-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-white font-bold`}>Email Support</Text>
            <Text style={tw`text-gray-400 text-sm`}>support@routineapp.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row items-center`}>
          <View style={tw`bg-violet-600/20 p-3 rounded-full mr-3`}>
            <Ionicons name="chatbubbles-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-white font-bold`}>Live Chat</Text>
            <Text style={tw`text-gray-400 text-sm`}>Chat with our support team</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={tw`bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-6`}>
        <View>
          <Text style={tw`text-white font-bold`}>FAQ</Text>
          <Text style={tw`text-gray-400 text-sm`}>Frequently asked questions</Text>
        </View>
        <Ionicons name="help-circle-outline" size={24} color="#8B5CF6" />
      </TouchableOpacity>
    </PageTemplate>
  )
}

