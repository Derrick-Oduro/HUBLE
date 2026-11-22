"use client"

import React, { useState } from "react"
import { Alert, View } from "react-native"
import { friendsAPI } from "../../../lib/api"
import { Avatar, Button, Card, Divider, EmptyState, ListRow, LoadingState, Screen, SearchField, Section } from "../../../components/ui"

export default function AddFriend() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sentIds, setSentIds] = useState<Set<number>>(new Set())
  const [sendingId, setSendingId] = useState<number | null>(null)

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      Alert.alert("Keep typing", "Enter at least 2 characters to search.")
      return
    }
    try {
      setSearching(true)
      setHasSearched(true)
      const response = await friendsAPI.searchUsers(query)
      setSearchResults(response.users || [])
    } catch (error) {
      console.error("Search error:", error)
      Alert.alert("Search failed", "Please try again in a moment.")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSendFriendRequest = async (userId: number) => {
    setSendingId(userId)
    try {
      await friendsAPI.sendFriendRequest(userId)
      setSentIds((prev) => new Set(prev).add(userId))
    } catch (error) {
      console.error("Send friend request error:", error)
      Alert.alert("Couldn't send request", "You may already be friends, or a request is already pending.")
    } finally {
      setSendingId(null)
    }
  }

  return (
    <Screen title="Add friends" subtitle="Search by username or email" keyboardShouldPersistTaps="handled">
      <SearchField value={searchQuery} onChangeText={setSearchQuery} onSubmit={handleSearch} placeholder="Username or email" />
      <Button label="Search" icon="search" onPress={handleSearch} loading={searching} disabled={searchQuery.trim().length < 2} />

      {searching ? (
        <LoadingState label="Searching…" />
      ) : !hasSearched ? (
        <EmptyState icon="person-add-outline" title="Find your friends" message="Search for someone's username or email to send them a friend request." />
      ) : searchResults.length === 0 ? (
        <EmptyState icon="people-outline" title="No one found" message="Check the spelling, or try their email instead." />
      ) : (
        <Section title={`Results · ${searchResults.length}`}>
          <Card padded={false}>
            {searchResults.map((user, i) => {
              const sent = sentIds.has(user.id)
              return (
                <View key={user.id}>
                  {i > 0 && <Divider inset={70} />}
                  <ListRow
                    leading={<Avatar emoji={user.avatar} color={user.avatar_color} size={42} />}
                    title={user.username}
                    subtitle={user.level ? `Level ${user.level}` : undefined}
                    right={
                      <Button
                        label={sent ? "Sent" : "Add"}
                        icon={sent ? "checkmark" : "person-add-outline"}
                        small
                        variant={sent ? "ghost" : "primary"}
                        disabled={sent}
                        loading={sendingId === user.id}
                        onPress={() => handleSendFriendRequest(user.id)}
                      />
                    }
                  />
                </View>
              )
            })}
          </Card>
        </Section>
      )}
    </Screen>
  )
}
