"use client"

import { View, Text, TouchableOpacity, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Themes() {
  const [darkMode, setDarkMode] = useState(true)
  const [purpleTheme, setPurpleTheme] = useState(true)
  const [blueTheme, setBlueTheme] = useState(false)
  const [greenTheme, setGreenTheme] = useState(false)

  const themes = [
    { id: 1, name: "Purple", color: "bg-violet-600", state: purpleTheme, setState: setPurpleTheme },
    { id: 2, name: "Blue", color: "bg-blue-600", state: blueTheme, setState: setBlueTheme },
    { id: 3, name: "Green", color: "bg-green-600", state: greenTheme, setState: setGreenTheme },
  ]

  const selectTheme = (id) => {
    // Reset all themes
    setPurpleTheme(false)
    setBlueTheme(false)
    setGreenTheme(false)

    // Set the selected theme
    themes.find((theme) => theme.id === id)?.setState(true)
  }

  return (
    <PageTemplate title="Themes & Dark Mode">
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View>
            <Text style={tw`text-white text-lg font-bold`}>Dark Mode</Text>
            <Text style={tw`text-gray-400 text-sm`}>Use dark theme throughout the app</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={darkMode ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <Text style={tw`text-white text-sm mb-1`}>Preview:</Text>
        <View style={tw`${darkMode ? "bg-gray-900" : "bg-gray-100"} p-4 rounded-lg mb-2`}>
          <Text style={tw`${darkMode ? "text-white" : "text-gray-900"} font-bold`}>Sample Text</Text>
          <Text style={tw`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>This is how text will appear</Text>
        </View>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Color Theme</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={tw`flex-row justify-between items-center ${theme.id !== themes.length ? "mb-4 pb-4 border-b border-gray-700" : ""}`}
            onPress={() => selectTheme(theme.id)}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`${theme.color} w-6 h-6 rounded-full mr-3`} />
              <Text style={tw`text-white`}>{theme.name} Theme</Text>
            </View>
            <View style={tw`w-6 h-6 rounded-full border border-gray-600 items-center justify-center`}>
              {theme.state && <View style={tw`w-4 h-4 rounded-full bg-violet-600`} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>UI Customization</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <TouchableOpacity style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Text Size</Text>
            <Text style={tw`text-gray-400 text-sm`}>Adjust app text size</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-white mr-2`}>Medium</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white`}>Button Style</Text>
            <Text style={tw`text-gray-400 text-sm`}>Choose button appearance</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-white mr-2`}>Rounded</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Save Changes</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

