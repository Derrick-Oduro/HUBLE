# Social Features Backend Implementation

## Overview

This document describes the backend implementation for social features including Friends, Parties, and Challenges.

## Database Tables

### Friends Table

```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (references users.id)
- friend_id: INTEGER (references users.id)
- status: TEXT ('pending', 'accepted', 'blocked')
- created_at: DATETIME
- updated_at: DATETIME
```

### Parties Table

```sql
- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- goal: TEXT
- privacy: TEXT ('public', 'private')
- max_members: INTEGER (default: 10)
- created_by: INTEGER (references users.id)
- created_at: DATETIME
- updated_at: DATETIME
```

### Party Members Table

```sql
- id: INTEGER PRIMARY KEY
- party_id: INTEGER (references parties.id)
- user_id: INTEGER (references users.id)
- role: TEXT ('admin', 'member')
- joined_at: DATETIME
```

### Party Invitations Table

```sql
- id: INTEGER PRIMARY KEY
- party_id: INTEGER (references parties.id)
- user_id: INTEGER (references users.id)
- invited_by: INTEGER (references users.id)
- status: TEXT ('pending', 'accepted', 'declined')
- created_at: DATETIME
- updated_at: DATETIME
```

### Challenges Table

```sql
- id: INTEGER PRIMARY KEY
- title: TEXT
- description: TEXT
- type: TEXT ('streak', 'total', 'speed')
- target_value: INTEGER
- start_date: DATE
- end_date: DATE
- reward_xp: INTEGER
- reward_coins: INTEGER
- created_by: INTEGER (references users.id)
- created_at: DATETIME
```

### Challenge Participants Table

```sql
- id: INTEGER PRIMARY KEY
- challenge_id: INTEGER (references challenges.id)
- user_id: INTEGER (references users.id)
- progress: INTEGER
- completed: BOOLEAN
- joined_at: DATETIME
- completed_at: DATETIME
```

## API Endpoints

### Friends

- `GET /api/social/friends` - Get user's friends
- `GET /api/social/friends/pending` - Get pending friend requests
- `GET /api/social/friends/sent` - Get sent friend requests
- `GET /api/social/friends/search?query=username` - Search for users
- `POST /api/social/friends/request` - Send friend request (body: { friendId })
- `PUT /api/social/friends/accept/:friendshipId` - Accept friend request
- `DELETE /api/social/friends/:friendshipId` - Remove friend
- `PUT /api/social/friends/block/:friendshipId` - Block user

### Parties

- `GET /api/social/parties` - Get available public parties
- `GET /api/social/parties/my` - Get user's parties
- `GET /api/social/parties/:id` - Get party details
- `POST /api/social/parties` - Create party (body: { name, description, goal, privacy, maxMembers })
- `POST /api/social/parties/:id/join` - Join party
- `DELETE /api/social/parties/:id/leave` - Leave party
- `POST /api/social/parties/:id/invite` - Invite user (body: { userId })
- `GET /api/social/parties/invitations` - Get party invitations
- `PUT /api/social/parties/invitations/:id/accept` - Accept invitation
- `PUT /api/social/parties/invitations/:id/decline` - Decline invitation
- `GET /api/social/parties/:id/members` - Get party members

### Challenges

- `GET /api/social/challenges` - Get active challenges
- `GET /api/social/challenges/my` - Get user's challenges
- `GET /api/social/challenges/:id` - Get challenge details
- `POST /api/social/challenges` - Create challenge
- `POST /api/social/challenges/:id/join` - Join challenge
- `PUT /api/social/challenges/:id/progress` - Update progress (body: { progress })
- `GET /api/social/challenges/:id/leaderboard` - Get challenge leaderboard

## Testing

### Start the Backend Server

```bash
cd backend
npm install
npm start
```

### Test with curl

#### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response.

#### Search for Users

```bash
curl http://localhost:5000/api/social/friends/search?query=test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Send Friend Request

```bash
curl -X POST http://localhost:5000/api/social/friends/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friendId":2}'
```

#### Get Friends

```bash
curl http://localhost:5000/api/social/friends \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Party

```bash
curl -X POST http://localhost:5000/api/social/parties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Study Squad","description":"Let'\''s study together","goal":"Complete 100 sessions","privacy":"public","maxMembers":10}'
```

#### Get User Parties

```bash
curl http://localhost:5000/api/social/parties/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Active Challenges

```bash
curl http://localhost:5000/api/social/challenges \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration

The frontend pages have been updated to use the real API:

- `app/more/social/friends.tsx` - Friends management
- `app/more/social/parties.tsx` - Party management
- `app/more/social/challenges.tsx` - Challenge browsing

All API calls are handled through `lib/socialApi.ts`.

## What's Next

1. **Start the Backend**:

   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**:

   ```bash
   npm start
   ```

3. **Register/Login**: Create test accounts to test social features

4. **Test Social Features**:
   - Search for users and send friend requests
   - Create parties and invite friends
   - Join challenges and track progress

## Notes

- All endpoints require authentication (JWT token)
- Database tables are automatically created on first server start
- Friend relationships are bidirectional
- Party admins have additional permissions
- Challenges track progress per user
