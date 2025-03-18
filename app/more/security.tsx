"use client"

import { View, Text, TouchableOpacity, Switch } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Security() {
  const [appLock, setAppLock] = useState(false)
  const [biometricAuth, setBiometricAuth] = useState(false)
  const [dataEncryption, setDataEncryption] = useState(true)

  return (
    <PageTemplate title="Security & Privacy">
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>App Lock</Text>
            <Text style={tw`text-gray-400 text-sm`}>Require PIN to open app</Text>
          </View>
          <Switch
            value={appLock}
            onValueChange={setAppLock}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={appLock ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>Biometric Authentication</Text>
            <Text style={tw`text-gray-400 text-sm`}>Use fingerprint or face ID</Text>
          </View>
          <Switch
            value={biometricAuth}
            onValueChange={setBiometricAuth}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={biometricAuth ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white text-lg`}>Data Encryption</Text>
            <Text style={tw`text-gray-400 text-sm`}>Encrypt your personal data</Text>
          </View>
          <Switch
            value={dataEncryption}
            onValueChange={setDataEncryption}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={dataEncryption ? "#ffffff" : "#f4f3f4"}
          />
        </View>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Security Options</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <TouchableOpacity style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Change PIN</Text>
            <Text style={tw`text-gray-400 text-sm`}>Update your security PIN</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Auto-Lock Timeout</Text>
            <Text style={tw`text-gray-400 text-sm`}>Lock after 5 minutes of inactivity</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white`}>Privacy Settings</Text>
            <Text style={tw`text-gray-400 text-sm`}>Manage data sharing preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={tw`bg-red-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Delete Account & Data</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

