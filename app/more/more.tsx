import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../../lib/tailwind"

export default function More() {
  const menuItems = [
    { icon: "person-outline", label: "Profile" },
    { icon: "stats-chart-outline", label: "Stats" },
    { icon: "medal-outline", label: "Achievements" },
    { icon: "help-circle-outline", label: "Help & Support" },
    { icon: "star-outline", label: "Rate Us" },
    { icon: "share-social-outline", label: "Share App" },
  ]

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header Section */}
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={tw`text-white text-2xl font-bold`}>More</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Menu Items */}
          <View style={tw`bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6`}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={tw`p-4 flex-row items-center ${
                  index !== menuItems.length - 1 ? "border-b border-gray-700" : ""
                }`}
                activeOpacity={0.7}
              >
                <View style={tw`bg-violet-600 rounded-full p-2 mr-4`}>
                  <Ionicons name={item.icon} size={24} color="white" />
                </View>
                <Text style={tw`text-white text-lg`}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" style={tw`ml-auto`} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-xl p-4 flex-row items-center justify-center shadow-lg`}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={tw`ml-2 text-white text-lg font-bold`}>Settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Version Info */}
        <Text style={tw`text-gray-500 text-center mt-6`}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

