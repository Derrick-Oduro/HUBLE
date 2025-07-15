"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import React from "react"

export default function Help() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const faqData = [
    {
      id: 1,
      question: "How do I earn XP and level up?",
      answer: "Complete habits, daily tasks, routines, and focus sessions to earn XP. Different activities give different amounts of XP based on difficulty and completion time.",
    },
    {
      id: 2,
      question: "What happens when I lose health?",
      answer: "Health decreases when you miss important tasks or break streaks. You can restore health by completing tasks consistently and maintaining good habits.",
    },
    {
      id: 3,
      question: "How do I unlock new themes and avatars?",
      answer: "Level up and complete achievements to unlock new customization options. Check the Achievements page to see what you need to unlock.",
    },
    {
      id: 4,
      question: "Can I backup my data?",
      answer: "Yes! Go to Settings > Data & Privacy > Auto Backup to enable automatic data backup to the cloud.",
    },
    {
      id: 5,
      question: "How do focus sessions work?",
      answer: "Set a timer, choose your activity, and focus! Completed sessions earn XP and contribute to your daily focus goals.",
    },
  ]

  const contactOptions = [
    {
      icon: "mail-outline",
      title: "Email Support",
      description: "Get help via email",
      action: () => Linking.openURL("mailto:support@huble.app"),
      color: "#3B82F6",
    },
    {
      icon: "chatbubble-outline",
      title: "Live Chat",
      description: "Chat with our team",
      action: () => {}, // Implement chat
      color: "#10B981",
    },
    {
      icon: "logo-twitter",
      title: "Twitter",
      description: "@HubleApp",
      action: () => Linking.openURL("https://twitter.com/hubleapp"),
      color: "#06B6D4",
    },
    {
      icon: "globe-outline",
      title: "Website",
      description: "Visit our website",
      action: () => Linking.openURL("https://huble.app"),
      color: colors.accent,
    },
  ]

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Help & Support</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Need Quick Help?
            </Text>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={[
                  tw`flex-1 rounded-xl p-4 mr-2 items-center`,
                  {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  },
                ]}
                onPress={() => Linking.openURL("mailto:support@huble.app")}
              >
                <Ionicons
                  name="mail"
                  size={24}
                  color="white"
                  style={tw`mb-2`}
                />
                <Text style={tw`text-white font-bold text-sm`}>Email Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  tw`flex-1 rounded-xl p-4 ml-2 items-center`,
                  {
                    backgroundColor: colors.success,
                    shadowColor: colors.success,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  },
                ]}
                onPress={() => {}} // Implement tutorial
              >
                <Ionicons
                  name="play-circle"
                  size={24}
                  color="white"
                  style={tw`mb-2`}
                />
                <Text style={tw`text-white font-bold text-sm`}>Tutorial</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
              Frequently Asked Questions
            </Text>

            {faqData.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  tw`p-4 rounded-xl mb-3`,
                  { backgroundColor: colors.cardSecondary }
                ]}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[tw`font-semibold flex-1 mr-3`, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={
                      expandedFAQ === faq.id ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedFAQ === faq.id && (
                  <Text style={[tw`mt-3 leading-5`, { color: colors.textSecondary }]}>
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Options */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Get In Touch</Text>

            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`flex-row items-center p-4 rounded-xl mb-3`,
                  { backgroundColor: colors.cardSecondary },
                ]}
                onPress={option.action}
              >
                <View
                  style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center mr-4`,
                    { backgroundColor: `${option.color}20` },
                  ]}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Tips */}
          <View style={[tw`rounded-2xl p-5`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Pro Tips</Text>

            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-yellow-400 text-lg mr-3`}>💡</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Set realistic goals and build habits gradually for long-term
                  success.
                </Text>
              </View>

              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-green-400 text-lg mr-3`}>🎯</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Use focus sessions to improve concentration and earn more XP.
                </Text>
              </View>

              <View style={tw`flex-row items-start`}>
                <Text style={tw`text-blue-400 text-lg mr-3`}>📊</Text>
                <Text style={[tw`flex-1`, { color: colors.textSecondary }]}>
                  Check your stats regularly to track progress and stay motivated.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
