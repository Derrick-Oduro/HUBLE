import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://10.0.72.74:3000/api'
  : 'https://your-production-api.com/api';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint: string, options: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    console.log(`🌐 API Call: ${API_BASE_URL}${endpoint}`);
    console.log(`📤 Request options:`, { ...options, headers });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, get text
        try {
          const errorText = await response.text();
          console.log('❌ Error text:', errorText);
          errorMessage = errorText || errorMessage;
        } catch (e2) {
          console.log('❌ Could not parse error response');
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Habits API (matching your frontend interface)
export const habitsAPI = {
  // Get all habits
  getHabits: () => apiCall('/habits'),

  // Create new habit
  createHabit: (habitData: any) => apiCall('/habits', {
    method: 'POST',
    body: JSON.stringify({
      title: habitData.title,
      description: habitData.description,
      difficulty: habitData.difficulty,
      color: habitData.color,
      target_days: habitData.targetDays || [1, 2, 3, 4, 5, 6, 0]
    }),
  }),

  // Update habit
  updateHabit: (id: number, habitData: any) => apiCall(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: habitData.title,
      description: habitData.description,
      difficulty: habitData.difficulty,
      color: habitData.color,
      target_days: habitData.targetDays
    }),
  }),

  // Complete habit
  completeHabit: (id: number) => apiCall(`/habits/${id}/complete`, {
    method: 'POST',
  }),

  // Delete habit
  deleteHabit: (id: number) => apiCall(`/habits/${id}`, {
    method: 'DELETE',
  }),
};

// Dailies API (matching your frontend interface)
export const dailiesAPI = {
  // Get all dailies
  getDailies: () => apiCall('/dailies'),

  // Create new daily
  createDaily: (dailyData: any) => apiCall('/dailies', {
    method: 'POST',
    body: JSON.stringify({
      title: dailyData.title,
      description: dailyData.description,
      priority: dailyData.priority,
      difficulty: dailyData.difficulty,
      category: dailyData.category,
      due_date: dailyData.dueDate,
      tags: JSON.stringify(dailyData.tags || [])
    }),
  }),

  // Complete daily
  completeDaily: (id: number) => apiCall(`/dailies/${id}/complete`, {
    method: 'POST',
  }),

  // Delete daily
  deleteDaily: (id: number) => apiCall(`/dailies/${id}`, {
    method: 'DELETE',
  }),
};

