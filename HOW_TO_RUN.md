# How to Run the Smart Waste Management Platform

## ✅ Frontend is Complete!

All frontend features have been implemented and are ready to use.

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** running locally OR MongoDB Atlas account
3. Terminal/PowerShell access

## Step-by-Step Instructions

### 1. Navigate to Project Directory

```bash
cd C:\Users\tejas\OneDrive\Desktop\e08
```

**OR** if you're using the fixed location:

```bash
cd C:\dev\e08
```

### 2. Start MongoDB (if using local MongoDB)

If you have MongoDB installed locally, start it:

```bash
mongod
```

Or use MongoDB Atlas connection string in the `.env` file.

### 3. Start Backend Server

Open **Terminal 1**:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
API listening on :4000
```

The backend will run on: **http://localhost:4000**

### 4. Start Frontend Server

Open **Terminal 2** (new terminal window):

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

The frontend will run on: **http://localhost:5173**

### 5. Access the Application

Open your browser and go to: **http://localhost:5173**

## Available Features

### ✅ Completed Frontend Features:

1. **Home Page** (`/`)
   - Welcome page with navigation
   - User authentication status
   - Eco-points display
   - Quick access cards

2. **User Authentication**
   - Login page (`/login`)
   - Registration page (`/register`)
   - JWT-based authentication
   - Persistent sessions

3. **Report Issues** (`/report`)
   - Submit complaints with title and description
   - Upload images (with preview)
   - Earn 10 eco-points per report
   - Real-time form validation

4. **Leaderboard** (`/leaderboard`)
   - Top contributors display
   - Eco-points ranking
   - Medal system (🥇🥈🥉)
   - Points earning guide

5. **Admin Dashboard** (`/dashboard`)
   - Real-time statistics
   - Open complaints list
   - Bin fill-level alerts
   - Resolve complaints functionality
   - Socket.io real-time updates
   - AI insights section

6. **Real-time Updates**
   - Socket.io integration
   - Live complaint notifications
   - Bin alert notifications
   - Auto-refresh on events

## Testing the Application

### 1. Register a New User

1. Go to http://localhost:5173
2. Click "Login" → "Register"
3. Fill in name, email, password
4. Submit registration

### 2. Login

1. Go to `/login`
2. Enter credentials
3. You'll be redirected to dashboard

### 3. Report an Issue

1. Login first
2. Go to `/report`
3. Fill in title, description
4. Upload an image (optional)
5. Submit - you'll earn 10 eco-points!

### 4. View Leaderboard

1. Go to `/leaderboard`
2. See top contributors
3. Check how to earn more points

### 5. Admin Dashboard

1. Login as admin (or any user)
2. Go to `/dashboard`
3. View complaints
4. Resolve complaints
5. See real-time updates

## API Endpoints

The backend provides these endpoints:

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - List complaints (admin)
- `POST /api/complaints/:id/resolve` - Resolve complaint
- `POST /api/upload/image` - Upload image
- `GET /api/bins` - List bins (admin)
- `POST /api/bins/ping` - IoT bin update

## Troubleshooting

### Backend won't start

- Check if MongoDB is running
- Verify `.env` file exists in `backend/` directory
- Check if port 4000 is available

### Frontend won't start

- Make sure you're in the `frontend/` directory
- Run `npm install` again
- Check if port 5173 is available

### API calls failing

- Ensure backend is running on port 4000
- Check browser console for errors
- Verify CORS settings in backend

### Images not uploading

- Check if `/api/upload/image` endpoint is accessible
- Verify file size (max 5MB)
- Check browser console for errors

## Environment Variables

Create `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/waste
JWT_SECRET=supersecret
CLIENT_URL=http://localhost:5173
```

## Next Steps (Optional Enhancements)

- Add Google Maps integration for geolocation
- Implement TensorFlow.js for waste classification
- Add Dialogflow/OpenAI chatbot
- Set up Cloudinary for production image storage
- Add PWA service worker for offline mode
- Implement route optimization algorithms

## Support

If you encounter any issues:
1. Check the terminal output for errors
2. Check browser console (F12)
3. Verify all dependencies are installed
4. Ensure MongoDB is running

---

**Enjoy your Smart Waste Management Platform! 🚀**

