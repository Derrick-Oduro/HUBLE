const ActivityFeed = require("../models/ActivityFeed");

class ActivityService {
  // Log habit completion
  static async logHabitCompletion(userId, habitTitle) {
    return ActivityFeed.logActivity(userId, {
      type: "habit_completed",
      title: `Completed "${habitTitle}"`,
      description: "Habit completed successfully",
      icon: "checkmark-circle",
      color: "#10B981",
      metadata: { habitTitle },
    });
  }

  // Log level up
  static async logLevelUp(userId, newLevel) {
    return ActivityFeed.logActivity(userId, {
      type: "level_up",
      title: `Reached Level ${newLevel}!`,
      description: "Leveled up through dedication",
      icon: "trending-up",
      color: "#8B5CF6",
      metadata: { level: newLevel },
    });
  }

  // Log achievement unlock
  static async logAchievementUnlock(userId, achievementTitle) {
    return ActivityFeed.logActivity(userId, {
      type: "achievement_unlocked",
      title: `Unlocked "${achievementTitle}"`,
      description: "New achievement earned",
      icon: "trophy",
      color: "#F59E0B",
      metadata: { achievementTitle },
    });
  }

  // Log challenge completion
  static async logChallengeCompletion(userId, challengeTitle) {
    return ActivityFeed.logActivity(userId, {
      type: "challenge_completed",
      title: `Completed "${challengeTitle}"`,
      description: "Challenge conquered",
      icon: "flag",
      color: "#EF4444",
      metadata: { challengeTitle },
    });
  }

  // Log focus session
  static async logFocusSession(userId, duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return ActivityFeed.logActivity(userId, {
      type: "focus_session",
      title: `Focused for ${timeStr}`,
      description: "Deep work session completed",
      icon: "timer",
      color: "#3B82F6",
      metadata: { duration },
    });
  }

  // Log friend added
  static async logFriendAdded(userId, friendUsername) {
    return ActivityFeed.logActivity(userId, {
      type: "friend_added",
      title: `Added ${friendUsername} as friend`,
      description: "New connection made",
      icon: "people",
      color: "#14B8A6",
      metadata: { friendUsername },
    });
  }

  // Log party join
  static async logPartyJoin(userId, partyName) {
    return ActivityFeed.logActivity(userId, {
      type: "party_joined",
      title: `Joined "${partyName}"`,
      description: "New party adventure begins",
      icon: "people-circle",
      color: "#A855F7",
      metadata: { partyName },
    });
  }

  // Log streak milestone
  static async logStreakMilestone(userId, streakDays) {
    return ActivityFeed.logActivity(userId, {
      type: "streak_milestone",
      title: `${streakDays}-Day Streak!`,
      description: "Consistency pays off",
      icon: "flame",
      color: "#F97316",
      metadata: { streakDays },
    });
  }
}

module.exports = ActivityService;
