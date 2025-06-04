"use client"

import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"
import { useState } from "react"
import React from "react"

export default function Help() {
  const [feedbackType, setFeedbackType] = useState("suggestion")

  const tutorials = [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn the basics of the app",
      icon: "play-circle-outline",
    },
    {
      id: 2,
      title: "Creating Habits",
      description: "How to set up effective habits",
      icon: "add-circle-outline",
    },
    {
      id: 3,
      title: "Daily Routines",
      description: "Setting up morning and evening routines",
      icon: "repeat-outline",
    },
    {
      id: 4,
      title: "Focus Timer",
      description: "Using the Pomodoro technique",
      icon: "timer-outline",
    },
    {
      id: 5,
      title: "Tracking Progress",
      description: "How to monitor your improvement",
      icon: "analytics-outline",
    },
  ]

  const faqs = [
    {
      id: 1,
      question: "How do I reset my progress?",
      answer: "Go to More > Settings > Reset App Data to reset all your progress and start fresh.",
    },
    {
      id: 2,
      question: "Can I sync between devices?",
      answer: "Yes, enable Cloud Sync in the Settings to sync across devices.",
    },
    {
      id: 3,
      question: "How do streaks work?",
      answer: "Streaks count consecutive days where you've completed all your habits or daily tasks.",
    },
  ]

  const feedbackTypes = [
    { id: "suggestion", label: "Suggestion", icon: "bulb-outline" },
    { id: "bug", label: "Bug Report", icon: "bug-outline" },
    { id: "question", label: "Question", icon: "help-circle-outline" },
  ]

  return (
    <PageTemplate title="Help & Support">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={tw`text-white text-lg font-bold mb-3`}>Video Tutorials</Text>
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
          {tutorials.map((tutorial) => (
            <TouchableOpacity
              key={tutorial.id}
              style={tw`flex-row items-center mb-4 pb-4 ${tutorial.id !== tutorials.length ? "border-b border-gray-700" : "mb-0 pb-0"}`}
            >
              <View style={tw`bg-violet-600/20 p-3 rounded-full mr-3`}>
                <Ionicons name={tutorial.icon} size={24} color="#8B5CF6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white font-bold`}>{tutorial.title}</Text>
                <Text style={tw`text-gray-400 text-sm`}>{tutorial.description}</Text>
              </View>
              <Ionicons name="play" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={tw`text-white text-lg font-bold mb-3`}>Frequently Asked Questions</Text>
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
          {faqs.map((faq) => (
            <View
              key={faq.id}
              style={tw`mb-4 pb-4 ${faq.id !== faqs.length ? "border-b border-gray-700" : "mb-0 pb-0"}`}
            >
              <Text style={tw`text-white font-bold mb-1`}>{faq.question}</Text>
              <Text style={tw`text-gray-400 text-sm`}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Feedback Section (Integrated into Help) */}
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

          <TouchableOpacity style={tw`bg-violet-600 rounded-lg p-4 items-center`}>
            <Text style={tw`text-white font-medium`}>Open Feedback Form</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
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
      </ScrollView>
    </PageTemplate>
  )
}
