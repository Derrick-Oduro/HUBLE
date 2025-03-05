import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import tw from "../lib/tailwind";

export default function Timer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-100 p-4`}>
      <Text style={tw`text-3xl font-bold mb-4`}>Focus Timer</Text>
      
      <View style={tw`w-40 h-40 rounded-full bg-white flex justify-center items-center shadow-lg`}>
        <Text style={tw`text-4xl font-bold`}>{formatTime(time)}</Text>
      </View>

      <TouchableOpacity 
        style={tw`mt-6 p-4 bg-blue-500 rounded-lg`}
        onPress={() => setIsRunning(!isRunning)}
      >
        <Text style={tw`text-white text-lg`}>{isRunning ? "Pause" : "Start"}</Text>
      </TouchableOpacity>
    </View>
  );
}
