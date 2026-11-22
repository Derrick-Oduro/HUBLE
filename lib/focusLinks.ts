import { useCallback, useState } from "react"
import { useFocusEffect } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { focusAPI } from "./api"

export type LinkableTaskType = "habit" | "daily" | "routine"

// Route params used to open the Focus tab already linked to a task,
// and to ask the Habits/Dailies tab to complete a task after a session.
export const focusLinkParams = (type: LinkableTaskType, id: number | string) => ({
  linkType: type,
  linkId: String(id),
})

export const formatFocusMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

// Today's focused minutes for each task of one type, refreshed whenever the screen is shown.
export function useFocusMinutes(type: LinkableTaskType) {
  const [minutesById, setMinutesById] = useState<Record<number, number>>({})

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      const load = async () => {
        const token = await AsyncStorage.getItem("userToken")
        const isGuest = await AsyncStorage.getItem("isGuest")
        if (!token || isGuest === "true") return
        try {
          const response = await focusAPI.getTaskTotals("today")
          if (cancelled || !response?.totals) return
          const next: Record<number, number> = {}
          for (const row of response.totals) {
            if (row.task_type === type && row.minutes > 0) next[Number(row.task_id)] = row.minutes
          }
          setMinutesById(next)
        } catch {
          // Focus totals are a nice-to-have; ignore failures.
        }
      }
      load()
      return () => {
        cancelled = true
      }
    }, [type]),
  )

  return minutesById
}
