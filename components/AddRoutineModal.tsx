"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"

interface AddRoutineModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (routine: {
    id: string
    title: string
    icon: string
    description: string
    tasks: Array<{ id: string; name: string; completed: boolean }>
  }) => void
}

export default function AddRoutineModal({ isVisible, onClose, onAdd }: AddRoutineModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("sunny")
  const [tasks, setTasks] = useState<Array<{ id: string; name: string; completed: boolean }>>([])
  const [newTaskName, setNewTaskName] = useState("")

  const icons = ["sunny", "partly-sunny", "moon", "fitness", "book", "briefcase", "cafe", "restaurant", "bed", "home"]

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      setTasks([
        ...tasks,
        {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: newTaskName,
          completed: false,
        },
      ])
      setNewTaskName("")
    }
  }

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleAdd = () => {
    if (!title.trim()) return

    onAdd({
      id: Date.now().toString(),
      title,
      icon: selectedIcon,
      description,
      tasks,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setSelectedIcon("sunny")
    setTasks([])
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setTitle("")
    setDescription("")
    setSelectedIcon("sunny")
    setTasks([])
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={handleCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6 max-h-[90%]`}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={tw`text-white text-2xl font-bold mb-4`}>Add New Routine</Text>

            <TextInput
              style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
              placeholder="Routine Name"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4 min-h-[80px]`}
              placeholder="Description"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={tw`text-white font-medium mb-2`}>Choose an Icon:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-2 mb-4`}>
              {icons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={tw`mr-3 p-3 ${selectedIcon === icon ? "bg-violet-600" : "bg-gray-700"} rounded-full`}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon} size={24} color="white" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={tw`text-white font-medium mb-2`}>Add Tasks:</Text>
            <View style={tw`flex-row mb-4`}>
              <TextInput
                style={tw`bg-gray-700 text-white p-3 rounded-l-lg flex-1`}
                placeholder="Add a task"
                placeholderTextColor="#9CA3AF"
                value={newTaskName}
                onChangeText={setNewTaskName}
              />
              <TouchableOpacity style={tw`bg-violet-600 p-3 rounded-r-lg`} onPress={handleAddTask}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={tw`text-white font-medium mb-2`}>Tasks ({tasks.length}):</Text>

            <View style={tw`max-h-[200px] mb-4`}>
              {tasks.length === 0 ? (
                <Text style={tw`text-gray-400 text-center py-4`}>No tasks added yet</Text>
              ) : (
                tasks.map((task) => (
                  <View key={task.id} style={tw`flex-row justify-between items-center bg-gray-700 p-3 rounded-lg mb-2`}>
                    <Text style={tw`text-white flex-1`}>{task.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTask(task.id)}>
                      <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={tw`mt-4`}>
              <TouchableOpacity
                style={tw`bg-violet-600 p-4 rounded-lg mb-4`}
                onPress={handleAdd}
                disabled={!title.trim()}
              >
                <Text style={tw`text-white text-center font-bold`}>Create Routine</Text>
              </TouchableOpacity>

              <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={handleCancel}>
                <Text style={tw`text-white text-center`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
