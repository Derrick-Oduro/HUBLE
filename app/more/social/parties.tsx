"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../../../contexts/ThemeProvider"
import tw from "../../../lib/tailwind"
import { partiesAPI } from "../../../lib/api"
import React from "react"

export default function Parties() {
  const router = useRouter()
  const { colors, currentTheme } = useTheme()
  const [myParties, setMyParties] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partiesData, invitesData] = await Promise.all([
        partiesAPI.getUserParties(),
        partiesAPI.getPartyInvitations()
      ])
      setMyParties(partiesData.parties || [])
      setInvitations(invitesData.invitations || [])
    } catch (error) {
      console.error("Error loading parties:", error)
      Alert.alert("Error", "Failed to load parties. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveParty = (partyId: number, partyName: string) => {
    Alert.alert(
      "Leave Party",
      `Are you sure you want to leave "${partyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive", 
          onPress: async () => {
            try {
              await partiesAPI.leaveParty(partyId)
              Alert.alert("Left Party")
              loadData()
            } catch (error) {
              console.error("Error leaving party:", error)
              Alert.alert("Error", "Failed to leave party")
            }
          } 
        }
      ]
    )
  }

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      await partiesAPI.acceptPartyInvitation(invitationId)
      Alert.alert("Joined Party", "Welcome to the party!")
      loadData()
    } catch (error) {
      console.error("Error accepting invitation:", error)
      Alert.alert("Error", "Failed to accept invitation")
    }
  }

  const handleDeclineInvitation = async (invitationId: number) => {
    try {
      await partiesAPI.declinePartyInvitation(invitationId)
      Alert.alert("Invitation Declined")
      loadData()
    } catch (error) {
      console.error("Error declining invitation:", error)
      Alert.alert("Error", "Failed to decline invitation")
    }
  }

  const PartyCard = ({ party }) => {
    const emoji = party.emoji || "🎉"
    const color = party.color || "#3B82F6"
    const memberCount = party.member_count || party.members || 0
    const maxMembers = party.max_members || 10
    const progress = party.progress || 0
    
    return (
      <TouchableOpacity 
        style={[
          tw`rounded-2xl p-4 mb-3`,
          { backgroundColor: colors.card }
        ]}
        onPress={() => router.push(`/more/social/party/${party.id}`)}
      >
        <View style={tw`flex-row items-center mb-3`}>
          <View style={[
            tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
            { backgroundColor: `${color}20` }
          ]}>
            <Text style={tw`text-xl`}>{emoji}</Text>
          </View>
          
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={[tw`font-bold text-base mr-2`, { color: colors.text }]}>{party.name}</Text>
              {party.role === 'admin' && (
                <View style={[tw`px-2 py-1 rounded`, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={tw`text-yellow-400 text-xs font-bold`}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{party.description || 'No description'}</Text>
            <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
              {new Date(party.created_at || party.updated_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={tw`items-end`}>
            <Text style={[tw`text-sm`, { color: colors.text }]}>{memberCount}/{maxMembers}</Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>members</Text>
          </View>
        </View>
        
        {party.goal && (
          <View style={tw`mb-3`}>
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <Text style={[tw`text-sm`, { color: colors.text }]}>{party.goal}</Text>
              <Text style={[tw`text-sm font-bold`, { color: color }]}>{progress}%</Text>
            </View>
            <View style={[tw`h-2 rounded-full overflow-hidden`, { backgroundColor: colors.cardSecondary }]}>
              <View 
                style={[
                  tw`h-full rounded-full`,
                  { width: `${progress}%`, backgroundColor: color }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={[tw`flex-row justify-between items-center pt-3 border-t`, { borderColor: colors.cardSecondary }]}>
          <TouchableOpacity 
            style={[tw`flex-1 mr-2 py-2 rounded-lg`, { backgroundColor: `${color}20` }]}
            onPress={() => router.push(`/more/social/party/${party.id}`)}
          >
            <Text style={[tw`text-center font-semibold`, { color: color }]}>
              View Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`flex-1 ml-2 py-2 rounded-lg`, { backgroundColor: colors.cardSecondary }]}
            onPress={() => handleLeaveParty(party.id, party.name)}
          >
            <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>
              {party.role === 'admin' ? 'Manage' : 'Leave'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const InvitationCard = ({ invitation }) => {
    const emoji = invitation.party_emoji || "🎉"
    const color = invitation.party_color || "#3B82F6"
    
    return (
      <View style={[
        tw`rounded-2xl p-4 mb-3`,
        { backgroundColor: colors.card }
      ]}>
        <View style={tw`flex-row items-center mb-3`}>
          <View style={[
            tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
            { backgroundColor: `${color}20` }
          ]}>
            <Text style={tw`text-xl`}>{emoji}</Text>
          </View>
          
          <View style={tw`flex-1`}>
            <Text style={[tw`font-bold text-base`, { color: colors.text }]}>{invitation.party_name}</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{invitation.party_description || 'No description'}</Text>
            <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
              Invited by {invitation.invited_by_username} • {new Date(invitation.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={tw`items-end`}>
            <Text style={[tw`text-sm`, { color: colors.text }]}>{invitation.party_member_count || 0}/{invitation.party_max_members || 10}</Text>
            <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>members</Text>
          </View>
        </View>
        
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity 
            style={[tw`flex-1 mr-2 py-2 rounded-lg`, { backgroundColor: colors.success }]}
            onPress={() => handleAcceptInvitation(invitation.id)}
          >
            <Text style={tw`text-white text-center font-semibold`}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[tw`flex-1 ml-2 py-2 rounded-lg`, { backgroundColor: colors.cardSecondary }]}
            onPress={() => handleDeclineInvitation(invitation.id)}
          >
            <Text style={[tw`text-center font-semibold`, { color: colors.text }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={currentTheme.id === 'light' || currentTheme.id === 'rose' ? "dark-content" : "light-content"} />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold flex-1`, { color: colors.text }]}>Parties</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/more/social/create-party')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={tw`items-center py-12`}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Party Invitations */}
              {invitations.length > 0 && (
                <View style={tw`mb-6`}>
                  <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                    Invitations ({invitations.length})
                  </Text>
                  {invitations.map((invitation) => (
                    <InvitationCard key={invitation.id} invitation={invitation} />
                  ))}
                </View>
              )}

              {/* My Parties */}
              <View style={tw`mb-6`}>
                <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>
                  My Parties ({myParties.length})
                </Text>
                
                {myParties.map((party) => (
                  <PartyCard key={party.id} party={party} />
                ))}
                
                {myParties.length === 0 && (
                  <View style={tw`items-center py-12`}>
                    <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
                    <Text style={[tw`text-lg mt-4`, { color: colors.textSecondary }]}>No parties joined</Text>
                    <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
                      Create or join a party to achieve goals together
                    </Text>
                  </View>
                )}
              </View>

              {/* Create Party Button */}
              <TouchableOpacity 
                style={[
                  tw`rounded-2xl p-4`,
                  {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }
                ]} 
                onPress={() => router.push('/more/social/create-party')}
              >
                <View style={tw`flex-row items-center justify-center`}>
                  <Ionicons name="add-circle-outline" size={24} color="white" style={tw`mr-2`} />
                  <Text style={tw`text-white font-bold text-lg`}>Create New Party</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}