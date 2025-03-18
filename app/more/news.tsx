"use client"

import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function News() {
  const newsItems = [
    {
      id: 1,
      title: "New Quest System Released!",
      date: "March 18, 2025",
      description: "Complete special challenges to earn rewards and boost your progress.",
      image: "/placeholder.svg?height=80&width=120",
      tag: "New Feature",
    },
    {
      id: 2,
      title: "App Update v2.5 Available",
      date: "March 15, 2025",
      description: "Bug fixes, performance improvements, and new customization options.",
      image: "/placeholder.svg?height=80&width=120",
      tag: "Update",
    },
    {
      id: 3,
      title: "Coming Soon: Social Challenges",
      date: "March 10, 2025",
      description: "Compete with friends and join community challenges in our next update.",
      image: "/placeholder.svg?height=80&width=120",
      tag: "Preview",
    },
  ]

  const getTagColor = (tag) => {
    switch (tag) {
      case "New Feature":
        return "bg-green-600"
      case "Update":
        return "bg-blue-600"
      case "Preview":
        return "bg-yellow-600"
      default:
        return "bg-violet-600"
    }
  }

  return (
    <PageTemplate title="News & Updates">
      <View style={tw`bg-violet-600/20 rounded-xl p-4 mb-6 border border-violet-600`}>
        <Text style={tw`text-white text-center`}>Stay updated with the latest features and improvements!</Text>
      </View>

      {newsItems.map((item) => (
        <TouchableOpacity key={item.id} style={tw`bg-gray-800 rounded-xl overflow-hidden mb-6`}>
          <Image source={{ uri: item.image }} style={tw`w-full h-32 bg-gray-700`} />
          <View style={tw`p-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`${getTagColor(item.tag)} px-2 py-1 rounded-full`}>
                <Text style={tw`text-white text-xs font-bold`}>{item.tag}</Text>
              </View>
              <Text style={tw`text-gray-400 text-xs`}>{item.date}</Text>
            </View>
            <Text style={tw`text-white text-lg font-bold mb-1`}>{item.title}</Text>
            <Text style={tw`text-gray-400 text-sm mb-3`}>{item.description}</Text>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-violet-500 mr-1`}>Read more</Text>
              <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={tw`bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-6`}>
        <View>
          <Text style={tw`text-white font-bold`}>Release Notes</Text>
          <Text style={tw`text-gray-400 text-sm`}>View all previous updates</Text>
        </View>
        <Ionicons name="list-outline" size={24} color="#8B5CF6" />
      </TouchableOpacity>
    </PageTemplate>
  )
}

