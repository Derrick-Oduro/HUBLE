"use client"

import type React from "react"

import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../lib/tailwind"

interface PageTemplateProps {
  title: string
  children: React.ReactNode
}

export default function PageTemplate({ title, children }: PageTemplateProps) {
  const router = useRouter()

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold`}>{title}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </SafeAreaView>
  )
}

