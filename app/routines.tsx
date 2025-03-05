import { View, Text, TouchableOpacity } from "react-native";
import tw from "../lib/tailwind";

export default function Routines() {
  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Daily Routines</Text>

      {/* Morning Routine */}
      <TouchableOpacity style={tw`p-4 bg-white rounded-lg mb-2`}>
        <Text style={tw`text-lg font-bold`}>🌅 Morning Routine</Text>
        <Text style={tw`text-gray-500`}>Start your day with good habits</Text>
      </TouchableOpacity>

      {/* Afternoon Routine */}
      <TouchableOpacity style={tw`p-4 bg-white rounded-lg mb-2`}>
        <Text style={tw`text-lg font-bold`}>🌞 Afternoon Routine</Text>
        <Text style={tw`text-gray-500`}>Stay productive through the day</Text>
      </TouchableOpacity>

      {/* Evening Routine */}
      <TouchableOpacity style={tw`p-4 bg-white rounded-lg`}>
        <Text style={tw`text-lg font-bold`}>🌙 Evening Routine</Text>
        <Text style={tw`text-gray-500`}>End your day on a positive note</Text>
      </TouchableOpacity>
    </View>
  );
}
