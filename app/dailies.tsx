import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import tw from "../lib/tailwind";

export default function Dailies() {
  const [tasks, setTasks] = useState([
    { id: "1", name: "Morning Walk", completed: false },
    { id: "2", name: "Read 10 pages", completed: false },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Dailies</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleTask(item.id)}
            style={tw`flex-row items-center justify-between bg-white p-4 rounded-lg mb-2`}
          >
            <Text style={tw`text-lg font-medium ${item.completed ? "line-through text-gray-400" : ""}`}>
              {item.name}
            </Text>
            <Ionicons name={item.completed ? "checkbox" : "square-outline"} size={24} color="blue" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
