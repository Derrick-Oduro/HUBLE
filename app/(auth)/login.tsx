"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

export default function LoginScreen() {
  const router = useRouter()
  const { loadStats } = useStats()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      try {
        await AsyncStorage.setItem("userToken", "demo-token")
        await loadStats()
        setIsLoading(false)
        router.replace("/(tabs)")
      } catch (error) {
        console.error("Login error:", error)
        setIsLoading(false)
        Alert.alert("Error", "Login failed. Please try again.")
      }
    }, 1000)
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      await AsyncStorage.setItem("userToken", "guest-token")
      setIsLoading(false)
      router.replace("/(tabs)")
    } catch (error) {
      console.error("Guest login error:", error)
      setIsLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1 justify-center px-6`}
        >
          {/* Simple Header */}
          <View style={tw`items-center mb-12`}>
            <View style={tw`bg-violet-600 w-16 h-16 rounded-2xl items-center justify-center mb-4`}>
              <Text style={tw`text-white text-2xl font-bold`}>H</Text>
            </View>
            <Text style={tw`text-white text-3xl font-bold mb-2`}>HUBLE</Text>
            <Text style={tw`text-gray-400 text-center`}>Welcome back</Text>
          </View>

          {/* Login Form */}
          <View style={tw`mb-8`}>
            {/* Email */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 mb-2`}>Email</Text>
              <TextInput
                style={tw`bg-gray-800 text-white p-4 rounded-lg`}
                placeholder="Enter your email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-300 mb-2`}>Password</Text>
              <View style={tw`flex-row items-center bg-gray-800 rounded-lg`}>
                <TextInput
                  style={tw`flex-1 text-white p-4`}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={tw`p-4`}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={tw`bg-violet-600 py-4 rounded-lg items-center mb-4 ${isLoading ? "opacity-70" : ""}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={tw`text-white font-bold`}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Guest Login */}
            <TouchableOpacity
              style={tw`bg-gray-800 py-4 rounded-lg items-center mb-6`}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              <Text style={tw`text-gray-300`}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={tw`flex-row justify-center`}>
            <Text style={tw`text-gray-400 mr-1`}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={tw`text-violet-500 font-bold`}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
