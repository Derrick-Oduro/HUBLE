import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "../lib/tailwind";

export default function More() {
  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-4`}>More</Text>

      <TouchableOpacity style={tw`p-4 bg-white rounded-lg mb-2 flex-row items-center`}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={tw`ml-2 text-lg`}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`p-4 bg-white rounded-lg mb-2 flex-row items-center`}>
        <Ionicons name="stats-chart-outline" size={24} color="black" />
        <Text style={tw`ml-2 text-lg`}>Stats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`p-4 bg-white rounded-lg flex-row items-center`}>
        <Ionicons name="settings-outline" size={24} color="black" />
        <Text style={tw`ml-2 text-lg`}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
