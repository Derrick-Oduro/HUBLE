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
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

// Find your computer's IP address first
const getAPIBaseURL = () => {
  if (__DEV__) {
    // Force use of your computer's IP address for physical device
    return 'http://10.174.59.124:3000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = 'http://10.30.28.124:3000/api';

export default function SignupScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { loadUserStats } = useStats() // ← FIX: Change from loadStats to loadUserStats
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const requestData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password
      };
      
      console.log('🚀 Attempting signup to:', `${API_BASE_URL}/auth/register`);
      console.log('📤 Request data:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      if (data.success) {
        // Store authentication data
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        await AsyncStorage.setItem("isLoggedIn", "true");

        // Load user stats (FIX: Change function name)
        if (loadUserStats) {
          try {
            await loadUserStats(); // ← FIX: Change from loadStats() to loadUserStats()
          } catch (statsError) {
            console.warn('Failed to load stats:', statsError);
          }
        }

        Alert.alert(
          "Account Created! 🎉",
          "Welcome to HUBLE! Your journey to better habits starts now.",
          [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }]
        );

      } else {
        // Handle validation errors from backend
        if (data.details && Array.isArray(data.details)) {
          const backendErrors = {};
          data.details.forEach(error => {
            backendErrors[error.field] = error.message;
          });
          setErrors(backendErrors);
        } else {
          Alert.alert("Signup Failed", data.error || "Failed to create account. Please try again.");
        }
      }

    } catch (error) {
      console.error("❌ Signup error:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      
      // More specific error messages
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          "Connection Error", 
          "Cannot reach the server. Make sure your backend is running."
        );
      } else if (error.message.includes('timeout')) {
        Alert.alert(
          "Timeout Error", 
          "Server is taking too long to respond."
        );
      } else {
        Alert.alert(
          "Error", 
          `Signup failed: ${error.message}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignup = async () => {
    setIsLoading(true);
    try {
      // Create guest account with random credentials
      const guestUsername = `Guest${Math.floor(Math.random() * 10000)}`;
      const guestEmail = `${guestUsername.toLowerCase()}@guest.huble.app`;
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: guestUsername,
          email: guestEmail,
          password: "guest123456"
        }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("isGuest", "true");

        await loadUserStats(); // ← FIX: Change from loadStats() to loadUserStats()
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Failed to create guest account. Please try again.");
      }
    } catch (error) {
      console.error("Guest signup error:", error);
      Alert.alert("Error", "Failed to create guest account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      console.log('🔍 API URL:', API_BASE_URL);
      
      // Test health endpoint first
      const healthURL = API_BASE_URL.replace('/api', '/health');
      console.log('🔍 Health URL:', healthURL);
      
      const response = await fetch(healthURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend response:', data);
        Alert.alert('✅ Success', `Backend connected!\nMessage: ${data.message || 'OK'}`);
        
        // Now test the signup endpoint exists
        console.log('🔍 Testing signup endpoint...');
        const signupResponse = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'OPTIONS', // Just check if endpoint exists
        });
        console.log('📥 Signup endpoint status:', signupResponse.status);
        
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      Alert.alert('❌ Connection Failed', `Error: ${error.message}`);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
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
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={tw`items-center mb-12`}>
            <View style={[
              tw`w-16 h-16 rounded-2xl items-center justify-center mb-4`,
              { backgroundColor: colors.accent }
            ]}>
              <Text style={tw`text-white text-2xl font-bold`}>H</Text>
            </View>
            <Text style={[tw`text-3xl font-bold mb-2`, { color: colors.text }]}>HUBLE</Text>
            <Text style={[tw`text-center`, { color: colors.textSecondary }]}>
              Create your account and start building better habits
            </Text>
          </View>

          {/* Signup Form */}
          <View style={tw`mb-8`}>
            {/* Username */}
            <View style={tw`mb-4`}>
              <Text style={[tw`mb-2`, { color: colors.textSecondary }]}>Username</Text>
              <TextInput
                style={[
                  tw`p-4 rounded-xl text-base`,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderWidth: errors.username ? 2 : 1,
                    borderColor: errors.username ? colors.error : colors.cardSecondary
                  }
                ]}
                placeholder="Choose a username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) setErrors({...errors, username: null});
                }}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.username && (
                <Text style={[tw`text-sm mt-1`, { color: colors.error }]}>
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={tw`mb-4`}>
              <Text style={[tw`mb-2`, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[
                  tw`p-4 rounded-xl text-base`,
                  { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderWidth: errors.email ? 2 : 1,
                    borderColor: errors.email ? colors.error : colors.cardSecondary
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({...errors, email: null});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.email && (
                <Text style={[tw`text-sm mt-1`, { color: colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={tw`mb-6`}>
              <Text style={[tw`mb-2`, { color: colors.textSecondary }]}>Password</Text>
              <View style={[
                tw`flex-row items-center rounded-xl`,
                { 
                  backgroundColor: colors.card,
                  borderWidth: errors.password ? 2 : 1,
                  borderColor: errors.password ? colors.error : colors.cardSecondary
                }
              ]}>
                <TextInput
                  style={[tw`flex-1 p-4 text-base`, { color: colors.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({...errors, password: null});
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={tw`p-4`}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[tw`text-sm mt-1`, { color: colors.error }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                tw`py-4 rounded-xl items-center mb-4`,
                { 
                  backgroundColor: colors.accent,
                  opacity: isLoading ? 0.7 : 1
                }
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={tw`flex-row items-center`}>
                  <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
                  <Text style={tw`text-white font-bold`}>Creating account...</Text>
                </View>
              ) : (
                <Text style={tw`text-white font-bold text-base`}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Guest Signup */}
            <TouchableOpacity
              style={[
                tw`py-4 rounded-xl items-center mb-6`,
                { backgroundColor: colors.cardSecondary }
              ]}
              onPress={handleGuestSignup}
              disabled={isLoading}
            >
              <Text style={[tw`font-medium`, { color: colors.text }]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>

            {/* Test Backend Connection - Temporary Button */}
            <TouchableOpacity
              style={[
                tw`py-2 px-4 rounded-lg mb-4`,
                { backgroundColor: colors.cardSecondary }
              ]}
              onPress={testBackendConnection}
            >
              <Text style={[tw`text-center`, { color: colors.text }]}>
                Test Backend Connection
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={tw`flex-row justify-center`}>
            <Text style={[tw`mr-1`, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/login")}
              disabled={isLoading}
            >
              <Text style={[tw`font-bold`, { color: colors.accent }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
