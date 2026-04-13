# HUBLE Admin Panel

A React-based admin dashboard for managing your HUBLE app.

## Features

✅ **Dashboard Statistics**

- View total users, active events, themes, and recent signups
- Real-time stats from your database

✅ **Themes Management**

- Create, edit, and delete themes
- Set unlock conditions (level requirements)
- Configure theme colors
- Mark themes as premium or free

✅ **Events & Challenges**

- Create time-based events and challenges
- Set start/end dates
- Configure max participants
- Manage rewards and requirements

✅ **User Management**

- View all registered users
- Check user statistics (level, XP, tasks completed)
- Monitor user activity

✅ **Secure Authentication**

- Admin-only access with JWT tokens
- Protected API endpoints

## Setup Instructions

### 1. Initialize Admin Database Tables

Run this command from the `backend` directory:

```bash
node initAdmin.js
```

This will create the necessary database tables for admins, themes, and events.

### 2. Create Your First Admin Account

Send a POST request to create the first admin:

```bash
curl -X POST http://localhost:3000/api/admin/auth/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@huble.com",
    "password": "yourSecurePassword123"
  }'
```

Or use Postman/Insomnia:

- **URL**: `http://localhost:3000/api/admin/auth/create-first-admin`
- **Method**: POST
- **Body** (JSON):
  ```json
  {
    "username": "admin",
    "email": "admin@huble.com",
    "password": "yourSecurePassword123"
  }
  ```

⚠️ **Note**: You can only create the first admin when no admins exist. After that, new admins must be created by existing admins.

### 3. Start the Backend Server

```bash
npm start
```

### 4. Access the Admin Panel

Open your browser and navigate to:

```
http://localhost:3000/admin
```

Login with the credentials you created in step 2.

### 5. Admin Web Development

The admin UI source lives in `admin-web/`.

```bash
cd admin-web
npm install
npm run dev
```

When you're ready to publish changes, build the React app and it will emit the production files into `backend/public/admin/`:

```bash
cd admin-web
npm run build
```

Do not edit the generated files in `backend/public/admin/` by hand; they are build output.

## Admin Panel Usage

### Dashboard

- View overview statistics
- Monitor app usage metrics

### Themes Management

1. Click "Add Theme" to create a new theme
2. Fill in theme details:
   - **Name**: Display name (e.g., "Dark Mode")
   - **Theme ID**: Unique identifier (e.g., "dark-mode")
   - **Category**: Default, Nature, Vibrant, Premium, or Elegant
   - **Unlock Requirement**: Description (e.g., "Reach level 10")
   - **Unlock Level**: Minimum level required
   - **Premium**: Check if this is a premium theme
3. Configure theme colors (optional)
4. Click "Save Theme"

**Edit/Delete:**

- Click "✏️ Edit" to modify a theme
- Click "🗑️ Delete" to remove a theme (soft delete)

### Events & Challenges Management

1. Click "Add Event" to create a new event
2. Fill in event details:
   - **Title**: Event name
   - **Description**: Event details
   - **Type**: Challenge, Event, or Competition
   - **Start Date**: When the event begins
   - **End Date**: When the event ends
   - **Max Participants**: Leave empty for unlimited
   - **Rewards & Requirements**: Configure in JSON format
3. Click "Save Event"

**Note**: Only events with `start_date <= NOW <= end_date` are shown as active in the app.

### User Management

- View all registered users
- Check user levels and progress
- Monitor user engagement

## API Endpoints

### Authentication

- `POST /api/admin/auth/create-first-admin` - Create first admin (no auth required)
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/profile` - Get admin profile (requires auth)

### Dashboard

- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Themes

- `GET /api/admin/themes` - Get all themes
- `POST /api/admin/themes` - Create theme
- `PUT /api/admin/themes/:id` - Update theme
- `DELETE /api/admin/themes/:id` - Delete theme

### Events

- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

### Users

- `GET /api/admin/users` - Get all users with stats
- `GET /api/admin/users/:id` - Get specific user details

All admin endpoints (except login and create-first-admin) require the `Authorization: Bearer <token>` header.

## Security

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- Admin endpoints are protected by authentication middleware
- Rate limiting is applied to prevent abuse

## Troubleshooting

**Can't access admin panel:**

- Make sure the backend server is running (`npm start`)
- Check that you're accessing `http://localhost:3000/admin` (not `/api/admin`)

**Login fails:**

- Verify you created an admin account
- Check email/password are correct
- Ensure database tables were initialized

**Tables don't exist:**

- Run `node initAdmin.js` from the backend directory
- Check for any error messages

**CORS errors:**

- Admin panel is served from the same origin, so CORS shouldn't be an issue
- If you see CORS errors, check your CORS configuration in `app.js`

## Development

The admin panel is built with:

- **React** + **Vite** in `admin-web/`
- **Vanilla CSS** in `admin-web/src/styles.css`
- **Fetch API** through the shared admin API client in `admin-web/src/lib/api.js`

To modify the admin panel:

1. Edit the files in `admin-web/src/`
2. Run `npm run dev` in `admin-web/` for local development
3. Run `npm run build` to refresh the generated files served from `backend/public/admin/`

## Future Enhancements

Potential features to add:

- Avatar/icon management
- Push notifications configuration
- Bulk user operations
- Analytics and charts
- Export data functionality
- Email templates management

---

**Created for HUBLE** - Your gamified habit tracker 🎮
