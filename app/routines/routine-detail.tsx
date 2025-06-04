"use client"

import { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import RoutineDetail from "../../components/RoutineDetail"
import { useLocalSearchParams } from "expo-router"
import tw from "../../lib/tailwind"
import React from "react"

export default function RoutineDetailScreen() {
  const params = useLocalSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  // Create a route object that mimics the React Navigation route prop
  const route = {
    params: {
      routineId: params.id,
    },
  }

  useEffect(() => {
    // Short timeout to ensure localStorage is ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  return <RoutineDetail route={route} />
}

