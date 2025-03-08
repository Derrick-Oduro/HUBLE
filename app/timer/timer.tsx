"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"

export default function Timer() {
  const [time, setTime] = useState(25 * 60) // 25 minutes default
  const [isRunning, setIsRunning] = useState(false)
  const [isWorkSession, setIsWorkSession] = useState(true)
  const [sessionCount, setSessionCount] = useState(0)

  const workTime = 25 * 60
  const breakTime = 5 * 60
  const longBreakTime = 15 * 60

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      handleSessionEnd()
    }

    return () => clearInterval(interval)
  }, [isRunning, time])

  const handleSessionEnd = () => {
    setIsRunning(false)
    if (isWorkSession) {
      setSessionCount((prevCount) => prevCount + 1)
      if (sessionCount === 3) {
        setTime(longBreakTime)
        setSessionCount(0)
      } else {
        setTime(breakTime)
      }
    } else {
      setTime(workTime)
    }
    setIsWorkSession(!isWorkSession)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(workTime)
    setIsWorkSession(true)
    setSessionCount(0)
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 justify-center items-center px-5`}>
        <Text style={tw`text-3xl font-bold mb-8 text-white`}>{isWorkSession ? "Focus Time" : "Break Time"}</Text>

        <View style={tw`w-64 h-64 rounded-full bg-gray-800 flex justify-center items-center shadow-lg mb-8`}>
          <Text style={tw`text-6xl font-bold text-white`}>{formatTime(time)}</Text>
          <Text style={tw`text-lg text-gray-400 mt-2`}>Session {sessionCount + 1} / 4</Text>
        </View>

        <View style={tw`flex-row justify-center items-center mb-8`}>
          <TouchableOpacity style={tw`mx-2 p-4 bg-violet-600 rounded-full shadow-lg`} onPress={toggleTimer}>
            <Ionicons name={isRunning ? "pause" : "play"} size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={tw`mx-2 p-4 bg-gray-700 rounded-full shadow-lg`} onPress={resetTimer}>
            <Ionicons name="refresh" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <View style={tw`bg-gray-800 rounded-xl p-4 shadow-lg`}>
          <Text style={tw`text-white text-center mb-2`}>Pomodoro Technique</Text>
          <Text style={tw`text-gray-400 text-center`}>
            Work for 25 minutes, then take a 5-minute break.{"\n"}
            After 4 sessions, take a longer 15-minute break.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

