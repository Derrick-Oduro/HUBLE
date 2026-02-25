const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");
const authenticate = require("../middleware/auth");

// Social Stats
router.get("/stats", authenticate, socialController.getSocialStats);

// Friend Routes
router.get("/friends", authenticate, socialController.getFriends);
router.get(
  "/friends/pending",
  authenticate,
  socialController.getPendingRequests,
);
router.get("/friends/sent", authenticate, socialController.getSentRequests);
router.get("/friends/search", authenticate, socialController.searchUsers);
router.post(
  "/friends/request",
  authenticate,
  socialController.sendFriendRequest,
);
router.put(
  "/friends/accept/:friendshipId",
  authenticate,
  socialController.acceptFriendRequest,
);
router.delete(
  "/friends/:friendshipId",
  authenticate,
  socialController.removeFriend,
);
router.put(
  "/friends/block/:friendshipId",
  authenticate,
  socialController.blockUser,
);

// Party Routes
router.get("/parties", authenticate, socialController.getAvailableParties);
router.get("/parties/my", authenticate, socialController.getUserParties);
router.get("/parties/:id", authenticate, socialController.getPartyById);
router.post("/parties", authenticate, socialController.createParty);
router.post("/parties/:id/join", authenticate, socialController.joinParty);
router.delete("/parties/:id/leave", authenticate, socialController.leaveParty);
router.post(
  "/parties/:id/invite",
  authenticate,
  socialController.inviteToParty,
);
router.get(
  "/parties/invitations",
  authenticate,
  socialController.getPartyInvitations,
);
router.put(
  "/parties/invitations/:id/accept",
  authenticate,
  socialController.acceptPartyInvitation,
);
router.put(
  "/parties/invitations/:id/decline",
  authenticate,
  socialController.declinePartyInvitation,
);
router.get(
  "/parties/:id/members",
  authenticate,
  socialController.getPartyMembers,
);

// Challenge Routes
router.get("/challenges", authenticate, socialController.getActiveChallenges);
router.get("/challenges/my", authenticate, socialController.getUserChallenges);
router.get("/challenges/:id", authenticate, socialController.getChallengeById);
router.post("/challenges", authenticate, socialController.createChallenge);
router.post(
  "/challenges/:id/join",
  authenticate,
  socialController.joinChallenge,
);
router.put(
  "/challenges/:id/progress",
  authenticate,
  socialController.updateChallengeProgress,
);
router.get(
  "/challenges/:id/leaderboard",
  authenticate,
  socialController.getChallengeLeaderboard,
);

module.exports = router;
