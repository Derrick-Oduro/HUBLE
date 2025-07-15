"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import tw from "../../../lib/tailwind"
import React from "react"

export default function Parties() {
  const router = useRouter()

  // Mock parties data
  const [myParties] = useState([
    {
      id: 1,
      name: "Study Squad",
      description: "Let's ace our exams together!",
      members: 4,
      maxMembers: 6,
      goal: "Complete 100 study sessions",
      progress: 67,
      type: "study",
      emoji: "📚",
      color: "#3B82F6",
      role: "admin",
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      name: "Fitness Warriors",
      description: "Daily workout accountability",
      members: 8,
      maxMembers: 10,
      goal: "Exercise 30 days straight",
      progress: 18,
      type: "fitness",
      emoji: "💪",
      color: "#EF4444",
      role: "member",
      lastActivity: "1 day ago"
    }
  ])

  const [invitations] = useState([
    {
      id: 3,
      name: "Code Crushers",
      description: "Daily coding challenges",
      members: 5,
      maxMembers: 8,
      emoji: "👨‍💻",
      color: "#10B981",
      invitedBy: "DevGuru99",
      invitedAt: "1 day ago"
    }
  ])

  const handleLeaveParty = (partyId: number, partyName: string) => {
    Alert.alert(
      "Leave Party",
      `Are you sure you want to leave "${partyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => {} }
      ]
    )
  }

  const handleAcceptInvitation = (partyId: number) => {
    Alert.alert("Joined Party", "Welcome to the party!")
  }

  const handleDeclineInvitation = (partyId: number) => {
    Alert.alert("Invitation Declined")
  }

  const PartyCard = ({ party }) => (
    <TouchableOpacity 
      style={[
        tw`bg-gray-800 rounded-2xl p-4 mb-3`,
        { backgroundColor: '#1F2937' }
      ]}
      onPress={() => router.push(`/more/social/party/${party.id}`)}
    >
      <View style={tw`flex-row items-center mb-3`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: `${party.color}20` }
        ]}>
          <Text style={tw`text-xl`}>{party.emoji}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-white font-bold text-base mr-2`}>{party.name}</Text>
            {party.role === 'admin' && (
              <View style={[tw`px-2 py-1 rounded`, { backgroundColor: '#F59E0B20' }]}>
                <Text style={tw`text-yellow-400 text-xs font-bold`}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={tw`text-gray-400 text-sm`}>{party.description}</Text>
          <Text style={tw`text-gray-500 text-xs mt-1`}>
            Active {party.lastActivity}
          </Text>
        </View>
        
        <View style={tw`items-end`}>
          <Text style={tw`text-gray-300 text-sm`}>{party.members}/{party.maxMembers}</Text>
          <Text style={tw`text-gray-400 text-xs`}>members</Text>
        </View>
      </View>
      
      <View style={tw`mb-3`}>
        <View style={tw`flex-row justify-between items-center mb-1`}>
          <Text style={tw`text-gray-300 text-sm`}>{party.goal}</Text>
          <Text style={[tw`text-sm font-bold`, { color: party.color }]}>{party.progress}%</Text>
        </View>
        <View style={tw`h-2 bg-gray-700 rounded-full overflow-hidden`}>
          <View 
            style={[
              tw`h-full rounded-full`,
              { width: `${party.progress}%`, backgroundColor: party.color }
            ]} 
          />
        </View>
      </View>

      <View style={tw`flex-row justify-between items-center pt-3 border-t border-gray-700`}>
        <TouchableOpacity 
          style={[tw`flex-1 mr-2 py-2 rounded-lg`, { backgroundColor: `${party.color}20` }]}
          onPress={() => router.push(`/more/social/party/${party.id}`)}
        >
          <Text style={[tw`text-center font-semibold`, { color: party.color }]}>
            View Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[tw`flex-1 ml-2 py-2 rounded-lg`, { backgroundColor: '#374151' }]}
          onPress={() => handleLeaveParty(party.id, party.name)}
        >
          <Text style={tw`text-gray-300 text-center font-semibold`}>
            {party.role === 'admin' ? 'Manage' : 'Leave'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const InvitationCard = ({ invitation }) => (
    <View style={[
      tw`bg-gray-800 rounded-2xl p-4 mb-3`,
      { backgroundColor: '#1F2937' }
    ]}>
      <View style={tw`flex-row items-center mb-3`}>
        <View style={[
          tw`w-12 h-12 rounded-xl items-center justify-center mr-3`,
          { backgroundColor: `${invitation.color}20` }
        ]}>
          <Text style={tw`text-xl`}>{invitation.emoji}</Text>
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={tw`text-white font-bold text-base`}>{invitation.name}</Text>
          <Text style={tw`text-gray-400 text-sm`}>{invitation.description}</Text>
          <Text style={tw`text-gray-500 text-xs mt-1`}>
            Invited by {invitation.invitedBy} • {invitation.invitedAt}
          </Text>
        </View>
        
        <View style={tw`items-end`}>
          <Text style={tw`text-gray-300 text-sm`}>{invitation.members}/{invitation.maxMembers}</Text>
          <Text style={tw`text-gray-400 text-xs`}>members</Text>
        </View>
      </View>
      
      <View style={tw`flex-row justify-between`}>
        <TouchableOpacity 
          style={[tw`flex-1 mr-2 py-2 rounded-lg`, { backgroundColor: '#10B981' }]}
          onPress={() => handleAcceptInvitation(invitation.id)}
        >
          <Text style={tw`text-white text-center font-semibold`}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[tw`flex-1 ml-2 py-2 rounded-lg`, { backgroundColor: '#374151' }]}
          onPress={() => handleDeclineInvitation(invitation.id)}
        >
          <Text style={tw`text-gray-300 text-center font-semibold`}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 px-5 pt-2 pb-4`}>
        
        {/* Header */}
        <View style={tw`flex-row items-center mb-6 mt-2`}>
          <TouchableOpacity style={tw`mr-3`} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-2xl font-bold flex-1`}>Parties</Text>
          <TouchableOpacity 
            style={[tw`p-2 rounded-xl`, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/more/social/create-party')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Party Invitations */}
          {invitations.length > 0 && (
            <View style={tw`mb-6`}>
              <Text style={tw`text-white text-lg font-bold mb-4`}>
                Invitations ({invitations.length})
              </Text>
              {invitations.map((invitation) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </View>
          )}

          {/* My Parties */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-white text-lg font-bold mb-4`}>
              My Parties ({myParties.length})
            </Text>
            
            {myParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
            
            {myParties.length === 0 && (
              <View style={tw`items-center py-12`}>
                <Ionicons name="shield-outline" size={64} color="#6B7280" />
                <Text style={tw`text-gray-400 text-lg mt-4`}>No parties joined</Text>
                <Text style={tw`text-gray-500 text-center mt-2`}>
                  Create or join a party to achieve goals together
                </Text>
              </View>
            )}
          </View>

          {/* Create Party Button */}
          <TouchableOpacity 
            style={[
              tw`bg-violet-600 rounded-2xl p-4`,
              {
                shadowColor: '#8B5CF6',
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
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}