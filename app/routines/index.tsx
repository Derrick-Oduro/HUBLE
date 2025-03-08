"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import AddRoutineModal from "../../components/AddRoutineModal"

export default function Routines() {
  const [routines, setRoutines] = useState([
    { id: "1", title: "Morning Routine", icon: "sunny", description: "Start your day with good habits" },
    { id: "2", title: "Afternoon Routine", icon: "partly-sunny", description: "Stay productive through the day" },
    { id: "3", title: "Evening Routine", icon: "moon", description: "End your day on a positive note" },
  ])

  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const router = useRouter()

  const addRoutine = (newRoutine: { id: string; title: string; icon: string; description: string }) => {
    setRoutines([...routines, { ...newRoutine, id: Date.now().toString() }])
  }

  const deleteRoutine = (id) => {
    setRoutines(routines.filter((routine) => routine.id !== id))
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
          <Text style={tw`text-white text-2xl font-bold`}>Daily Routines</Text>
          <TouchableOpacity
            style={tw`bg-violet-600 rounded-full p-2 shadow-lg`}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={tw`bg-gray-800 rounded-xl mb-4 overflow-hidden shadow-lg`}
              onPress={() =>
                router.push({
                  pathname: "/routines/routine-detail",
                  params: { id: routine.id },
                })
              }
            >
              <View style={tw`p-4`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`bg-violet-600 rounded-full p-2 mr-3`}>
                      <Ionicons name={routine.icon} size={24} color="white" />
                    </View>
                    <Text style={tw`text-white text-lg font-bold`}>{routine.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteRoutine(routine.id)}>
                    <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text style={tw`text-gray-400`}>{routine.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <AddRoutineModal isVisible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAdd={addRoutine} />
      </View>
    </SafeAreaView>
  )
}

