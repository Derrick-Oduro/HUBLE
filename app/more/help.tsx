"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Help() {
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
      answer: "Go to More > Reset App Data to reset all your progress and start fresh.",
    },
    {
      id: 2,
      question: "Can I sync between devices?",
      answer: "Yes, enable Cloud Sync in the Data Backup & Sync settings to sync across devices.",
    },
    {
      id: 3,
      question: "How do streaks work?",
      answer: "Streaks count consecutive days where you've completed all your habits or daily tasks.",
    },
  ]

  return (
    <PageTemplate title="Help & Tutorials">
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
          <View key={faq.id} style={tw`mb-4 pb-4 ${faq.id !== faqs.length ? "border-b border-gray-700" : "mb-0 pb-0"}`}>
            <Text style={tw`text-white font-bold mb-1`}>{faq.question}</Text>
            <Text style={tw`text-gray-400 text-sm`}>{faq.answer}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={tw`bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-6`}>
        <View>
          <Text style={tw`text-white font-bold`}>User Guide</Text>
          <Text style={tw`text-gray-400 text-sm`}>Complete documentation</Text>
        </View>
        <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
      </TouchableOpacity>

      <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Contact Support</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

