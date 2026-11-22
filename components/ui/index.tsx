// HUBLE design kit — one set of building blocks so every screen looks the same.
// Everything reads colors from the active theme, so all themes keep working.
//
// Rhythm: screen gutter 16 · gap 12 · card radius 16 · inner radius 12
// Type:   title 22/700 · card title 15/600 · body 14 · meta 12 · section 11 caps

import React, { ReactNode } from "react"
import {
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../lib/tailwind"
import { useTheme } from "../../contexts/ThemeProvider"

export type IconName = React.ComponentProps<typeof Ionicons>["name"]

export const RADIUS = { card: 16, inner: 12, pill: 999 }
export const GUTTER = 16

/** Adds alpha to a #RRGGBB color. */
export const tint = (hex: string, alpha = 0.14) => {
  if (!hex?.startsWith("#") || hex.length !== 7) return hex
  return hex + Math.round(alpha * 255).toString(16).padStart(2, "0")
}

// ── Layout ────────────────────────────────────────────────────────────────

interface ScreenProps extends ScrollViewProps {
  title?: string
  subtitle?: string
  /** Show a back button (default true when a title is given). */
  back?: boolean
  right?: ReactNode
  children: ReactNode
  /** Render children without the built-in ScrollView (e.g. FlatList screens). */
  scroll?: boolean
}

export function Screen({ title, subtitle, back = true, right, children, scroll = true, contentContainerStyle, ...rest }: ScreenProps) {
  const { colors } = useTheme()
  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {title !== undefined && <ScreenHeader title={title} subtitle={subtitle} back={back} right={right} />}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingHorizontal: GUTTER, paddingBottom: 40, gap: 12 }, contentContainerStyle]}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  )
}

export function ScreenHeader({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const { colors } = useTheme()
  const router = useRouter()
  return (
    <View style={[tw`flex-row items-center`, { paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 12 }]}>
      {back && (
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={[tw`w-10 h-10 items-center justify-center mr-2`, { borderRadius: RADIUS.inner, backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={tw`flex-1`}>
        <Text style={[{ fontSize: 22, fontWeight: "700", color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[tw`text-xs mt-0.5`, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  )
}

export function Section({ title, action, children, style }: { title?: string; action?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {(title || action) && (
        <View style={tw`flex-row items-center justify-between px-1`}>
          {title ? <SectionLabel>{title}</SectionLabel> : <View />}
          {action}
        </View>
      )}
      {children}
    </View>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme()
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.textSecondary }}>
      {children}
    </Text>
  )
}

// ── Surfaces ──────────────────────────────────────────────────────────────

export function Card({
  children,
  onPress,
  style,
  padded = true,
  highlight,
}: {
  children: ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  padded?: boolean
  /** Optional accent ring (e.g. completed / selected / "you"). */
  highlight?: string
}) {
  const { colors } = useTheme()
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.card,
      borderRadius: RADIUS.card,
      padding: padded ? 16 : 0,
      borderWidth: 1,
      borderColor: highlight ? tint(highlight, 0.45) : tint(colors.cardSecondary, 0.6),
      overflow: "hidden",
    },
    style,
  ]
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    )
  }
  return <View style={cardStyle}>{children}</View>
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme()
  return <View style={{ height: 1, marginLeft: inset, backgroundColor: tint(colors.cardSecondary, 0.7) }} />
}

// ── Small pieces ──────────────────────────────────────────────────────────

export function IconTile({ icon, color, size = 40, iconSize }: { icon: IconName; color: string; size?: number; iconSize?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 48 ? 14 : 12,
        backgroundColor: tint(color, 0.14),
        borderWidth: 1,
        borderColor: tint(color, 0.3),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.5)} color={color} />
    </View>
  )
}

/** Emoji inside a tinted rounded tile (parties, challenges, badges). */
export function EmojiTile({ emoji, color, size = 44 }: { emoji: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size >= 56 ? 16 : 12,
        backgroundColor: tint(color, 0.14),
        borderWidth: 1,
        borderColor: tint(color, 0.3),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </View>
  )
}

/** Square icon button for the right side of a ScreenHeader. */
export function HeaderButton({ icon, onPress, label, primary }: { icon: IconName; onPress: () => void; label: string; primary?: boolean }) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: RADIUS.inner,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? colors.accent : colors.card,
      }}
    >
      <Ionicons name={icon} size={19} color={primary ? "#FFFFFF" : colors.text} />
    </TouchableOpacity>
  )
}

