const database = require("../config/database");

class Party {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.emoji = data.emoji;
    this.color = data.color;
    this.creator_id = data.creator_id;
    this.max_members = data.max_members;
    this.goal = data.goal;
    this.progress = data.progress;
    this.type = data.type; // 'study', 'fitness', 'coding', etc.
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new party
  static async create(partyData) {
    try {
      const {
        name,
        description,
        emoji,
        color,
        creator_id,
        max_members,
        goal,
        type,
      } = partyData;

      const result = await database.run(
        `
        INSERT INTO parties (name, description, emoji, color, creator_id, max_members, goal, progress, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
      `,
        [
          name,
          description,
          emoji || "🎉",
          color || "#8B5CF6",
          creator_id,
          max_members || 10,
          goal,
          type || "general",
        ],
      );

      // Automatically add creator as admin member
      await database.run(
        `
        INSERT INTO party_members (party_id, user_id, role)
        VALUES (?, ?, 'admin')
      `,
        [result.lastID, creator_id],
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
      const party = await database.get(
        `
        SELECT p.*, 
               COUNT(DISTINCT pm.user_id) as member_count,
               MAX(pm.joined_at) as last_activity
        FROM parties p
        LEFT JOIN party_members pm ON p.id = pm.party_id
        WHERE p.id = ?
        GROUP BY p.id
      `,
        [partyId],
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
      const parties = await database.all(
        `
        SELECT p.*, 
               pm.role,
               COUNT(DISTINCT pm2.user_id) as member_count,
               MAX(pm2.joined_at) as last_activity
        FROM parties p
        JOIN party_members pm ON p.id = pm.party_id AND pm.user_id = ?
        LEFT JOIN party_members pm2 ON p.id = pm2.party_id
        GROUP BY p.id
        ORDER BY last_activity DESC
      `,
        [userId],
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
      const parties = await database.all(
        `
        SELECT p.*, 
               COUNT(DISTINCT pm.user_id) as member_count,
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
      if (party.creator_id === userId) {
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
