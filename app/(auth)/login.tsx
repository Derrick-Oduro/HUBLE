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
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../contexts/ThemeProvider"
import { useStats } from "../../contexts/StatsProvider"
import React from "react"

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.30.28.124:3000/api'
  : 'https://your-production-api.com/api';

export default function LoginScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { loadUserStats } = useStats()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        
        if (token && isLoggedIn === "true") {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking existing login:", error);
      }
    };

    checkExistingLogin();
  }, [router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication data
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        await AsyncStorage.setItem("isLoggedIn", "true");

        // Load user stats
        await loadUserStats();

        Alert.alert(
          "Welcome Back! 👋",
          `Hi ${data.user.username}! Ready to continue your journey?`,
          [
            {
              text: "Let's Go! 🚀",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
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
          Alert.alert("Login Failed", data.error || "Invalid email or password.");
        }
      }

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error", 
        "Unable to connect to server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // For guest login, we'll create a temporary guest account
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

        await loadUserStats();
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Failed to create guest session. Please try again.");
      }
    } catch (error) {
      console.error("Guest login error:", error);
      Alert.alert("Error", "Failed to create guest session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be available in a future update. For now, please contact support if you need help accessing your account.",
      [{ text: "OK" }]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1 justify-center px-6`}
        >
          {/* Header */}
          <View style={tw`items-center mb-12`}>
            <View style={[
              tw`w-16 h-16 rounded-2xl items-center justify-center mb-4`,
              { backgroundColor: colors.accent }
            ]}>
              <Text style={tw`text-white text-2xl font-bold`}>H</Text>
            </View>
            <Text style={[tw`text-3xl font-bold mb-2`, { color: colors.text }]}>HUBLE</Text>
            <Text style={[tw`text-center`, { color: colors.textSecondary }]}>Welcome back</Text>
          </View>

          {/* Login Form */}
          <View style={tw`mb-8`}>
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity 
              onPress={handleForgotPassword}
              style={tw`mb-6`}
              disabled={isLoading}
            >
              <Text style={[tw`text-right`, { color: colors.accent }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                tw`py-4 rounded-xl items-center mb-4`,
                { 
                  backgroundColor: colors.accent,
                  opacity: isLoading ? 0.7 : 1
                }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={tw`flex-row items-center`}>
                  <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
                  <Text style={tw`text-white font-bold`}>Signing in...</Text>
                </View>
              ) : (
                <Text style={tw`text-white font-bold text-base`}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Guest Login */}
            <TouchableOpacity
              style={[
                tw`py-4 rounded-xl items-center mb-6`,
                { backgroundColor: colors.cardSecondary }
              ]}
              onPress={handleGuestLogin}
              disabled={isLoading}
            >
              <Text style={[tw`font-medium`, { color: colors.text }]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={tw`flex-row justify-center`}>
            <Text style={[tw`mr-1`, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/signup")}
              disabled={isLoading}
            >
              <Text style={[tw`font-bold`, { color: colors.accent }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
