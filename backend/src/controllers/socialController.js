const Friend = require("../models/Friend");
const Party = require("../models/Party");
const Challenge = require("../models/Challenge");

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
    const partyData = { ...req.body, creator_id: userId };

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
    res.json({ success: true, party: { ...party, members } });
  } catch (error) {
    console.error("Get party error:", error);
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
    const challenge = await Challenge.getById(id);

    if (!challenge) {
      return res
        .status(404)
        .json({ success: false, error: "Challenge not found" });
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

    res.json({
      success: true,
      stats: {
        friends: friendsResult.count || 0,
        parties: partiesResult.count || 0,
        activeChallenges: challengesResult.count || 0,
        pendingRequests: pendingRequestsResult.count || 0,
        currentStreak: userResult?.current_streak || 0,
        groupBadges: 0, // Placeholder for future implementation
        totalXpEarned: 0, // Placeholder for future implementation
      },
    });
  } catch (error) {
    console.error("Get social stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
