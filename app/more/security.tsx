"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Switch, Alert, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"

export default function Security() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  
  // Security settings state
  const [biometricAuth, setBiometricAuth] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [autoLogout, setAutoLogout] = useState(true)
  const [dataEncryption, setDataEncryption] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "You will be redirected to reset your password securely.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => {
          // Implement password change
          Alert.alert("Success", "Password change email has been sent to your registered email address.")
        }}
      ]
    )
  }

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This will create a backup file with all your habits, dailies, and progress data.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => {
          // Implement data export
          Alert.alert("Success", "Your data has been exported successfully.")
        }}
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted from our servers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Type 'DELETE' to confirm account deletion:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm",
                  style: "destructive",
                  onPress: () => {
                    // Implement account deletion
                    Alert.alert("Account Deleted", "Your account has been permanently deleted.")
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const securityOptions = [
    {
      title: "Biometric Authentication",
      description: "Use fingerprint or face recognition to unlock the app",
      icon: "finger-print-outline",
      color: colors.accent,
      value: biometricAuth,
      setter: setBiometricAuth,
    },
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: "shield-checkmark-outline",
      color: colors.success,
      value: twoFactorAuth,
      setter: setTwoFactorAuth,
    },
    {
      title: "Auto Logout",
      description: "Automatically sign out after 30 minutes of inactivity",
      icon: "time-outline",
      color: colors.warning,
      value: autoLogout,
      setter: setAutoLogout,
    },
    {
      title: "Data Encryption",
      description: "Encrypt all your data stored locally on this device",
      icon: "lock-closed-outline",
      color: colors.error,
      value: dataEncryption,
      setter: setDataEncryption,
    },
  ]

  const privacyOptions = [
    {
      title: "Privacy Mode",
      description: "Hide sensitive information in app previews and screenshots",
      icon: "eye-off-outline",
      color: "#8B5CF6",
      value: privacyMode,
      setter: setPrivacyMode,
    },
  ]

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Security & Privacy</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Security Section */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Security</Text>
            
            {securityOptions.map((option, index) => (
              <View key={index}>
                <View style={tw`flex-row items-center py-4`}>
                  <View style={[
                    tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                    { backgroundColor: `${option.color}20` }
                  ]}>
                    <Ionicons name={option.icon} size={20} color={option.color} />
                  </View>
                  
                  <View style={tw`flex-1 mr-3`}>
                    <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  
                  <Switch
                    value={option.value}
                    onValueChange={option.setter}
                    trackColor={{ false: colors.cardSecondary, true: option.color + '80' }}
                    thumbColor={option.value ? option.color : colors.textSecondary}
                  />
                </View>
                {index !== securityOptions.length - 1 && (
                  <View style={[tw`h-px`, { backgroundColor: colors.cardSecondary }]} />
                )}
              </View>
            ))}
          </View>

          {/* Privacy Section */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Privacy</Text>
            
            {privacyOptions.map((option, index) => (
              <View key={index}>
                <View style={tw`flex-row items-center py-4`}>
                  <View style={[
                    tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                    { backgroundColor: `${option.color}20` }
                  ]}>
                    <Ionicons name={option.icon} size={20} color={option.color} />
                  </View>
                  
                  <View style={tw`flex-1 mr-3`}>
                    <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  
                  <Switch
                    value={option.value}
                    onValueChange={option.setter}
                    trackColor={{ false: colors.cardSecondary, true: option.color + '80' }}
                    thumbColor={option.value ? option.color : colors.textSecondary}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Account Security */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Account Security</Text>
            
            <TouchableOpacity
              style={[
                tw`flex-row items-center py-4 border-b`,
                { borderColor: colors.cardSecondary }
              ]}
              onPress={handleChangePassword}
            >
              <View style={[
                tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                { backgroundColor: colors.warning + '20' }
              ]}>
                <Ionicons name="key-outline" size={20} color={colors.warning} />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                  Change Password
                </Text>
                <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                  Update your account password securely
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row items-center py-4`}
              onPress={() => {
                Alert.alert(
                  "Active Sessions",
                  "You are currently signed in on 1 device:\n\n• iPhone 12 Pro (This device)\n\nLast active: Now",
                  [{ text: "OK" }]
                )
              }}
            >
              <View style={[
                tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                { backgroundColor: colors.accent + '20' }
              ]}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                  Active Sessions
                </Text>
                <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                  Manage devices signed into your account
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: colors.card }]}>
            <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Data Management</Text>
            
            <TouchableOpacity
              style={[
                tw`flex-row items-center py-4 border-b`,
                { borderColor: colors.cardSecondary }
              ]}
              onPress={handleExportData}
            >
              <View style={[
                tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                { backgroundColor: colors.success + '20' }
              ]}>
                <Ionicons name="download-outline" size={20} color={colors.success} />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={[tw`font-semibold text-base`, { color: colors.text }]}>
                  Export Data
                </Text>
                <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                  Download a copy of all your data
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row items-center py-4`}
              onPress={handleDeleteAccount}
            >
              <View style={[
                tw`w-10 h-10 rounded-lg items-center justify-center mr-4`,
                { backgroundColor: colors.error + '20' }
              ]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={[tw`font-semibold text-base`, { color: colors.error }]}>
                  Delete Account
                </Text>
                <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                  Permanently delete your account and all data
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View style={[tw`rounded-2xl p-5`, { backgroundColor: colors.error + '10' }]}>
            <View style={tw`flex-row items-start`}>
              <Ionicons name="warning" size={20} color={colors.error} style={tw`mr-3 mt-0.5`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`font-bold text-sm`, { color: colors.error }]}>Important Security Note</Text>
                <Text style={[tw`text-sm mt-2`, { color: colors.textSecondary }]}>
                  Keep your account secure by using a strong password, enabling two-factor authentication, and never sharing your login credentials.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

