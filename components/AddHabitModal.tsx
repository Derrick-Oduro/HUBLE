"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import tw from "../lib/tailwind"
import { useTheme } from "../contexts/ThemeProvider"

interface AddHabitModalProps {
  isVisible: boolean
  onClose: () => void
  onAdd: (habit: any) => void
  initialValues?: any
  onDelete?: (id: number) => void
}

const DEFAULT_TARGET_DAYS = [1, 2, 3, 4, 5, 6, 0]
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
type Meridiem = "AM" | "PM"

const normalizeTargetDays = (days: any): number[] => {
  if (!Array.isArray(days) || days.length === 0) return [...DEFAULT_TARGET_DAYS]

  const parsed = days
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)

  if (parsed.length === 0) return [...DEFAULT_TARGET_DAYS]

  const unique = Array.from(new Set(parsed))
  return DAY_ORDER.filter((day) => unique.includes(day))
}

const twoDigits = (value: number) => value.toString().padStart(2, "0")

const parseDueTime24 = (value: string): { hour: number; minute: number; meridiem: Meridiem } | null => {
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

const formatDueTimeLabel = (value: string) => {
  const parsed = parseDueTime24(value)
  if (!parsed) return "Pick a time"
  return `${parsed.hour}:${twoDigits(parsed.minute)} ${parsed.meridiem}`
}

export default function AddHabitModal({ isVisible, onClose, onAdd, initialValues, onDelete }: AddHabitModalProps) {
  const { colors } = useTheme()

  const habitColors = useMemo(
    () => [colors.accent, colors.success, colors.warning, colors.error],
    [colors.accent, colors.success, colors.warning, colors.error]
  )

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [selectedColor, setSelectedColor] = useState(habitColors[0])
  const [targetDays, setTargetDays] = useState<number[]>([...DEFAULT_TARGET_DAYS])
  const [deadlineEnabled, setDeadlineEnabled] = useState(false)
  const [dueTime, setDueTime] = useState("")
  const [pickerHour, setPickerHour] = useState(9)
  const [pickerMinute, setPickerMinute] = useState(0)
  const [pickerMeridiem, setPickerMeridiem] = useState<Meridiem>("PM")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("")
  const [reminderHour, setReminderHour] = useState(8)
  const [reminderMinute, setReminderMinute] = useState(0)
  const [reminderMeridiem, setReminderMeridiem] = useState<Meridiem>("AM")
  const [timeError, setTimeError] = useState("")

  useEffect(() => {
    if (!isVisible) return

    const incomingDueTime =
      (typeof initialValues?.dueTime === "string" && initialValues.dueTime) ||
      (typeof initialValues?.due_time === "string" && initialValues.due_time) ||
      ""
    const incomingReminderTime =
      (typeof initialValues?.reminderTime === "string" && initialValues.reminderTime) ||
      (typeof initialValues?.reminder_time === "string" && initialValues.reminder_time) ||
      ""
    const parsedDueTime = parseDueTime24(incomingDueTime)
    const parsedReminderTime = parseDueTime24(incomingReminderTime)

    setTitle(initialValues?.title || "")
    setDescription(initialValues?.description || "")
    setDifficulty(initialValues?.difficulty || "medium")
    setSelectedColor(initialValues?.color || habitColors[0])
    setTargetDays(normalizeTargetDays(initialValues?.targetDays ?? initialValues?.target_days))
    setDeadlineEnabled(Boolean(parsedDueTime))
    setDueTime(parsedDueTime ? to24HourTime(parsedDueTime.hour, parsedDueTime.minute, parsedDueTime.meridiem) : "")
    setPickerHour(parsedDueTime?.hour ?? 9)
    setPickerMinute(parsedDueTime?.minute ?? 0)
    setPickerMeridiem(parsedDueTime?.meridiem ?? "PM")
    setReminderEnabled(Boolean(parsedReminderTime))
    setReminderTime(
      parsedReminderTime
        ? to24HourTime(parsedReminderTime.hour, parsedReminderTime.minute, parsedReminderTime.meridiem)
        : "",
    )
    setReminderHour(parsedReminderTime?.hour ?? 8)
    setReminderMinute(parsedReminderTime?.minute ?? 0)
    setReminderMeridiem(parsedReminderTime?.meridiem ?? "AM")
    setTimeError("")
  }, [habitColors, initialValues, isVisible])

  const handleClose = () => {
    onClose()
  }

  const isFormValid = title.trim().length > 0 && targetDays.length > 0

  const toggleDay = (dayIndex: number) => {
    setTargetDays((current) => {
      if (current.includes(dayIndex)) {
        const next = current.filter((day) => day !== dayIndex)
        return next.length > 0 ? next : current
      }

      const next = [...current, dayIndex]
      return normalizeTargetDays(next)
    })
  }

  const setDeadlineFromPicker = (hour: number, minute: number, meridiem: Meridiem) => {
    const nextHour = Math.min(12, Math.max(1, hour))
    const nextMinute = Math.min(59, Math.max(0, minute))

    setPickerHour(nextHour)
    setPickerMinute(nextMinute)
    setPickerMeridiem(meridiem)
    setDueTime(to24HourTime(nextHour, nextMinute, meridiem))
    setTimeError("")
  }

  const shiftHour = (delta: number) => {
    const nextHour = ((pickerHour - 1 + delta + 120) % 12) + 1
    setDeadlineFromPicker(nextHour, pickerMinute, pickerMeridiem)
  }

  const shiftMinute = (delta: number) => {
    const nextMinute = (pickerMinute + delta + 600) % 60
    setDeadlineFromPicker(pickerHour, nextMinute, pickerMeridiem)
  }

  const chooseMeridiem = (meridiem: Meridiem) => {
    setDeadlineFromPicker(pickerHour, pickerMinute, meridiem)
  }

  const applyQuickTime = (hour: number, minute: number, meridiem: Meridiem) => {
    setDeadlineEnabled(true)
    setDeadlineFromPicker(hour, minute, meridiem)
  }

  const setReminderFromPicker = (hour: number, minute: number, meridiem: Meridiem) => {
    const nextHour = Math.min(12, Math.max(1, hour))
    const nextMinute = Math.min(59, Math.max(0, minute))

    setReminderHour(nextHour)
    setReminderMinute(nextMinute)
    setReminderMeridiem(meridiem)
    setReminderTime(to24HourTime(nextHour, nextMinute, meridiem))
    setTimeError("")
  }

  const shiftReminderHour = (delta: number) => {
    const nextHour = ((reminderHour - 1 + delta + 120) % 12) + 1
    setReminderFromPicker(nextHour, reminderMinute, reminderMeridiem)
  }

  const shiftReminderMinute = (delta: number) => {
    const nextMinute = (reminderMinute + delta + 600) % 60
    setReminderFromPicker(reminderHour, nextMinute, reminderMeridiem)
  }

  const chooseReminderMeridiem = (meridiem: Meridiem) => {
    setReminderFromPicker(reminderHour, reminderMinute, meridiem)
  }

  const applyReminderQuickTime = (hour: number, minute: number, meridiem: Meridiem) => {
    setReminderEnabled(true)
    setReminderFromPicker(hour, minute, meridiem)
  }

  const getDifficultyColor = (value: string) => {
    if (value === "easy") return colors.success
    if (value === "hard") return colors.error
    return colors.warning
  }

  const handleSubmit = () => {
    if (!isFormValid) return

    if (deadlineEnabled && !parseDueTime24(dueTime)) {
      setTimeError("Pick a deadline time")
      return
    }

    if (reminderEnabled && !parseDueTime24(reminderTime)) {
      setTimeError("Pick a reminder time")
      return
    }

    const habitData = {
      id: initialValues?.id || Date.now(),
      title: title.trim(),
      description: description.trim(),
      difficulty,
      color: selectedColor,
      targetDays: normalizeTargetDays(targetDays),
      dueTime: deadlineEnabled ? dueTime : null,
      reminderTime: reminderEnabled ? reminderTime : null,
      completed: initialValues?.completed ?? false,
      streak: initialValues?.streak || 0,
      completedDates: initialValues?.completedDates || [],
      failedDates: initialValues?.failedDates || [],
    }

    setTimeError("")
    onAdd(habitData)
    onClose()
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
              {initialValues ? "Edit Habit" : "New Habit"}
            </Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
              {initialValues ? "Compact detail editor" : "Quick setup"}
            </Text>
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
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Habit details</Text>
            </View>

            <View style={tw`mb-4`}>
              <Text style={[tw`font-medium mb-2`, { color: colors.text }]}>Habit Title *</Text>
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
                placeholder="What do you want to finish?"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={60}
              />
            </View>

            <View>
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
                placeholder="Add detail for this habit"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={180}
              />
            </View>
          </View>

          <View style={[tw`rounded-2xl p-4 mb-3`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Schedule</Text>
            </View>

            <Text style={[tw`text-sm mb-2`, { color: colors.textSecondary }]}>Active days</Text>
            <View style={tw`flex-row justify-between flex-wrap mb-2`}>
              {DAY_LABELS.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    tw`rounded-lg items-center justify-center mb-2`,
                    {
                      backgroundColor: targetDays.includes(index) ? colors.accent : colors.cardSecondary,
                      width: "13%",
                      aspectRatio: 1,
                      minWidth: 36,
                      minHeight: 36,
                    },
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      tw`font-bold text-xs`,
                      { color: targetDays.includes(index) ? "white" : colors.text },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[tw`rounded-xl p-3`, { backgroundColor: colors.cardSecondary }]}> 
              <TouchableOpacity
                onPress={() => {
                  const next = !deadlineEnabled
                  setDeadlineEnabled(next)
                  if (next) {
                    if (!parseDueTime24(dueTime)) {
                      setDueTime(to24HourTime(pickerHour, pickerMinute, pickerMeridiem))
                    }
                    setTimeError("")
                  } else {
                    setDueTime("")
                    setTimeError("")
                  }
                }}
                style={tw`flex-row items-center justify-between`}
              >
                <View style={tw`flex-row items-center`}>
                  <Ionicons
                    name={deadlineEnabled ? "timer" : "timer-outline"}
                    size={18}
                    color={deadlineEnabled ? colors.accent : colors.textSecondary}
                    style={tw`mr-2`}
                  />
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>Time-bound deadline</Text>
                </View>
                <View
                  style={[
                    tw`w-5 h-5 rounded-md border items-center justify-center`,
                    {
                      borderColor: deadlineEnabled ? colors.accent : colors.textSecondary,
                      backgroundColor: deadlineEnabled ? colors.accent : "transparent",
                    },
                  ]}
                >
                  {deadlineEnabled && <Ionicons name="checkmark" size={13} color="white" />}
                </View>
              </TouchableOpacity>

              {deadlineEnabled && (
                <View style={tw`mt-3`}>
                  <View style={tw`flex-row items-center justify-between mb-2`}>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Deadline time</Text>
                    <Text style={[tw`text-base font-bold`, { color: colors.text }]}>{formatDueTimeLabel(dueTime)}</Text>
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
                      {["AM", "PM"].map((label) => {
                        const selected = pickerMeridiem === label
                        return (
                          <TouchableOpacity
                            key={label}
                            onPress={() => chooseMeridiem(label as Meridiem)}
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
                    <Text style={[tw`text-xs mt-2`, { color: colors.textSecondary }]}>No typing needed. Pick the time and the habit auto-fails if missed.</Text>
                  )}

                  <View style={tw`flex-row mt-2 flex-wrap`}>
                    {[
                      { label: "9:00 AM", hour: 9, minute: 0, meridiem: "AM" as Meridiem },
                      { label: "6:00 PM", hour: 6, minute: 0, meridiem: "PM" as Meridiem },
                      { label: "9:00 PM", hour: 9, minute: 0, meridiem: "PM" as Meridiem },
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

            <View style={[tw`rounded-xl p-3 mt-2`, { backgroundColor: colors.cardSecondary }]}> 
              <TouchableOpacity
                style={tw`flex-row items-center justify-between`}
                onPress={() => {
                  const next = !reminderEnabled
                  setReminderEnabled(next)

                  if (next) {
                    if (!parseDueTime24(reminderTime)) {
                      setReminderTime(to24HourTime(reminderHour, reminderMinute, reminderMeridiem))
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
                  <Text style={[tw`font-semibold`, { color: colors.text }]}>Reminder time</Text>
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
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>Reminder</Text>
                    <Text style={[tw`text-base font-bold`, { color: colors.text }]}>{formatDueTimeLabel(reminderTime)}</Text>
                  </View>

                  <View style={tw`flex-row`}>
                    <View style={[tw`rounded-xl p-2.5 flex-1 mr-2`, { backgroundColor: colors.background }]}> 
                      <Text style={[tw`text-xs font-semibold`, { color: colors.textSecondary }]}>Hour</Text>
                      <View style={tw`flex-row items-center justify-between mt-2`}>
                        <TouchableOpacity onPress={() => shiftReminderHour(-1)}>
                          <Ionicons name="remove-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{reminderHour}</Text>
                        <TouchableOpacity onPress={() => shiftReminderHour(1)}>
                          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[tw`rounded-xl p-2.5 flex-1`, { backgroundColor: colors.background }]}> 
                      <Text style={[tw`text-xs font-semibold`, { color: colors.textSecondary }]}>Minute</Text>
                      <View style={tw`flex-row items-center justify-between mt-2`}>
                        <TouchableOpacity onPress={() => shiftReminderMinute(-5)}>
                          <Ionicons name="remove-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>{twoDigits(reminderMinute)}</Text>
                        <TouchableOpacity onPress={() => shiftReminderMinute(5)}>
                          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={[tw`rounded-xl p-2.5 mt-2`, { backgroundColor: colors.background }]}> 
                    <Text style={[tw`text-xs font-semibold mb-2`, { color: colors.textSecondary }]}>AM / PM</Text>
                    <View style={tw`flex-row`}>
                      {(["AM", "PM"] as Meridiem[]).map((label) => {
                        const selected = reminderMeridiem === label
                        return (
                          <TouchableOpacity
                            key={label}
                            onPress={() => chooseReminderMeridiem(label)}
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

                  <View style={tw`flex-row mt-2 flex-wrap`}>
                    {[
                      { label: "8:00 AM", hour: 8, minute: 0, meridiem: "AM" as Meridiem },
                      { label: "12:00 PM", hour: 12, minute: 0, meridiem: "PM" as Meridiem },
                      { label: "8:00 PM", hour: 8, minute: 0, meridiem: "PM" as Meridiem },
                    ].map((quickTime) => (
                      <TouchableOpacity
                        key={quickTime.label}
                        onPress={() =>
                          applyReminderQuickTime(
                            quickTime.hour,
                            quickTime.minute,
                            quickTime.meridiem,
                          )
                        }
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
              <Ionicons name="bar-chart-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Difficulty</Text>
            </View>

            <View style={tw`flex-row justify-between`}>
              {[
                { key: "easy", icon: "leaf-outline", xp: "+5 XP" },
                { key: "medium", icon: "flash-outline", xp: "+10 XP" },
                { key: "hard", icon: "diamond-outline", xp: "+15 XP" },
              ].map((item) => {
                const selected = difficulty === item.key
                const colorValue = getDifficultyColor(item.key)

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      tw`flex-1 rounded-xl py-2.5 items-center mx-1`,
                      {
                        backgroundColor: selected ? `${colorValue}20` : colors.cardSecondary,
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? colorValue : "transparent",
                      },
                    ]}
                    onPress={() => setDifficulty(item.key as "easy" | "medium" | "hard")}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={selected ? colorValue : colors.textSecondary}
                    />
                    <Text style={[tw`text-sm font-semibold mt-1 capitalize`, { color: colors.text }]}>{item.key}</Text>
                    <Text style={[tw`text-xs mt-0.5`, { color: selected ? colorValue : colors.textSecondary }]}>{item.xp}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={[tw`rounded-2xl p-4 mb-2`, { backgroundColor: colors.card }]}> 
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="color-palette-outline" size={16} color={colors.textSecondary} style={tw`mr-2`} />
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>Color</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              {habitColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center`,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 0,
                      borderColor: colors.text,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Ionicons name="checkmark" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

