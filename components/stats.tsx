import { View, Text } from "react-native";
import tw from "../lib/tailwind";
import ProgressBar from "./ProgressBar";

export default function StatsScreen() {
  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <Text style={tw`text-2xl font-bold text-gray-800`}>Stats</Text>
      <ProgressBar progress={0.90} />
      <Text style={tw`text-lg mt-4`}>Experience Points: 750 XP</Text>
    </View>
  );
}
