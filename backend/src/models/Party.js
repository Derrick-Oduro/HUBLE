const database = require("../config/database");

class Party {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.emoji = data.emoji;
    this.color = data.color;
    this.created_by = data.created_by;
    this.max_members = data.max_members;
    this.goal = data.goal;
    this.weekly_goal_label = data.weekly_goal_label;
    this.weekly_goal_target = data.weekly_goal_target;
    this.weekly_points = data.weekly_points;
    this.progress = data.progress;
    this.type = data.type; // 'study', 'fitness', 'coding', etc.
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static getCurrentWeekKey(now = new Date()) {
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);

    const currentDay = weekStart.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    return Party.formatDateKey(weekStart);
  }

  static normalizeEmoji(inputEmoji) {
    if (typeof inputEmoji !== "string") {
      return "🤝";
    }

    const normalized = inputEmoji.trim();
    if (!normalized) {
      return "🤝";
    }

    // Keep storage compact and avoid accidental long text values.
    return normalized.slice(0, 8);
  }

  // Create new party
  static async create(partyData) {
    try {
      const {
        name,
        description,
        emoji,
        color,
        created_by,
        max_members,
        goal,
        weekly_goal_label,
        weekly_goal_target,
        privacy,
        type,
      } = partyData;

      const resolvedMaxMembers = Math.max(2, Number(max_members) || 10);
      const resolvedWeeklyGoalTarget = Math.max(
        1,
        Number(weekly_goal_target) || 10,
      );
      const resolvedGoalLabel =
        `${weekly_goal_label || goal || "Weekly team goal"}`.trim() ||
        "Weekly team goal";
      const resolvedColor =
        typeof color === "string" && color.trim() ? color.trim() : "#8B5CF6";
      const resolvedType =
        typeof type === "string" && type.trim() ? type.trim() : "cooperative";
      const resolvedPrivacy = privacy === "private" ? "private" : "public";

      const result = await database.run(
        `
        INSERT INTO parties (
          name, description, emoji, color, created_by, max_members, goal,
          weekly_goal_label, weekly_goal_target, progress, type, privacy
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `,
        [
          name,
          description,
          Party.normalizeEmoji(emoji),
          resolvedColor,
          created_by,
          resolvedMaxMembers,
          goal || resolvedGoalLabel,
          resolvedGoalLabel,
          resolvedWeeklyGoalTarget,
          resolvedType,
          resolvedPrivacy,
        ],
      );

      // Automatically add creator as admin member
      await database.run(
        `
        INSERT INTO party_members (party_id, user_id, role)
        VALUES (?, ?, 'admin')
      `,
        [result.lastID, created_by],
      );

      return result.lastID;
    } catch (error) {
      console.error("Error creating party:", error);
      throw error;
    }
  }

  // Get party by ID
  static async getById(partyId) {
    try {
      const weekKey = Party.getCurrentWeekKey();
      const party = await database.get(
        `
        SELECT p.*, 
               COUNT(DISTINCT pm.user_id) as member_count,
               COALESCE((
                 SELECT SUM(pc.points)
                 FROM party_contributions pc
                 WHERE pc.party_id = p.id AND pc.week_key = ?
               ), 0) as weekly_points,
               MAX(pm.joined_at) as last_activity
        FROM parties p
        LEFT JOIN party_members pm ON p.id = pm.party_id
        WHERE p.id = ?
        GROUP BY p.id
      `,
        [weekKey, partyId],
      );

      return party;
    } catch (error) {
      console.error("Error getting party:", error);
      throw error;
    }
  }

  // Get user's parties
  static async getUserParties(userId) {
    try {
      const weekKey = Party.getCurrentWeekKey();
      const parties = await database.all(
        `
        SELECT p.*, 
               pm.role,
               COUNT(DISTINCT pm2.user_id) as member_count,
               COALESCE((
                 SELECT SUM(pc.points)
                 FROM party_contributions pc
                 WHERE pc.party_id = p.id AND pc.week_key = ?
               ), 0) as weekly_points,
               MAX(pm2.joined_at) as last_activity
        FROM parties p
        JOIN party_members pm ON p.id = pm.party_id AND pm.user_id = ?
        LEFT JOIN party_members pm2 ON p.id = pm2.party_id
        GROUP BY p.id
        ORDER BY last_activity DESC
      `,
        [weekKey, userId],
      );

      return parties;
    } catch (error) {
      console.error("Error getting user parties:", error);
      throw error;
    }
  }

  // Get available public parties
  static async getAvailable() {
    try {
      const weekKey = Party.getCurrentWeekKey();
      const parties = await database.all(
        `
        SELECT p.*, 
               COUNT(DISTINCT pm.user_id) as member_count,
               COALESCE((
                 SELECT SUM(pc.points)
                 FROM party_contributions pc
                 WHERE pc.party_id = p.id AND pc.week_key = ?
               ), 0) as weekly_points,
               u.username as creator_username
        FROM parties p
        LEFT JOIN party_members pm ON p.id = pm.party_id
        JOIN users u ON p.created_by = u.id
        WHERE p.privacy = 'public'
        GROUP BY p.id
        HAVING member_count < p.max_members
        ORDER BY p.created_at DESC
        LIMIT 50
      `,
        [weekKey],
      );

      return parties;
    } catch (error) {
      console.error("Error getting available parties:", error);
      throw error;
    }
  }

  // Join party
  static async join(partyId, userId) {
    try {
      // Check if party is full
      const party = await this.getById(partyId);
      if (party.member_count >= party.max_members) {
        throw new Error("Party is full");
      }

      // Check if already a member
      const existing = await database.get(
        `
        SELECT * FROM party_members 
        WHERE party_id = ? AND user_id = ?
      `,
        [partyId, userId],
      );

      if (existing) {
        throw new Error("Already a member of this party");
      }

      await database.run(
        `
        INSERT INTO party_members (party_id, user_id, role)
        VALUES (?, ?, 'member')
      `,
        [partyId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error joining party:", error);
      throw error;
    }
  }

  // Leave party
  static async leave(partyId, userId) {
    try {
      await database.run(
        `
        DELETE FROM party_members 
        WHERE party_id = ? AND user_id = ?
      `,
        [partyId, userId],
      );

      // If creator leaves, delete the party
      const party = await this.getById(partyId);
      if (party.created_by === userId) {
        await database.run("DELETE FROM parties WHERE id = ?", [partyId]);
      }

      return true;
    } catch (error) {
      console.error("Error leaving party:", error);
      throw error;
    }
  }

  // Get party members
  static async getMembers(partyId) {
    try {
      const members = await database.all(
        `
        SELECT u.id, u.username, u.email, u.level, u.avatar, u.current_streak,
               pm.role, pm.joined_at
        FROM party_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.party_id = ?
        ORDER BY pm.role DESC, pm.joined_at ASC
      `,
        [partyId],
      );

      return members;
    } catch (error) {
      console.error("Error getting party members:", error);
      throw error;
    }
  }

  // Update party progress
  static async updateProgress(partyId, progress) {
    try {
      await database.run(
        `
        UPDATE parties 
        SET progress = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [progress, partyId],
      );

      return true;
    } catch (error) {
      console.error("Error updating party progress:", error);
      throw error;
    }
  }

  static async isMember(partyId, userId) {
    const membership = await database.get(
      `
      SELECT id FROM party_members
      WHERE party_id = ? AND user_id = ?
    `,
      [partyId, userId],
    );

    return Boolean(membership);
  }

  static async addContribution(partyId, userId, points = 1, weekKey) {
    const effectivePoints = Math.max(1, Number(points) || 1);
    const effectiveWeekKey = weekKey || Party.getCurrentWeekKey();

    const isPartyMember = await Party.isMember(partyId, userId);
    if (!isPartyMember) {
      throw new Error("You must join this party before contributing");
    }

    await database.run(
      `
      INSERT INTO party_contributions (party_id, user_id, week_key, points, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(party_id, user_id, week_key)
      DO UPDATE SET
        points = points + excluded.points,
        updated_at = CURRENT_TIMESTAMP
    `,
      [partyId, userId, effectiveWeekKey, effectivePoints],
    );

    const summary = await Party.getWeeklyContributionSummary(
      partyId,
      effectiveWeekKey,
    );

    await Party.updateProgress(partyId, summary.progress_percent);
    return summary;
  }

  static async getWeeklyContributionSummary(partyId, weekKey) {
    const effectiveWeekKey = weekKey || Party.getCurrentWeekKey();

    const party = await Party.getById(partyId);
    if (!party) {
      throw new Error("Party not found");
    }

    const totalRow = await database.get(
      `
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM party_contributions
      WHERE party_id = ? AND week_key = ?
    `,
      [partyId, effectiveWeekKey],
    );

    const contributors = await database.all(
      `
      SELECT u.id, u.username, u.avatar, COALESCE(pc.points, 0) as points
      FROM party_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN party_contributions pc
        ON pc.party_id = pm.party_id
        AND pc.user_id = pm.user_id
        AND pc.week_key = ?
      WHERE pm.party_id = ?
      ORDER BY points DESC, u.username ASC
    `,
      [effectiveWeekKey, partyId],
    );

    const weeklyGoalTarget = Math.max(
      1,
      Number(party.weekly_goal_target) || 10,
    );
    const weeklyGoalLabel =
      `${party.weekly_goal_label || party.goal || "Weekly team goal"}`.trim() ||
      "Weekly team goal";
    const totalPoints = Number(totalRow?.total_points || 0);
    const progressPercent = Math.min(
      100,
      Math.round((totalPoints / weeklyGoalTarget) * 100),
    );

    return {
      week_key: effectiveWeekKey,
      weekly_goal_label: weeklyGoalLabel,
      weekly_goal_target: weeklyGoalTarget,
      total_points: totalPoints,
      progress_percent: progressPercent,
      member_contributions: contributors,
    };
  }

  // Send party invitation
  static async invite(partyId, userId, invitedBy) {
    try {
      const result = await database.run(
        `
        INSERT INTO party_invitations (party_id, user_id, invited_by)
        VALUES (?, ?, ?)
      `,
        [partyId, userId, invitedBy],
      );

      return result.lastID;
    } catch (error) {
      console.error("Error sending party invitation:", error);
      throw error;
    }
  }

  // Get user's party invitations
  static async getInvitations(userId) {
    try {
      const invitations = await database.all(
        `
        SELECT pi.id as invitation_id,
               p.id, p.name, p.description, p.emoji, p.color,
               u.username as invited_by_username,
               pi.created_at as invited_at,
               COUNT(DISTINCT pm.user_id) as member_count,
               p.max_members
        FROM party_invitations pi
        JOIN parties p ON pi.party_id = p.id
        JOIN users u ON pi.invited_by = u.id
        LEFT JOIN party_members pm ON p.id = pm.party_id
        WHERE pi.user_id = ? AND pi.status = 'pending'
        GROUP BY p.id
        ORDER BY pi.created_at DESC
      `,
        [userId],
      );

      return invitations;
    } catch (error) {
      console.error("Error getting party invitations:", error);
      throw error;
    }
  }

  // Accept invitation
  static async acceptInvitation(invitationId, userId) {
    try {
      const invitation = await database.get(
        `
        SELECT * FROM party_invitations 
        WHERE id = ? AND user_id = ?
      `,
        [invitationId, userId],
      );

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Join the party
      await this.join(invitation.party_id, userId);

      // Update invitation status
      await database.run(
        `
        UPDATE party_invitations 
        SET status = 'accepted'
        WHERE id = ?
      `,
        [invitationId],
      );

      return true;
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }
  }

  // Decline invitation
  static async declineInvitation(invitationId, userId) {
    try {
      await database.run(
        `
        UPDATE party_invitations 
        SET status = 'declined'
        WHERE id = ? AND user_id = ?
      `,
        [invitationId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error declining invitation:", error);
      throw error;
    }
  }
}

module.exports = Party;
