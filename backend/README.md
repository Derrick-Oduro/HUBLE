# HUBLE Backend API

A Node.js Express backend API for the HUBLE habit tracking mobile application, built with SQLite database.

## 🚀 Features

- **User Authentication** (Register, Login, JWT)
- **Habit Tracking** (Create, Update, Complete, Delete)
- **Daily Tasks** (Manage daily recurring tasks)
- **Routines** (Multi-step task sequences)
- **Statistics & Analytics** (Progress tracking)
- **SQLite Database** (Lightweight, no server required)
- **Security** (Rate limiting, input sanitization, CORS)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/stats` - Update user stats

### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `POST /api/habits/:id/complete` - Mark habit as completed
- `DELETE /api/habits/:id` - Delete habit

### Dailies

- `GET /api/dailies` - Get all daily tasks
- `POST /api/dailies` - Create new daily task
- `PUT /api/dailies/:id` - Update daily task
- `POST /api/dailies/:id/complete` - Mark daily as completed
- `DELETE /api/dailies/:id` - Delete daily task

### Routines

- `GET /api/routines` - Get all routines
- `POST /api/routines` - Create new routine
- `PUT /api/routines/:id` - Update routine
- `POST /api/routines/:id/complete` - Complete routine
- `DELETE /api/routines/:id` - Delete routine

## 🔧 Configuration

### Environment Variables

| Variable     | Description          | Default           |
| ------------ | -------------------- | ----------------- |
| `NODE_ENV`   | Environment mode     | `development`     |
| `PORT`       | Server port          | `3000`            |
| `HOST`       | Server host          | `localhost`       |
| `JWT_SECRET` | JWT signing secret   | Required          |
| `DB_PATH`    | SQLite database path | `./data/huble.db` |

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── app.js          # Express app setup
├── tests/              # Test files
├── data/               # SQLite database
├── server.js           # Server entry point
└── package.json
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Rate Limiting** - Prevent API abuse
- **Input Sanitization** - Prevent XSS attacks
- **CORS Protection** - Control cross-origin requests
- **Helmet Security** - Set security headers

## 📱 Mobile App Integration

This backend is designed to work with the HUBLE React Native mobile app. Make sure to:

1. Update CORS origins in `.env` to include your mobile app URLs
2. Use the correct API base URL in your mobile app
3. Include the JWT token in Authorization headers

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure the `data/` directory exists
   - Check file permissions

2. **CORS Errors**

   - Add your mobile app URL to `CORS_ORIGINS` in `.env`

3. **Authentication Errors**
   - Verify JWT_SECRET is set in `.env`
   - Check token format in requests

## 📄 License

MIT License - see LICENSE file for details
