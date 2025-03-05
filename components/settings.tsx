import { View, Text } from "react-native";
import tw from "../lib/tailwind";

export default function SettingsScreen() {
  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <Text style={tw`text-2xl font-bold text-gray-800`}>Settings</Text>
      <Text style={tw`text-lg mt-4`}>Manage your preferences here.</Text>
    </View>
  );
}
