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
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

export default function SignupScreen() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      try {
        await AsyncStorage.setItem("userToken", "demo-token")
        setIsLoading(false)
        router.replace("/(tabs)")
      } catch (error) {
        console.error("Signup error:", error)
        setIsLoading(false)
        Alert.alert("Error", "Signup failed. Please try again.")
      }
    }, 1000)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1 justify-center px-6`}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={tw`absolute top-12 left-6 z-10`}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Simple Header */}
          <View style={tw`items-center mb-12`}>
            <View style={tw`bg-violet-600 w-16 h-16 rounded-2xl items-center justify-center mb-4`}>
              <Text style={tw`text-white text-2xl font-bold`}>H</Text>
            </View>
            <Text style={tw`text-white text-3xl font-bold mb-2`}>HUBLE</Text>
            <Text style={tw`text-gray-400 text-center`}>Create your account</Text>
          </View>

          {/* Signup Form */}
          <View style={tw`mb-8`}>
            {/* Username */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 mb-2`}>Username</Text>
              <TextInput
                style={tw`bg-gray-800 text-white p-4 rounded-lg`}
                placeholder="Choose a username"
                placeholderTextColor="#6B7280"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

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
                  placeholder="Create a password"
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

            {/* Signup Button */}
            <TouchableOpacity
              style={tw`bg-violet-600 py-4 rounded-lg items-center mb-4 ${isLoading ? "opacity-70" : ""}`}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={tw`text-white font-bold`}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={tw`flex-row justify-center`}>
            <Text style={tw`text-gray-400 mr-1`}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={tw`text-violet-500 font-bold`}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
