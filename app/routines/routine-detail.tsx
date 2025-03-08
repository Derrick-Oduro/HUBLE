"use client"

import RoutineDetail from "../../components/RoutineDetail"
import { useLocalSearchParams } from "expo-router"

export default function RoutineDetailScreen() {
  const params = useLocalSearchParams()

  // Create a route object that mimics the React Navigation route prop
  const route = {
    params: {
      routineId: params.id,
    },
  }

  return <RoutineDetail route={route} />
}

