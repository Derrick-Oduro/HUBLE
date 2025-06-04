"use client"

import { useState } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      try {
        // Save authentication token
        await AsyncStorage.setItem("userToken", "demo-token")
        setIsLoading(false)
        // Navigate to main app tabs
        router.replace("/(tabs)")
      } catch (error) {
        console.error("Login error:", error)
        setIsLoading(false)
        alert("Login failed. Please try again.")
      }
    }, 1500)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1 justify-center px-6`}
        >
          <View style={tw`items-center mb-8`}>
            <Text style={tw`text-violet-500 text-5xl font-bold mb-2`}>HUBLE</Text>
            <Text style={tw`text-gray-400 text-lg`}>Track habits, build routines</Text>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-2xl font-bold mb-6`}>Login</Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 mb-2`}>Email</Text>
              <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 py-3`}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={tw`mr-2`} />
                <TextInput
                  style={tw`flex-1 text-white`}
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-300 mb-2`}>Password</Text>
              <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 py-3`}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={tw`mr-2`} />
                <TextInput
                  style={tw`flex-1 text-white`}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={tw`self-end mb-6`}>
              <Text style={tw`text-violet-500`}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-violet-600 py-4 rounded-lg items-center ${isLoading ? "opacity-70" : ""}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="reload-outline" size={20} color="white" style={tw`mr-2 animate-spin`} />
                  <Text style={tw`text-white font-bold`}>Logging in...</Text>
                </View>
              ) : (
                <Text style={tw`text-white font-bold`}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

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
