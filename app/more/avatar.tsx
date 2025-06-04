"use client"

import { View, Text, TouchableOpacity, Image } from "react-native"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"
import React from "react"

export default function Avatar() {
  const avatarStyles = [
    { id: 1, name: "Default", image: "/placeholder.svg?height=60&width=60" },
    { id: 2, name: "Warrior", image: "/placeholder.svg?height=60&width=60" },
    { id: 3, name: "Mage", image: "/placeholder.svg?height=60&width=60" },
    { id: 4, name: "Rogue", image: "/placeholder.svg?height=60&width=60" },
  ]

  const avatarColors = [
    { id: 1, color: "bg-violet-600", name: "Purple" },
    { id: 2, color: "bg-blue-600", name: "Blue" },
    { id: 3, color: "bg-green-600", name: "Green" },
    { id: 4, color: "bg-yellow-600", name: "Yellow" },
    { id: 5, color: "bg-red-600", name: "Red" },
  ]

  return (
    <PageTemplate title="Customize Avatar">
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6 items-center`}>
        <Image
          source={{ uri: "/placeholder.svg?height=100&width=100" }}
          style={tw`w-24 h-24 rounded-full mb-4 bg-gray-700`}
        />
        <Text style={tw`text-white text-lg font-bold`}>WhiteMisty</Text>
        <Text style={tw`text-gray-400`}>Level 4 • 83/100 XP</Text>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Avatar Style</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row flex-wrap justify-between`}>
          {avatarStyles.map((style) => (
            <TouchableOpacity key={style.id} style={tw`items-center mb-4 w-1/4`}>
              <View
                style={tw`border-2 ${style.id === 1 ? "border-violet-600" : "border-transparent"} rounded-full p-1`}
              >
                <Image source={{ uri: style.image }} style={tw`w-14 h-14 rounded-full bg-gray-700`} />
              </View>
              <Text style={tw`text-white text-xs mt-1`}>{style.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Avatar Color</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row flex-wrap justify-between`}>
          {avatarColors.map((color) => (
            <TouchableOpacity key={color.id} style={tw`items-center mb-4 w-1/5`}>
              <View style={tw`border-2 ${color.id === 1 ? "border-white" : "border-transparent"} rounded-full p-1`}>
                <View style={tw`${color.color} w-10 h-10 rounded-full`} />
              </View>
              <Text style={tw`text-white text-xs mt-1`}>{color.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Save Changes</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

