import { View, Text } from "react-native"
import tw from "../lib/tailwind"

interface ProgressBarProps {
  value: number
  max: number
  color: string
  label: string
  showLevel?: boolean
  level?: number
}

export default function ProgressBar({ value, max, color, label, showLevel = false, level = 1 }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <View style={tw`mb-1`}>
      <View style={tw`flex-row justify-between items-center mb-1`}>
        <Text style={tw`text-gray-300 text-sm`}>{label}</Text>
        <Text style={tw`text-gray-300 text-sm`}>
          {value}/{max} {showLevel ? `• Level ${level}` : ""}
        </Text>
      </View>
      <View style={tw`h-2.5 bg-gray-700 rounded-full overflow-hidden`}>
        <View style={[tw`h-full rounded-full bg-${color}`, { width: `${percentage}%` }]} />
      </View>
    </View>
  )
}
