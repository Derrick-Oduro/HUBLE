import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { friendsAPI, partiesAPI } from "../lib/api"
import SideMenu from "../components/navigation/SideMenu"

interface MenuContextValue {
  isOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  unreadCount: number
  refreshUnread: () => Promise<void>
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined)

// Counts things waiting for the user: friend requests + party invitations.
const fetchUnreadCount = async (): Promise<number> => {
  const token = await AsyncStorage.getItem("userToken")
  if (!token) return 0

  const [requests, invitations] = await Promise.allSettled([
    friendsAPI.getPendingRequests(),
    partiesAPI.getPartyInvitations(),
  ])

  const requestCount =
    requests.status === "fulfilled" ? (requests.value?.requests || []).length : 0
  const invitationCount =
    invitations.status === "fulfilled" ? (invitations.value?.invitations || []).length : 0

  return requestCount + invitationCount
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = useCallback(async () => {
    try {
      setUnreadCount(await fetchUnreadCount())
    } catch {
      // Unread badge is best-effort; never block the UI on it.
    }
  }, [])

  const openMenu = useCallback(() => {
    setIsOpen(true)
    refreshUnread()
  }, [refreshUnread])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    refreshUnread()
  }, [refreshUnread])

  const value = useMemo(
    () => ({ isOpen, openMenu, closeMenu, unreadCount, refreshUnread }),
    [isOpen, openMenu, closeMenu, unreadCount, refreshUnread],
  )

  return (
    <MenuContext.Provider value={value}>
      {children}
      <SideMenu />
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
