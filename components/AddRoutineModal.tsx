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
  const [step, setStep] = useState(1) // 1 = routine details, 2 = add tasks

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

  const handleNext = () => {
    if (title.trim()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleAdd = () => {
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
    setStep(1)
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setTitle("")
    setDescription("")
    setSelectedIcon("sunny")
    setTasks([])
    setStep(1)
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={handleCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1 justify-end`}>
        <View style={tw`bg-gray-800 rounded-t-3xl p-6 max-h-[80%]`}>
          {step === 1 ? (
            // Step 1: Routine Details
            <>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-2`}>
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

              <View style={tw`mt-6`}>
                <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleNext}>
                  <Text style={tw`text-white text-center font-bold`}>Next: Add Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={handleCancel}>
                  <Text style={tw`text-white text-center`}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Step 2: Add Tasks
            <>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <TouchableOpacity onPress={handleBack}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={tw`text-white text-2xl font-bold`}>Add Tasks</Text>
                <View style={tw`w-6`}></View> {/* Empty view for alignment */}
              </View>

              <Text style={tw`text-white text-lg mb-2`}>Routine: {title}</Text>

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

              <ScrollView style={tw`max-h-[250px] mb-4`}>
                {tasks.length === 0 ? (
                  <Text style={tw`text-gray-400 text-center py-4`}>No tasks added yet</Text>
                ) : (
                  tasks.map((task) => (
                    <View
                      key={task.id}
                      style={tw`flex-row justify-between items-center bg-gray-700 p-3 rounded-lg mb-2`}
                    >
                      <Text style={tw`text-white flex-1`}>{task.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTask(task.id)}>
                        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>

              <View>
                <TouchableOpacity style={tw`bg-violet-600 p-4 rounded-lg mb-4`} onPress={handleAdd}>
                  <Text style={tw`text-white text-center font-bold`}>Create Routine</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tw`bg-gray-700 p-4 rounded-lg`} onPress={handleCancel}>
                  <Text style={tw`text-white text-center`}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

