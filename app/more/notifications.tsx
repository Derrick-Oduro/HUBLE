"use client"

import { View, Text, TouchableOpacity, Switch } from "react-native"
import { useState } from "react"
import tw from "../../lib/tailwind"
import PageTemplate from "../../components/PageTemplate"

export default function Notifications() {
  const [dailyReminders, setDailyReminders] = useState(true)
  const [habitReminders, setHabitReminders] = useState(true)
  const [routineReminders, setRoutineReminders] = useState(true)
  const [focusReminders, setFocusReminders] = useState(false)
  const [achievementNotifications, setAchievementNotifications] = useState(true)

  return (
    <PageTemplate title="Notifications & Reminders">
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>Daily Task Reminders</Text>
            <Text style={tw`text-gray-400 text-sm`}>Remind you of incomplete daily tasks</Text>
          </View>
          <Switch
            value={dailyReminders}
            onValueChange={setDailyReminders}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={dailyReminders ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>Habit Reminders</Text>
            <Text style={tw`text-gray-400 text-sm`}>Remind you to complete your habits</Text>
          </View>
          <Switch
            value={habitReminders}
            onValueChange={setHabitReminders}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={habitReminders ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>Routine Reminders</Text>
            <Text style={tw`text-gray-400 text-sm`}>Remind you of your routines</Text>
          </View>
          <Switch
            value={routineReminders}
            onValueChange={setRoutineReminders}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={routineReminders ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white text-lg`}>Focus Timer Alerts</Text>
            <Text style={tw`text-gray-400 text-sm`}>Notify when focus timer ends</Text>
          </View>
          <Switch
            value={focusReminders}
            onValueChange={setFocusReminders}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={focusReminders ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white text-lg`}>Achievement Notifications</Text>
            <Text style={tw`text-gray-400 text-sm`}>Notify when you earn achievements</Text>
          </View>
          <Switch
            value={achievementNotifications}
            onValueChange={setAchievementNotifications}
            trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
            thumbColor={achievementNotifications ? "#ffffff" : "#f4f3f4"}
          />
        </View>
      </View>

      <Text style={tw`text-white text-lg font-bold mb-3`}>Reminder Schedule</Text>
      <View style={tw`bg-gray-800 rounded-xl p-4 mb-6`}>
        <TouchableOpacity style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Morning Routine</Text>
            <Text style={tw`text-gray-400 text-sm`}>Daily at 7:00 AM</Text>
          </View>
          <Text style={tw`text-violet-500`}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700`}>
          <View>
            <Text style={tw`text-white`}>Evening Routine</Text>
            <Text style={tw`text-gray-400 text-sm`}>Daily at 9:00 PM</Text>
          </View>
          <Text style={tw`text-violet-500`}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white`}>Daily Tasks Reminder</Text>
            <Text style={tw`text-gray-400 text-sm`}>Daily at 8:00 PM</Text>
          </View>
          <Text style={tw`text-violet-500`}>Edit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={tw`bg-violet-600 rounded-xl p-4 items-center mb-6`}>
        <Text style={tw`text-white font-medium`}>Add New Reminder</Text>
      </TouchableOpacity>
    </PageTemplate>
  )
}

