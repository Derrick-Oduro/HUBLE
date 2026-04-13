const Friend = require("../models/Friend");
const Party = require("../models/Party");
const Challenge = require("../models/Challenge");
const ActivityFeed = require("../models/ActivityFeed");

// Friend Controllers
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await Friend.getFriends(userId);
    res.json({ success: true, friends });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        error: "Cannot send friend request to yourself",
      });
    }

    const requestId = await Friend.sendRequest(userId, friendId);
    res.json({ success: true, requestId, message: "Friend request sent" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;

    await Friend.acceptRequest(friendshipId, userId);
    res.json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;

    await Friend.remove(friendshipId, userId);
    res.json({ success: true, message: "Friend removed" });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Friend.getPendingRequests(userId);
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Friend.getSentRequests(userId);
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;

    await Friend.block(friendshipId, userId);
    res.json({ success: true, message: "User blocked" });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await Friend.searchUsers(userId, query);
    res.json({ success: true, users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Party Controllers
exports.getUserParties = async (req, res) => {
  try {
    const userId = req.user.id;
    const parties = await Party.getUserParties(userId);
    res.json({ success: true, parties });
  } catch (error) {
    console.error("Get user parties error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAvailableParties = async (req, res) => {
  try {
    const parties = await Party.getAvailable();
    res.json({ success: true, parties });
  } catch (error) {
    console.error("Get available parties error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createParty = async (req, res) => {
  try {
    const userId = req.user.id;
    const partyData = {
      name: `${req.body.name || ""}`.trim(),
      description: `${req.body.description || ""}`.trim(),
      goal: `${
        req.body.goal ||
        req.body.weeklyGoalLabel ||
        req.body.weekly_goal_label ||
        ""
      }`.trim(),
      weekly_goal_label: `${
        req.body.weeklyGoalLabel ||
        req.body.weekly_goal_label ||
        req.body.goal ||
        "Weekly team goal"
      }`.trim(),
      weekly_goal_target: Number(
        req.body.weeklyGoalTarget || req.body.weekly_goal_target || 10,
      ),
      privacy: req.body.privacy === "private" ? "private" : "public",
      max_members: Number(req.body.max_members || req.body.maxMembers || 10),
      type: req.body.type || "cooperative",
      emoji: req.body.emoji,
      color: req.body.color,
      created_by: userId,
    };

    if (!partyData.name) {
      return res.status(400).json({
        success: false,
        error: "Party name is required",
      });
    }

    const partyId = await Party.create(partyData);
    res.json({ success: true, partyId, message: "Party created successfully" });
  } catch (error) {
    console.error("Create party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    const party = await Party.getById(id);

    if (!party) {
      return res.status(404).json({ success: false, error: "Party not found" });
    }

    const members = await Party.getMembers(id);
    const weekly = await Party.getWeeklyContributionSummary(id);
    res.json({ success: true, party: { ...party, members, weekly } });
  } catch (error) {
    console.error("Get party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.contributeToParty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const points = Math.min(20, Math.max(1, Number(req.body?.points) || 1));

    const summary = await Party.addContribution(id, userId, points);
    res.json({
      success: true,
      message: "Contribution added",
      weekly: summary,
    });
  } catch (error) {
    console.error("Contribute to party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.joinParty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Party.join(id, userId);
    res.json({ success: true, message: "Joined party successfully" });
  } catch (error) {
    console.error("Join party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.leaveParty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Party.leave(id, userId);
    res.json({ success: true, message: "Left party successfully" });
  } catch (error) {
    console.error("Leave party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.inviteToParty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { userId: invitedUserId } = req.body;

    await Party.invite(id, invitedUserId, userId);
    res.json({ success: true, message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Invite to party error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPartyMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await Party.getMembers(id);
    res.json({ success: true, members });
  } catch (error) {
    console.error("Get party members error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPartyInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const invitations = await Party.getInvitations(userId);
    res.json({ success: true, invitations });
  } catch (error) {
    console.error("Get party invitations error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.acceptPartyInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Party.acceptInvitation(id, userId);
    res.json({ success: true, message: "Party invitation accepted" });
  } catch (error) {
    console.error("Accept party invitation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.declinePartyInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Party.declineInvitation(id, userId);
    res.json({ success: true, message: "Party invitation declined" });
  } catch (error) {
    console.error("Decline party invitation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Challenge Controllers
exports.getActiveChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.getActive();
    res.json({ success: true, challenges });
  } catch (error) {
    console.error("Get active challenges error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const challenges = await Challenge.getUserChallenges(userId);
    res.json({ success: true, challenges });
  } catch (error) {
    console.error("Get user challenges error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    let challenge = await Challenge.getById(id);

    if (!challenge) {
      return res
        .status(404)
        .json({ success: false, error: "Challenge not found" });
    }

    if (`${challenge.mode || ""}`.toLowerCase() === "cooperative") {
      const cooperative = await Challenge.getCooperativeProgress(id);
      challenge = {
        ...challenge,
        group_progress: cooperative.group_progress,
        participant_count:
          cooperative.participant_count || challenge.participant_count || 0,
      };
    }

    res.json({ success: true, challenge });
  } catch (error) {
    console.error("Get challenge error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeData = { ...req.body, created_by: userId };

    const challengeId = await Challenge.create(challengeData);
    res.json({
      success: true,
      challengeId,
      message: "Challenge created successfully",
    });
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Challenge.join(id, userId);
    res.json({ success: true, message: "Joined challenge successfully" });
  } catch (error) {
    console.error("Join challenge error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateChallengeProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { progress } = req.body;

    await Challenge.updateProgress(id, userId, progress);
    res.json({ success: true, message: "Challenge progress updated" });
  } catch (error) {
    console.error("Update challenge progress error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChallengeLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const leaderboard = await Challenge.getLeaderboard(id);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Get challenge leaderboard error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get social stats overview
exports.getSocialStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const database = require("../config/database");

    // Get friends count
    const friendsResult = await database.get(
      `SELECT COUNT(*) as count FROM friends 
       WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`,
      [userId, userId],
    );

    // Get parties count
    const partiesResult = await database.get(
      `SELECT COUNT(*) as count FROM party_members WHERE user_id = ?`,
      [userId],
    );

    // Get active challenges count
    const challengesResult = await database.get(
      `SELECT COUNT(*) as count FROM challenge_participants 
       WHERE user_id = ? AND completed = 0`,
      [userId],
    );

    // Get pending friend requests count
    const pendingRequestsResult = await database.get(
      `SELECT COUNT(*) as count FROM friends 
       WHERE friend_id = ? AND status = 'pending'`,
      [userId],
    );

    // Get user streak from users table
    const userResult = await database.get(
      `SELECT current_streak FROM users WHERE id = ?`,
      [userId],
    );

    // Get group badges count - count unlocked achievements in social category
    const groupBadgesResult = await database.get(
      `SELECT COUNT(*) as count FROM user_achievements ua
       INNER JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ? AND ua.unlocked = 1 AND a.category = 'social'`,
      [userId],
    );

    // Get total XP earned from user_stats
    const xpResult = await database.get(
      `SELECT experience FROM user_stats WHERE user_id = ?`,
      [userId],
    );

    res.json({
      success: true,
      stats: {
        friends: friendsResult.count || 0,
        parties: partiesResult.count || 0,
        activeChallenges: challengesResult.count || 0,
        pendingRequests: pendingRequestsResult.count || 0,
        currentStreak: userResult?.current_streak || 0,
        groupBadges: groupBadgesResult?.count || 0,
        totalXpEarned: xpResult?.experience || 0,
      },
    });
  } catch (error) {
    console.error("Get social stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Activity Feed Controllers
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const activities = await ActivityFeed.getUserActivities(userId, limit);
    res.json({ success: true, activities });
  } catch (error) {
    console.error("Get user activities error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFriendsActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const activities = await ActivityFeed.getFriendsActivities(userId, limit);
    res.json({ success: true, activities });
  } catch (error) {
    console.error("Get friends activities error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPartyActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const partyId = req.params.partyId;
    const limit = parseInt(req.query.limit) || 50;

    const activities = await ActivityFeed.getPartyActivities(
      partyId,
      userId,
      limit,
    );
    res.json({ success: true, activities });
  } catch (error) {
    console.error("Get party activities error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cheerActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = Number(req.params.activityId);

    if (!Number.isFinite(activityId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid activity ID" });
    }

    const activity = await ActivityFeed.getActivityById(activityId);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, error: "Activity not found" });
    }

    await ActivityFeed.cheerActivity(activityId, userId);
    const summary = await ActivityFeed.getCheerSummary(activityId, userId);

    return res.json({
      success: true,
      activityId,
      cheersCount: summary.cheersCount,
      hasCheered: summary.hasCheered,
      message: "Cheered activity",
    });
  } catch (error) {
    console.error("Cheer activity error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.uncheerActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = Number(req.params.activityId);

    if (!Number.isFinite(activityId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid activity ID" });
    }

    const activity = await ActivityFeed.getActivityById(activityId);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, error: "Activity not found" });
    }

    await ActivityFeed.uncheerActivity(activityId, userId);
    const summary = await ActivityFeed.getCheerSummary(activityId, userId);

    return res.json({
      success: true,
      activityId,
      cheersCount: summary.cheersCount,
      hasCheered: summary.hasCheered,
      message: "Removed cheer",
    });
  } catch (error) {
    console.error("Uncheer activity error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
