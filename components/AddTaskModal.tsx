import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import tw from "../lib/tailwind";

export default function AddTaskModal({ isVisible, onClose, onAdd }) {
  const [taskName, setTaskName] = useState("");

  const handleAddTask = () => {
    if (taskName.trim()) {
      onAdd(taskName);
      setTaskName("");
      onClose();
    }
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black/50`}> 
        <View style={tw`bg-gray-800 w-80 p-6 rounded-xl shadow-lg`}>
          <Text style={tw`text-white text-lg font-bold mb-4`}>Add New Task</Text>
          <TextInput
            style={tw`bg-gray-700 text-white p-3 rounded-lg mb-4`}
            placeholder="Task Name"
            placeholderTextColor="#9CA3AF"
            value={taskName}
            onChangeText={setTaskName}
          />
          <View style={tw`flex-row justify-between`}> 
            <TouchableOpacity style={tw`bg-gray-600 px-4 py-2 rounded-lg`} onPress={onClose}>
              <Text style={tw`text-white`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`bg-violet-600 px-4 py-2 rounded-lg`} onPress={handleAddTask}>
              <Text style={tw`text-white`}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
