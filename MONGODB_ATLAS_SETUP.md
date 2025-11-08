# MongoDB Atlas Setup Guide

## Quick Setup Instructions

### 1. Create MongoDB Atlas Account
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up for a free account (M0 cluster is free forever)

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select your preferred cloud provider and region
4. Click "Create"

### 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set user privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### 4. Whitelist Your IP Address
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) OR add your specific IP
4. Click "Confirm"

### 5. Get Your Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 6. Configure Your Backend
1. Create a `.env` file in the `backend/` directory
2. Add your connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/waste?retryWrites=true&w=majority
PORT=4000
JWT_SECRET=your_secret_key_here
```

**Important:** 
- Replace `username` with your database username
- Replace `password` with your database password
- Replace `cluster0.xxxxx` with your actual cluster address
- Add `/waste` before the `?` to specify the database name (or use your preferred name)

### 7. Start Your Backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ API listening on :4000
```

## Troubleshooting

### Connection Timeout
- Check if your IP address is whitelisted in Network Access
- Verify your connection string is correct
- Make sure you replaced `<password>` with your actual password

### Authentication Failed
- Double-check your username and password
- Ensure the database user has proper permissions

### Network Error in Frontend
- Make sure backend is running on port 4000
- Check if `MONGODB_URI` is set correctly in `.env`
- Verify MongoDB Atlas cluster is running (not paused)

## Local MongoDB Alternative

If you prefer to use local MongoDB instead:

1. Install MongoDB locally
2. Start MongoDB service
3. In `backend/.env`, use:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/waste
```

