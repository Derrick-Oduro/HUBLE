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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (!agreeToTerms) {
      alert("Please agree to the Terms and Conditions")
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
        console.error("Signup error:", error)
        setIsLoading(false)
        alert("Signup failed. Please try again.")
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`py-8`}>
            <TouchableOpacity style={tw`absolute top-2 left-0 z-10`} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={tw`items-center mb-8`}>
              <Text style={tw`text-violet-500 text-5xl font-bold mb-2`}>HUBLE</Text>
              <Text style={tw`text-gray-400 text-lg`}>Create your account</Text>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-white text-2xl font-bold mb-6`}>Sign Up</Text>

              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-300 mb-2`}>Username</Text>
                <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 py-3`}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={tw`mr-2`} />
                  <TextInput
                    style={tw`flex-1 text-white`}
                    placeholder="Choose a username"
                    placeholderTextColor="#6B7280"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

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

              <View style={tw`mb-4`}>
                <Text style={tw`text-gray-300 mb-2`}>Password</Text>
                <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 py-3`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={tw`mr-2`} />
                  <TextInput
                    style={tw`flex-1 text-white`}
                    placeholder="Create a password"
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

              <View style={tw`mb-6`}>
                <Text style={tw`text-gray-300 mb-2`}>Confirm Password</Text>
                <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 py-3`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={tw`mr-2`} />
                  <TextInput
                    style={tw`flex-1 text-white`}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={tw`flex-row items-center mb-6`} onPress={() => setAgreeToTerms(!agreeToTerms)}>
                <View
                  style={tw`w-5 h-5 rounded border ${agreeToTerms ? "bg-violet-600 border-violet-600" : "border-gray-500"} mr-2 items-center justify-center`}
                >
                  {agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={tw`text-gray-300`}>
                  I agree to the <Text style={tw`text-violet-500`}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-violet-600 py-4 rounded-lg items-center ${isLoading ? "opacity-70" : ""}`}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="reload-outline" size={20} color="white" style={tw`mr-2 animate-spin`} />
                    <Text style={tw`text-white font-bold`}>Creating account...</Text>
                  </View>
                ) : (
                  <Text style={tw`text-white font-bold`}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row justify-center`}>
              <Text style={tw`text-gray-400 mr-1`}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={tw`text-violet-500 font-bold`}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
