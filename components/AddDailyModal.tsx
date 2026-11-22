"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"

interface AddDailyModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (daily: any) => void
  initialValues?: any
  onDelete?: (id: number) => void
}

type Meridiem = "AM" | "PM"

const twoDigits = (value: number) => value.toString().padStart(2, "0")

const parseTime24 = (value: string): { hour: number; minute: number; meridiem: Meridiem } | null => {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!match) return null

  const hour24 = Number(match[1])
  const minute = Number(match[2])
  const meridiem: Meridiem = hour24 >= 12 ? "PM" : "AM"
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12

  return { hour, minute, meridiem }
}

const to24HourTime = (hour: number, minute: number, meridiem: Meridiem): string => {
  const normalizedHour = Math.min(12, Math.max(1, hour))
  const normalizedMinute = Math.min(59, Math.max(0, minute))

  let hour24 = normalizedHour % 12
  if (meridiem === "PM") hour24 += 12

  return `${twoDigits(hour24)}:${twoDigits(normalizedMinute)}`
}

const formatTimeLabel = (value: string) => {
  const parsed = parseTime24(value)
  if (!parsed) return "Pick a time"
  return `${parsed.hour}:${twoDigits(parsed.minute)} ${parsed.meridiem}`
}

export default function AddDailyModal({ isVisible, onClose, onAdd, initialValues, onDelete }: AddDailyModalProps) {
  const { colors } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [category, setCategory] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("")
  const [pickerHour, setPickerHour] = useState(9)
  const [pickerMinute, setPickerMinute] = useState(0)
  const [pickerMeridiem, setPickerMeridiem] = useState<Meridiem>("AM")
  const [timeError, setTimeError] = useState("")

  useEffect(() => {
    if (!isVisible) return

    const incomingReminder =
      (typeof initialValues?.reminderTime === "string" && initialValues.reminderTime) ||
      (typeof initialValues?.reminder_time === "string" && initialValues.reminder_time) ||
      ""
    const parsedReminder = parseTime24(incomingReminder)

    setTitle(initialValues?.title || "")
    setDescription(initialValues?.description || "")
    setPriority(initialValues?.priority || "medium")
    setDifficulty(initialValues?.difficulty || "medium")
    setCategory(initialValues?.category || "")
    setReminderEnabled(Boolean(parsedReminder))
    setReminderTime(
      parsedReminder
        ? to24HourTime(parsedReminder.hour, parsedReminder.minute, parsedReminder.meridiem)
        : "",
    )
    setPickerHour(parsedReminder?.hour ?? 9)
    setPickerMinute(parsedReminder?.minute ?? 0)
    setPickerMeridiem(parsedReminder?.meridiem ?? "AM")
    setTimeError("")
  }, [initialValues, isVisible])

  const handleClose = () => {
    onClose()
  }

  const setReminderFromPicker = (hour: number, minute: number, meridiem: Meridiem) => {
    const nextHour = Math.min(12, Math.max(1, hour))
    const nextMinute = Math.min(59, Math.max(0, minute))

    setPickerHour(nextHour)
    setPickerMinute(nextMinute)
    setPickerMeridiem(meridiem)
    setReminderTime(to24HourTime(nextHour, nextMinute, meridiem))
    setTimeError("")
  }

  const shiftHour = (delta: number) => {
    const nextHour = ((pickerHour - 1 + delta + 120) % 12) + 1
    setReminderFromPicker(nextHour, pickerMinute, pickerMeridiem)
  }

  const shiftMinute = (delta: number) => {
    const nextMinute = (pickerMinute + delta + 600) % 60
    setReminderFromPicker(pickerHour, nextMinute, pickerMeridiem)
  }

  const chooseMeridiem = (meridiem: Meridiem) => {
    setReminderFromPicker(pickerHour, pickerMinute, meridiem)
  }

  const applyQuickTime = (hour: number, minute: number, meridiem: Meridiem) => {
    setReminderEnabled(true)
    setReminderFromPicker(hour, minute, meridiem)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title")
      return
    }

    if (reminderEnabled && !parseTime24(reminderTime)) {
      setTimeError("Pick a reminder time")
      return
    }

    const daily = {
      id: initialValues?.id || Date.now(),
      title: title.trim(),
      description: description.trim(),
      priority,
      difficulty,
      category: category.trim() || "General",
      reminderTime: reminderEnabled ? reminderTime : null,
      completed: initialValues?.completed ?? false,
      dateCreated: initialValues?.dateCreated,
      tags: initialValues?.tags || [],
    }

    onAdd(daily)
    handleClose()
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return colors.error
      case 'medium': return colors.warning
      case 'low': return colors.success
      default: return colors.textSecondary
    }
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'hard': return colors.error
      case 'medium': return colors.warning
      case 'easy': return colors.success
      default: return colors.textSecondary
    }
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[tw`flex-1`, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            tw`flex-row items-center justify-between px-4 py-3 border-b`,
            { borderColor: colors.cardSecondary },
          ]}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={[tw`w-9 h-9 rounded-lg items-center justify-center`, { backgroundColor: colors.cardSecondary }]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={tw`flex-1 px-3`}>
            <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
              {initialValues ? "Edit Daily" : "New Daily"}
            </Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>Compact detail editor</Text>
          </View>

          <View style={tw`flex-row items-center`}>
            {initialValues && onDelete && (
              <TouchableOpacity
                style={[
                  tw`w-9 h-9 rounded-lg mr-2 items-center justify-center`,
                  { backgroundColor: `${colors.error}20` },
                ]}
                onPress={() => onDelete(initialValues.id)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[tw`px-3 py-2 rounded-lg`, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
            >
              <Text style={tw`text-white font-bold`}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-4 pt-3 pb-8`}
          showsVerticalScrollIndicator={false}
        >
          <View style={[tw`rounded-2xl p-4 mb-3`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Daily details</Text>
            </View>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Task title *</Text>
              <TextInput
                style={[
                  tw`rounded-xl p-3 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                  },
                ]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  tw`rounded-xl p-3 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                    minHeight: 76,
                  },
                ]}
                placeholder="Add short details"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={200}
              />
            </View>

            <View>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Category</Text>
              <TextInput
                style={[
                  tw`rounded-xl p-3 text-base`,
                  {
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.cardSecondary,
                  },
                ]}
                placeholder="e.g., Work, Personal, Health"
                placeholderTextColor={colors.textSecondary}
                value={category}
                onChangeText={setCategory}
                maxLength={30}
              />
            </View>
          </View>

          <View style={[tw`rounded-2xl p-4 mb-3`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="notifications-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Reminder</Text>
            </View>

            <View style={[tw`rounded-xl p-3`, { backgroundColor: colors.cardSecondary }]}> 
              <TouchableOpacity
                style={tw`flex-row items-center justify-between`}
                onPress={() => {
                  const next = !reminderEnabled
                  setReminderEnabled(next)

                  if (next) {
                    if (!parseTime24(reminderTime)) {
                      setReminderTime(to24HourTime(pickerHour, pickerMinute, pickerMeridiem))
                    }
                    setTimeError("")
                  } else {
                    setReminderTime("")
                    setTimeError("")
                  }
                }}
              >
                <View style={tw`flex-row items-center`}>
                  <Ionicons
                    name={reminderEnabled ? "alarm" : "alarm-outline"}
                    size={18}
                    color={reminderEnabled ? colors.accent : colors.textSecondary}
                    style={tw`mr-2`}
                  />
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>Daily reminder time</Text>
                </View>
                <View
                  style={[
                    tw`w-5 h-5 rounded-md border items-center justify-center`,
                    {
                      borderColor: reminderEnabled ? colors.accent : colors.textSecondary,
                      backgroundColor: reminderEnabled ? colors.accent : "transparent",
                    },
                  ]}
                >
                  {reminderEnabled && <Ionicons name="checkmark" size={13} color="white" />}
                </View>
              </TouchableOpacity>

              {reminderEnabled && (
                <View style={tw`mt-3`}>
                  <View style={tw`flex-row items-center justify-between mb-2`}>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Reminder time</Text>
                    <Text style={[tw`text-base font-bold`, { color: colors.text }]}>{formatTimeLabel(reminderTime)}</Text>
                  </View>

                  <View style={tw`flex-row`}>
                    <View style={[tw`rounded-xl p-2.5 flex-1 mr-2`, { backgroundColor: colors.background }]}> 
                      <Text style={[tw`text-xs font-semibold`, { color: colors.textSecondary }]}>Hour</Text>
                      <View style={tw`flex-row items-center justify-between mt-2`}>
                        <TouchableOpacity onPress={() => shiftHour(-1)}>
                          <Ionicons name="remove-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{pickerHour}</Text>
                        <TouchableOpacity onPress={() => shiftHour(1)}>
                          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[tw`rounded-xl p-2.5 flex-1`, { backgroundColor: colors.background }]}> 
                      <Text style={[tw`text-xs font-semibold`, { color: colors.textSecondary }]}>Minute</Text>
                      <View style={tw`flex-row items-center justify-between mt-2`}>
                        <TouchableOpacity onPress={() => shiftMinute(-5)}>
                          <Ionicons name="remove-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{twoDigits(pickerMinute)}</Text>
                        <TouchableOpacity onPress={() => shiftMinute(5)}>
                          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={[tw`rounded-xl p-2.5 mt-2`, { backgroundColor: colors.background }]}> 
                    <Text style={[tw`text-xs font-semibold mb-2`, { color: colors.textSecondary }]}>AM / PM</Text>
                    <View style={tw`flex-row`}>
                      {(["AM", "PM"] as Meridiem[]).map((label) => {
                        const selected = pickerMeridiem === label
                        return (
                          <TouchableOpacity
                            key={label}
                            onPress={() => chooseMeridiem(label)}
                            style={[
                              tw`flex-1 py-2 rounded-lg items-center`,
                              {
                                backgroundColor: selected ? colors.accent : colors.cardSecondary,
                                marginRight: label === "AM" ? 8 : 0,
                              },
                            ]}
                          >
                            <Text style={[tw`font-semibold`, { color: selected ? "white" : colors.text }]}>{label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>

                  {timeError ? (
                    <Text style={[tw`text-xs mt-2`, { color: colors.error }]}>{timeError}</Text>
                  ) : (
                    <Text style={[tw`text-xs mt-2`, { color: colors.textSecondary }]}>No typing needed. Set when you want the reminder.</Text>
                  )}

                  <View style={tw`flex-row mt-2 flex-wrap`}>
                    {[
                      { label: "8:00 AM", hour: 8, minute: 0, meridiem: "AM" as Meridiem },
                      { label: "12:00 PM", hour: 12, minute: 0, meridiem: "PM" as Meridiem },
                      { label: "8:00 PM", hour: 8, minute: 0, meridiem: "PM" as Meridiem },
                    ].map((quickTime) => (
                      <TouchableOpacity
                        key={quickTime.label}
                        onPress={() => applyQuickTime(quickTime.hour, quickTime.minute, quickTime.meridiem)}
                        style={[tw`px-3 py-1.5 rounded-lg mr-2 mb-2`, { backgroundColor: colors.background }]}
                      >
                        <Text style={[tw`text-xs font-medium`, { color: colors.text }]}>{quickTime.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={[tw`rounded-2xl p-4 mb-3`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="flag-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Priority</Text>
            </View>

            <View style={tw`flex-row justify-between`}>
              {[
                { key: 'low', icon: 'remove-circle-outline', label: 'Low' },
                { key: 'medium', icon: 'ellipse-outline', label: 'Med' },
                { key: 'high', icon: 'alert-circle-outline', label: 'High' },
              ].map((item) => {
                const selected = priority === item.key
                const color = getPriorityColor(item.key)

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      tw`flex-1 rounded-xl py-2.5 items-center mx-1`,
                      {
                        backgroundColor: selected ? `${color}20` : colors.cardSecondary,
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? color : "transparent",
                      },
                    ]}
                    onPress={() => setPriority(item.key as 'low' | 'medium' | 'high')}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={selected ? color : colors.textSecondary}
                    />
                    <Text style={[tw`text-sm font-semibold mt-1`, { color: colors.text }]}>{item.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={[tw`rounded-2xl p-4 mb-2`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Difficulty</Text>
            </View>

            <View style={tw`flex-row justify-between`}>
              {[
                { key: 'easy', icon: 'leaf-outline', xp: '+3 XP' },
                { key: 'medium', icon: 'flash-outline', xp: '+6 XP' },
                { key: 'hard', icon: 'diamond-outline', xp: '+10 XP' },
              ].map((item) => {
                const selected = difficulty === item.key
                const color = getDifficultyColor(item.key)

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      tw`flex-1 rounded-xl py-2.5 items-center mx-1`,
                      {
                        backgroundColor: selected ? `${color}20` : colors.cardSecondary,
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? color : "transparent",
                      },
                    ]}
                    onPress={() => setDifficulty(item.key as 'easy' | 'medium' | 'hard')}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={selected ? color : colors.textSecondary}
                    />
                    <Text style={[tw`text-sm font-semibold mt-1 capitalize`, { color: colors.text }]}>{item.key}</Text>
                    <Text style={[tw`text-xs mt-0.5`, { color: selected ? color : colors.textSecondary }]}>{item.xp}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