// Routines API (matching your frontend interface)
export const routinesAPI = {
  // Get all routines
  getRoutines: () => apiCall('/routines'),

  // Create new routine
  createRoutine: (routineData: any) => apiCall('/routines', {
    method: 'POST',
    body: JSON.stringify({
      title: routineData.title,
      description: routineData.description,
      icon: routineData.icon,
      tasks: routineData.tasks || []
    }),
  }),

  // Update routine
  updateRoutine: (id: number, routineData: any) => apiCall(`/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: routineData.title,
      description: routineData.description,
      icon: routineData.icon,
      tasks: routineData.tasks
    }),
  }),

  // Complete routine
  completeRoutine: (id: number, completedTasks: any[]) => apiCall(`/routines/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completedTasks }),
  }),

  // Delete routine
  deleteRoutine: (id: number) => apiCall(`/routines/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API
export const authAPI = {
  // Update user stats
  updateStats: (statsData: any) => apiCall('/auth/stats', {
    method: 'POST',
    body: JSON.stringify(statsData),
  }),

  // Get user profile
  getProfile: () => apiCall('/auth/profile'),
};

// Focus/Timer API (add this at the end of the file)
export const focusAPI = {
  // Record completed session
  recordSession: (sessionData: any) => apiCall('/focus/sessions', {
    method: 'POST',
    body: JSON.stringify({
      session_type: sessionData.session_type, // 'work', 'break', 'custom'
      duration_planned: sessionData.duration_planned, // in seconds
      duration_actual: sessionData.duration_actual, // in seconds
      habit_id: sessionData.habit_id || null,
      focus_topic: sessionData.focus_topic || null,
      completed: sessionData.completed,
      experience_gained: sessionData.experience_gained || 0,
      coins_gained: sessionData.coins_gained || 0
    }),
  }),

  // Get session history
  getSessions: (period?: string) => apiCall(`/focus/sessions${period ? `?period=${period}` : ''}`),

  // Sync timer preferences
  syncPreferences: (preferences: any) => apiCall('/focus/preferences', {
    method: 'POST',
    body: JSON.stringify({
      work_duration: preferences.workTime,
      short_break: preferences.breakTime,
      long_break: preferences.longBreakTime,
      auto_start: preferences.autoStartEnabled,
      sound_enabled: preferences.soundEnabled,
      vibration_enabled: preferences.vibrationEnabled
    }),
  }),

  // Get user preferences
  getPreferences: () => apiCall('/focus/preferences'),

  // Update focus stats
  updateStats: (statsData: any) => apiCall('/focus/stats', {
    method: 'POST',
    body: JSON.stringify(statsData),
  }),
};

// Stats/Character API (add this at the end of the file)
export const statsAPI = {
  // Get user character stats
  getStats: () => apiCall('/stats'),

  // Update user character stats
  updateStats: (statsData: any) => apiCall('/stats', {
    method: 'POST',
    body: JSON.stringify({
      level: statsData.level,
      experience: statsData.experience,
      health: statsData.health,
      coins_earned: statsData.coinsEarned,
      gems_earned: statsData.gemsEarned,
      current_streak: statsData.currentStreak,
      longest_streak: statsData.longestStreak,
      total_tasks_completed: statsData.totalTasksCompleted,
      focus_minutes: statsData.focusMinutes,
      focus_sessions: statsData.focusSessions
    }),
  }),

  // Reset user stats (for testing)
  resetStats: () => apiCall('/stats/reset', {
    method: 'POST',
  }),
};

// ========== SOCIAL API ==========

// Friends API
export const friendsAPI = {
  // Search for users
  searchUsers: (query: string) => apiCall(`/social/friends/search?query=${encodeURIComponent(query)}`),

  // Send friend request
  sendFriendRequest: (friendId: number) => apiCall('/social/friends/request', {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  }),

  // Accept friend request
  acceptFriendRequest: (friendshipId: number) => apiCall(`/social/friends/accept/${friendshipId}`, {
    method: 'PUT',
  }),

  // Remove friend
  removeFriend: (friendshipId: number) => apiCall(`/social/friends/${friendshipId}`, {
    method: 'DELETE',
  }),

  // Get friends list
  getFriends: () => apiCall('/social/friends'),

  // Get pending requests
  getPendingRequests: () => apiCall('/social/friends/pending'),

  // Get sent requests
  getSentRequests: () => apiCall('/social/friends/sent'),

  // Block user
  blockUser: (friendshipId: number) => apiCall(`/social/friends/block/${friendshipId}`, {
    method: 'PUT',
  }),
};

// Parties API
export const partiesAPI = {
  // Create party
  createParty: (partyData: {
    name: string;
    description?: string;
    goal?: string;
    privacy?: string;
    maxMembers?: number;
  }) => apiCall('/social/parties', {
    method: 'POST',
    body: JSON.stringify(partyData),
  }),

  // Get user's parties
  getUserParties: () => apiCall('/social/parties/my'),

  // Get available parties
  getAvailableParties: () => apiCall('/social/parties'),

  // Get party details
  getParty: (partyId: number) => apiCall(`/social/parties/${partyId}`),

  // Join party
  joinParty: (partyId: number) => apiCall(`/social/parties/${partyId}/join`, {
    method: 'POST',
  }),

  // Leave party
  leaveParty: (partyId: number) => apiCall(`/social/parties/${partyId}/leave`, {
    method: 'DELETE',
  }),

  // Invite to party
  inviteToParty: (partyId: number, userId: number) => apiCall(`/social/parties/${partyId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),

  // Accept party invitation
  acceptPartyInvitation: (invitationId: number) => apiCall(`/social/parties/invitations/${invitationId}/accept`, {
    method: 'PUT',
  }),

  // Decline party invitation
  declinePartyInvitation: (invitationId: number) => apiCall(`/social/parties/invitations/${invitationId}/decline`, {
    method: 'PUT',
  }),

  // Get party invitations
  getPartyInvitations: () => apiCall('/social/parties/invitations'),

  // Get party members
  getPartyMembers: (partyId: number) => apiCall(`/social/parties/${partyId}/members`),
};

// Challenges API
export const challengesAPI = {
  // Get active challenges
  getActiveChallenges: () => apiCall('/social/challenges'),

  // Get user's challenges
  getUserChallenges: () => apiCall('/social/challenges/my'),

  // Get challenge details
  getChallenge: (challengeId: number) => apiCall(`/social/challenges/${challengeId}`),

  // Join challenge
  joinChallenge: (challengeId: number) => apiCall(`/social/challenges/${challengeId}/join`, {
    method: 'POST',
  }),

  // Update challenge progress
  updateChallengeProgress: (challengeId: number, progress: number) => apiCall(`/social/challenges/${challengeId}/progress`, {
    method: 'PUT',
    body: JSON.stringify({ progress }),
  }),

  // Get challenge leaderboard
  getChallengeLeaderboard: (challengeId: number) => apiCall(`/social/challenges/${challengeId}/leaderboard`),

  // Create challenge
  createChallenge: (challengeData: {
    title: string;
    description?: string;
    type: string;
    targetValue?: number;
    startDate: string;
    endDate: string;
    rewardXp?: number;
    rewardCoins?: number;
  }) => apiCall('/social/challenges', {
    method: 'POST',
    body: JSON.stringify(challengeData),
  }),
};

// Social Stats API
export const socialAPI = {
  // Get social stats overview
  getStats: () => apiCall('/social/stats'),
};