import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const API_BASE_URL = API_URL;
const API_ROOT_URL = API_BASE_URL.replace('/api', '');

// Helper function to get auth headers
const getAuthHeaders = async (includeAuth = true) => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(includeAuth && token && { 'Authorization': `Bearer ${token}` }),
  };
};

const parseResponseBody = async (response: Response) => {
  if (response.status === 204) {
    return {};
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

// Generic API call function
const apiCall = async (endpoint: string, options: any = {}) => {
  try {
    const { includeAuth = true, fullUrl = false, ...requestOptions } = options;
    const defaultHeaders = await getAuthHeaders(includeAuth);
    const headers = {
      ...defaultHeaders,
      ...(requestOptions.headers || {}),
    };
    const requestUrl = fullUrl ? `${API_ROOT_URL}${endpoint}` : `${API_BASE_URL}${endpoint}`;

    console.log(`🌐 API Call: ${requestUrl}`);
    console.log(`📤 Request options:`, { ...requestOptions, headers });
    
    const response = await fetch(requestUrl, {
      headers,
      ...requestOptions,
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    const responseData = await parseResponseBody(response);

    if (!response.ok) {
      console.log('❌ Error response:', responseData);
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.details = responseData?.details;
      error.data = responseData;
      throw error;
    }

    console.log(`✅ API Response:`, responseData);
    return responseData;
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

  // Update daily
  updateDaily: (id: number, dailyData: any) => apiCall(`/dailies/${id}`, {
    method: 'PUT',
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
  // Login user
  login: (credentials: { email: string; password: string }) => apiCall('/auth/login', {
    method: 'POST',
    includeAuth: false,
    body: JSON.stringify(credentials),
  }),

  // Register user
  register: (userData: { username: string; email: string; password: string }) => apiCall('/auth/register', {
    method: 'POST',
    includeAuth: false,
    body: JSON.stringify(userData),
  }),

  // Check backend health
  checkHealth: () => apiCall('/health', {
    method: 'GET',
    includeAuth: false,
    fullUrl: true,
  }),

  // Check register endpoint availability
  checkRegisterEndpoint: () => apiCall('/auth/register', {
    method: 'OPTIONS',
    includeAuth: false,
  }),

  // Update user stats
  updateStats: (statsData: any) => apiCall('/auth/stats', {
    method: 'POST',
    body: JSON.stringify(statsData),
  }),

  // Get user profile
  getProfile: () => apiCall('/auth/profile'),

  // Update user profile
  updateProfile: (profileData: any) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};

export const configAPI = {
  getThemes: () => apiCall('/config/themes', { includeAuth: false }),
  getAvatars: () => apiCall('/config/avatars', { includeAuth: false }),
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
    weeklyGoalLabel?: string;
    weeklyGoalTarget?: number;
    weekly_goal_label?: string;
    weekly_goal_target?: number;
    privacy?: string;
    maxMembers?: number;
    max_members?: number;
    type?: string;
    emoji?: string;
    color?: string;
  }) => apiCall('/social/parties', {
    method: 'POST',
    body: JSON.stringify({
      ...partyData,
      max_members: partyData.max_members ?? partyData.maxMembers,
    }),
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

  // Contribute to weekly party goal
  contributeToParty: (partyId: number, points = 1) => apiCall(`/social/parties/${partyId}/contribute`, {
    method: 'POST',
    body: JSON.stringify({ points }),
  }),
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
    mode?: 'competitive' | 'cooperative';
    teamTarget?: number;
    emoji?: string;
    color?: string;
    difficulty?: string;
    reward?: string;
  }) => apiCall('/social/challenges', {
    method: 'POST',
    body: JSON.stringify({
      ...challengeData,
      start_date: challengeData.startDate,
      end_date: challengeData.endDate,
      goal_value: challengeData.targetValue,
      goal_type: challengeData.type,
      team_target: challengeData.teamTarget,
      reward_xp: challengeData.rewardXp,
      reward_coins: challengeData.rewardCoins,
    }),
  }),
};

// Social Stats API
export const socialAPI = {
  // Get social stats overview
  getStats: () => apiCall('/social/stats'),
};

// Achievements API
export const achievementsAPI = {
  // Get all achievements with user progress
  getAchievements: () => apiCall('/achievements'),

  // Check and unlock achievements based on current stats
  checkAchievements: () => apiCall('/achievements/check', {
    method: 'POST',
  }),

  // Get achievement statistics
  getStats: () => apiCall('/achievements/stats'),

  // Get unlocked achievements
  getUnlocked: () => apiCall('/achievements/unlocked'),
};

// Activity Feed API
export const activityAPI = {
  // Get user's own activities
  getUserActivities: (limit = 50) => apiCall(`/social/activities?limit=${limit}`),

  // Get friends' activities for social feed
  getFriendsActivities: (limit = 50) => apiCall(`/social/activities/friends?limit=${limit}`),

  // Get party activities
  getPartyActivities: (partyId: number, limit = 50) => apiCall(`/social/activities/party/${partyId}?limit=${limit}`),

  // Cheer an activity
  cheerActivity: (activityId: number) => apiCall(`/social/activities/${activityId}/cheer`, {
    method: 'POST',
  }),

  // Remove cheer from an activity
  uncheerActivity: (activityId: number) => apiCall(`/social/activities/${activityId}/cheer`, {
    method: 'DELETE',
  }),
};

// Password Reset API
export const passwordResetAPI = {
  // Request password reset
  requestReset: (email: string) => apiCall('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  // Verify reset token
  verifyToken: (token: string) => apiCall('/auth/password-reset/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),

  // Reset password
  resetPassword: (token: string, newPassword: string) => apiCall('/auth/password-reset/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),
};

// Data Export & Analytics API
export const dataAPI = {
  // Export all user data
  exportData: () => apiCall('/data/export'),

  // Get analytics
  getAnalytics: (days = 30) => apiCall(`/data/analytics?days=${days}`),

  // Create backup
  createBackup: () => apiCall('/data/backup', {
    method: 'POST',
  }),
};