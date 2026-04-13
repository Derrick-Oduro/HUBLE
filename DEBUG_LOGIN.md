# 🐛 Admin Panel Login Debugging Guide

## Step 1: Stop All Node Processes

Open PowerShell and run:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

## Step 2: Start Server in Debug Mode

In `backend` folder, run:

```bash
cd backend
node server.js
```

**Look for these lines in the output:**

- ✅ "Server is running on port 3000"
- ✅ "Connected to SQLite database"
- ❌ Any ERROR messages

**If you see errors**, copy the error message and share it.

## Step 3: Test the API Directly

While server is running, open **another terminal** and run:

```bash
cd backend
node testLogin.js
```

**Expected output:**

```
Testing login API endpoint...

Status Code: 200
Response Body:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@huble.com"
  }
}

✅ Login API is working!
Token received: Yes
```

**If it hangs or shows error**, there's an issue with the server/routes.

## Step 4: Check Browser Console

1. Open `http://localhost:3000/admin` in Chrome/Edge
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Enter email and password
5. Click Login button
6. **Look for errors in red**

Common errors:

- `CORS error` - Server not configured properly
- `Failed to fetch` - Server not running
- `404 Not Found` - Routes not registered
- `500 Internal Server Error` - Backend code error

## Step 5: Check Network Tab

In Developer Tools:

1. Go to **Network** tab
2. Click Login button
3. Look for the request to `/api/admin/auth/login`
4. Click on that request
5. Check:
   - **Status Code** (should be 200)
   - **Request Payload** (should show email/password)
   - **Response** (should show success/token)

## Step 6: Verify Admin Routes Are Loaded

Create a test file `backend/testRoutes.js`:

```javascript
const app = require("./src/app");

console.log("Registered routes:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(middleware.route.path);
  } else if (middleware.name === "router") {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(handler.route.path);
      }
    });
  }
});
```

Run: `node testRoutes.js`

**Look for**: `/api/admin/*` routes in the output

## Quick Fix Checklist

- [ ] Server is running without errors
- [ ] Admin exists in database (run `node checkAdmins.js`)
- [ ] Browser can load `http://localhost:3000/admin`
- [ ] No JavaScript errors in browser console
- [ ] Network request to `/api/admin/auth/login` returns 200

---

## Most Common Issue

**The login button does nothing** usually means:

1. JavaScript error preventing the form submission
2. API endpoint not responding (check Network tab)
3. CORS blocking the request

**🔍 What to share with me:**

1. Browser console errors (F12 → Console tab, screenshot)
2. Network request details (F12 → Network tab, click on login request, screenshot)
3. Server terminal output when you start it