export function Avatar({ emoji, color, size = 44 }: { emoji?: string; color?: string; size?: number }) {
  const { colors } = useTheme()
  const ring = color || colors.accent
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: tint(ring, 0.16),
        borderWidth: 1.5,
        borderColor: tint(ring, 0.55),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {emoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.45} color={ring} />
      )}
    </View>
  )
}

export function Pill({ label, color, icon }: { label: string | number; color?: string; icon?: IconName }) {
  const { colors } = useTheme()
  const c = color || colors.textSecondary
  return (
    <View style={[tw`flex-row items-center px-2 py-0.5`, { borderRadius: RADIUS.pill, backgroundColor: tint(c, 0.14) }]}>
      {icon && <Ionicons name={icon} size={11} color={c} style={{ marginRight: 3 }} />}
      <Text style={{ fontSize: 11, fontWeight: "700", color: c }}>{label}</Text>
    </View>
  )
}

export function ProgressBar({ value, color, height = 6, track }: { value: number; color?: string; height?: number; track?: string }) {
  const { colors } = useTheme()
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || tint(colors.cardSecondary, 0.8), overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color || colors.accent }} />
    </View>
  )
}

/** Big number with a label — for stat grids. */
export function StatTile({ icon, color, value, label, style }: { icon: IconName; color?: string; value: string | number; label: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme()
  const c = color || colors.accent
  return (
    <Card style={[{ flex: 1, padding: 14, gap: 10 }, style]}>
      <Ionicons name={icon} size={18} color={c} />
      <View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[tw`text-xs mt-0.5`, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Card>
  )
}

/** Row inside a Card list: icon · title/subtitle · right slot. */
export function ListRow({
  icon,
  iconColor,
  leading,
  title,
  subtitle,
  right,
  onPress,
  chevron,
}: {
  icon?: IconName
  iconColor?: string
  leading?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
  onPress?: () => void
  chevron?: boolean
}) {
  const { colors } = useTheme()
  const content = (
    <View style={[tw`flex-row items-center`, { paddingHorizontal: 14, paddingVertical: 12, gap: 12 }]}>
      {leading ?? (icon ? <IconTile icon={icon} color={iconColor || colors.accent} size={36} /> : null)}
      <View style={tw`flex-1`}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[tw`text-xs mt-0.5`, { color: colors.textSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
      {chevron && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </View>
  )
  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  )
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { colors } = useTheme()
  return (
    <View accessibilityRole="tablist" style={[tw`flex-row p-1`, { borderRadius: RADIUS.inner + 2, backgroundColor: colors.card, gap: 4 }]}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              tw`flex-1 items-center justify-center`,
              { height: 36, borderRadius: RADIUS.inner - 2, backgroundColor: selected ? colors.cardSecondary : "transparent" },
            ]}
          >
            <Text style={{ fontSize: 13, fontWeight: selected ? "700" : "600", color: selected ? colors.text : colors.textSecondary }} numberOfLines={1}>
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  small,
  disabled,
  loading,
  style,
}: {
  label: string
  onPress?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: IconName
  small?: boolean
  disabled?: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const { colors } = useTheme()
  const palette = {
    primary: { bg: colors.accent, fg: "#FFFFFF", border: colors.accent },
    secondary: { bg: colors.cardSecondary, fg: colors.text, border: colors.cardSecondary },
    ghost: { bg: "transparent", fg: colors.text, border: tint(colors.cardSecondary, 1) },
    danger: { bg: tint(colors.error, 0.14), fg: colors.error, border: tint(colors.error, 0.3) },
  }[variant]
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        tw`flex-row items-center justify-center`,
        {
          height: small ? 34 : 44,
          paddingHorizontal: small ? 12 : 16,
          borderRadius: small ? 10 : RADIUS.inner,
          backgroundColor: palette.bg,
          borderWidth: 1,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : 1,
          gap: 6,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 14 : 16} color={palette.fg} />}
          <Text style={{ fontSize: small ? 13 : 15, fontWeight: "700", color: palette.fg }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  onSubmit,
}: {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onSubmit?: () => void
}) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: RADIUS.inner,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: tint(colors.cardSecondary, 0.6),
      }}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType={onSubmit ? "search" : "done"}
        onSubmitEditing={onSubmit}
        style={{ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} accessibilityLabel="Clear search" hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

// ── Forms ─────────────────────────────────────────────────────────────────

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
  hint,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  multiline?: boolean
  maxLength?: number
  hint?: string
}) {
  const { colors } = useTheme()
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{label}</Text>
        {maxLength ? (
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={label}
        multiline={multiline}
        maxLength={maxLength}
        style={{
          minHeight: multiline ? 88 : 46,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 0,
          borderRadius: RADIUS.inner,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: tint(colors.cardSecondary, 0.9),
          color: colors.text,
          fontSize: 15,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      {!!hint && <Text style={{ fontSize: 12, color: colors.textSecondary }}>{hint}</Text>}
    </View>
  )
}

export function Stepper({ value, onChange, min, max, label, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string; suffix?: string }) {
  const { colors } = useTheme()
  const btn = (icon: IconName, delta: number, disabled: boolean) => (
    <TouchableOpacity
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={disabled}
      accessibilityLabel={`${delta > 0 ? "Increase" : "Decrease"} ${label}`}
      style={{ width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardSecondary, opacity: disabled ? 0.4 : 1 }}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
    </TouchableOpacity>
  )
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>{label}</Text>
      {btn("remove", -1, value <= min)}
      <Text style={{ minWidth: 56, textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.text }}>
        {value}
        {suffix ? <Text style={{ fontSize: 12, fontWeight: "500", color: colors.textSecondary }}> {suffix}</Text> : null}
      </Text>
      {btn("add", 1, value >= max)}
    </View>
  )
}

/** On/off switch drawn with theme colors. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={6}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: "center",
        alignItems: value ? "flex-end" : "flex-start",
        backgroundColor: value ? colors.accent : colors.cardSecondary,
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF" }} />
    </TouchableOpacity>
  )
}

export function ToggleRow({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{label}</Text>
        {!!description && <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{description}</Text>}
      </View>
      <Toggle value={value} onChange={onChange} label={label} />
    </View>
  )
}

/** Selectable filter chip. */
export function Chip({ label, selected, onPress, leading }: { label: string; selected?: boolean; onPress?: () => void; leading?: string }) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityState={{ selected: !!selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 34,
        paddingHorizontal: 12,
        borderRadius: RADIUS.pill,
        backgroundColor: selected ? tint(colors.accent, 0.16) : colors.card,
        borderWidth: 1,
        borderColor: selected ? tint(colors.accent, 0.5) : tint(colors.cardSecondary, 0.6),
      }}
    >
      {leading ? <Text style={{ fontSize: 13 }}>{leading}</Text> : null}
      <Text style={{ fontSize: 13, fontWeight: "600", color: selected ? colors.accent : colors.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  )
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message?: string; action?: ReactNode }) {
  const { colors } = useTheme()
  return (
    <Card style={{ alignItems: "center", paddingVertical: 28, gap: 8 }}>
      <IconTile icon={icon} color={colors.textSecondary} size={48} />
      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 4 }}>{title}</Text>
      {!!message && <Text style={[tw`text-sm text-center px-4`, { color: colors.textSecondary }]}>{message}</Text>}
      {action && <View style={tw`mt-2`}>{action}</View>}
    </Card>
  )
}

export function LoadingState({ label }: { label?: string }) {
  const { colors } = useTheme()
  return (
    <View style={tw`flex-1 items-center justify-center py-16`}>
      <ActivityIndicator color={colors.accent} />
      {!!label && <Text style={[tw`text-sm mt-3`, { color: colors.textSecondary }]}>{label}</Text>}
    </View>
  )
}
