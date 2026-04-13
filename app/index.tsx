"use client"

import React, { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import tw from "../lib/tailwind"


export default function Index() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken")
        const onboardingComplete = await AsyncStorage.getItem("onboardingComplete")

        if (userToken) {
          // User is authenticated, but must complete onboarding once.
          if (onboardingComplete === "true") {
            router.replace("/(tabs)")
          } else {
            router.replace("/onboarding")
          }
        } else {
          // User is not authenticated, go to login
          router.replace("/(auth)/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // Default to login on error
        router.replace("/(auth)/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  return (
    <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
      <ActivityIndicator size="small" color="#8B5CF6" />
    </View>
  )
}
