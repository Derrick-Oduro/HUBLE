# HUBLE Admin Panel - Setup Complete

## ✅ What Has Been Created

### 1. Database Models

- **backend/src/models/Admin.js** - Admin authentication and management
- **backend/src/models/Theme.js** - Theme management with unlock conditions
- **backend/src/models/Event.js** - Events/challenges management

### 2. Controllers

- **backend/src/controllers/adminAuthController.js** - Admin login, profile, createFirstAdmin
- **backend/src/controllers/adminController.js** - Dashboard stats, themes CRUD, events CRUD, user management

### 3. Middleware

- **backend/src/middleware/adminAuth.js** - JWT authentication for admin routes

### 4. Routes

- **backend/src/routes/adminRoutes.js** - All admin API endpoints

### 5. Database Tables Created

✅ **admins** - Admin users table
✅ **themes** - Themes with unlock conditions
✅ **events** - Events and challenges

### 6. Admin Dashboard UI

- **admin-web/** - React/Vite admin source app
- **backend/public/admin/** - Production build output served by the backend

### 7. Server Configuration

- **backend/src/app.js** - Updated with admin routes and static file serving
- Static files served at `/admin` path
- Admin API available at `/api/admin/*`

###8. Documentation

- **backend/ADMIN_PANEL_README.md** - Complete setup and API documentation

## 📋 Database Tables Status

Run `node checkTables.js` to verify all tables exist:

- admins ✅
- themes ✅
- events ✅

## 🔐 Creating First Admin Account

### Method 1: Direct Database Creation

```bash
cd backend
node createAdminDirect.js
```

This script:

1. Connects to database
2. Checks if admins exist
3. Creates first admin with credentials:
   - Username: `admin`
   - Email: `admin@huble.com`
   - Password: `Admin@123`
   - Role: `super-admin`

### Method 2: Via API (when server running)

```bash
# Start server
cd backend
npm start

# In another terminal:
POST http://localhost:3000/api/admin/auth/create-first-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@huble.com",
  "password": "Admin@123"
}
```

## 🚀 Starting the Admin Panel

### 1. Start Backend Server

```bash
cd backend
npm start
```

### 2. Create Admin Account

```bash
node createAdminDirect.js
```

### 3. Access Admin Panel

Open browser: `http://localhost:3000/admin`

### 4. Login

- Email: `admin@huble.com`
- Password: `Admin@123`

## 📊 Admin Panel Features

### Dashboard

- Total users count
- Total themes count
- Active events count
- Total focus minutes

### Themes Management

- View all themes
- Create new themes with unlock conditions
- Edit theme details, colors, unlock requirements
- Delete themes
- Set premium status

### Events Management

- View all events/challenges
- Create new events with date ranges
- Edit event details
- Delete events
- Set max participants

### User Management

-View all users

- View user details and stats
- See user levels, experience, health
- Track focus sessions and task completions

## 🔧 Admin API Endpoints

### Authentication (No auth required)

- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/create-first-admin` - Create first admin (only works if no admins exist)

### Protected Endpoints (JWT required)

- `GET /api/admin/auth/profile` - Get admin profile
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### Themes

- `GET /api/admin/themes` - List all themes
- `POST /api/admin/themes` - Create theme
- `PUT /api/admin/themes/:id` - Update theme
- `DELETE /api/admin/themes/:id` - Delete theme

### Events

- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

### Users

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details

## 🎨 Theme Management Example

### Create Theme

```json
POST /api/admin/themes
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Ocean Blue",
  "theme_id": "ocean_blue",
  "category": "Nature",
  "colors": {
    "primary": "#0077BE",
    "secondary": "#00B4D8",
    "accent": "#90E0EF"
  },
  "unlock_requirement": "level",
  "unlock_level": 10,
  "is_premium": false
}
```

### Update Theme

```json
PUT /api/admin/themes/1
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Ocean Blue Updated",
  "unlock_level": 15
}
```

## 🎯 Event Management Example

### Create Event

```json
POST /api/admin/events
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Summer Challenge 2024",
  "description": "Complete 30 tasks in 30 days",
  "type": "challenge",
  "start_date": "2024-06-01",
  "end_date": "2024-06-30",
  "max_participants": 100,
  "rewards": {
    "coins": 500,
    "experience": 1000,
    "badge": "summer_champion"
  },
  "requirements": {
    "min_level": 5,
    "tasks_required": 30
  }
}
```

## 🛠️ Troubleshooting

### Port 3000 Already in Use

```bash
# Windows
Get-Process -Name node | Stop-Process -Force

# Then restart
cd backend
npm start
```

### Database Tables Missing

```bash
cd backend
node initAdmin.js
```

### Admin Already Exists Error

If you see "Admin already exists" when trying to create first admin:

- An admin was already created
- Use existing credentials to login
- Or manually delete from database if needed

## 📱 Next Steps

1. **Create Admin Account**: Run `node createAdminDirect.js`
2. **Start Server**: `npm start`
3. **Access Panel**: http://localhost:3000/admin
4. **Login**: Use admin credentials
5. **Add Themes**: Create themes for mobile app
6. **Create Events**: Set up challenges and events
7. **Monitor Users**: View user statistics

## 🧩 Admin Web Source

- Edit the React admin app in `admin-web/src/`
- Run `cd admin-web && npm run dev` for local development
- Run `cd admin-web && npm run build` to refresh the files served from `/admin`

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Admin-only middleware protects routes
- create-first-admin only works when no admins exist
- Sensitive data excluded from API responses

## 📝 Notes

- Admin panel built with React and Vite
- Dark theme UI optimized for desktop use
- All CRUD operations supported
- Real-time validation and error handling
- Responsive layout for different screen sizes

---

**Admin Panel Ready! Follow setup steps above to get started.** 🎉
