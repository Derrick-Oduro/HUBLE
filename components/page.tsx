"\"use client"

import { View, Text, SafeAreaView, StatusBar } from "react-native"
import { Link } from "expo-router"
import tw from "../lib/tailwind"

export default function Page() {
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4 justify-center items-center`}>
        <Text style={tw`text-white text-2xl font-bold mb-4`}>Welcome!</Text>
        <Text style={tw`text-gray-400 text-center mb-8`}>
          This is the home screen. Navigate to other sections using the links below.
        </Text>
        <Link href="/routines" style={tw`bg-violet-600 text-white py-2 px-4 rounded-md mb-2`}>
          Go to Routines
        </Link>
        <Link href="/dailies" style={tw`bg-violet-600 text-white py-2 px-4 rounded-md mb-2`}>
          Go to Dailies
        </Link>
        <Link href="/timer" style={tw`bg-violet-600 text-white py-2 px-4 rounded-md mb-2`}>
          Go to Timer
        </Link>
        <Link href="/more" style={tw`bg-violet-600 text-white py-2 px-4 rounded-md`}>
          Go to More
        </Link>
      </View>
    </SafeAreaView>
  )
}

