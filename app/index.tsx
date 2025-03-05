import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import HabitItem from "../components/HabitItem"
import ProgressBar from "../components/ProgressBar"

export default function HabitsScreen() {
  // Dummy data for habits
  const habits = [
    { id: 1, title: "30 minutes with the word of God", color: "green-500" },
    { id: 2, title: "Read at least 20 to 30 minutes", color: "blue-500", subtext: "Or delete it from the edit screen" },
    { id: 3, title: "Wake up Time 5:30", color: "yellow-500", subtext: "I am supposed to wake up 5:30 to 40" },
    { id: 4, title: "Study/Procrastinate", color: "green-500" },
  ]

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        {/* Header Section */}
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={tw`text-white text-2xl font-bold`}>Habits</Text>
          <TouchableOpacity style={tw`bg-violet-600 rounded-full p-2 shadow-lg`} activeOpacity={0.7}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Stats Card */}
        <View style={tw`bg-gray-800 rounded-xl p-4 mb-6 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white text-lg font-bold`}>Level 4</Text>
            <View style={tw`flex-row items-center`}>
              <View style={tw`flex-row items-center mr-4`}>
                <Text style={tw`text-white text-lg mr-1`}>💎</Text>
                <Text style={tw`text-white text-lg font-medium`}>20</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-white text-lg mr-1`}>🟡</Text>
                <Text style={tw`text-white text-lg font-medium`}>27</Text>
              </View>
            </View>
          </View>

          <ProgressBar value={17} max={100} color="yellow-500" label="Experience" />
          <View style={tw`h-3`} />
          <ProgressBar value={50} max={50} color="red-500" label="Health" />
        </View>

        {/* Habit List */}
        <Text style={tw`text-white text-lg font-semibold mb-3`}>Today's Habits</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-4`}>
          {habits.map((habit) => (
            <HabitItem key={habit.id} title={habit.title} color={habit.color} subtext={habit.subtext} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

