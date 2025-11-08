# Quick Start Guide - Demo Credentials

## 🚀 Get Started in 3 Steps

### Step 1: Create Demo Users

Run the seed script to create demo users for all 3 portals:

```bash
cd backend
npm run seed
```

You should see:
```
✅ Created demo users:
   Citizen: citizen@demo.com / demo123
   Staff: staff@demo.com / demo123
   Admin: admin@demo.com / demo123
✅ Created demo complaints
🎉 Seed data created successfully!
```

### Step 2: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Login and Explore

Open your browser: `http://localhost:5173`

## 📝 Demo Credentials

### 🌍 Citizen Portal
- **URL:** `/login`
- **Email:** `citizen@demo.com`
- **Password:** `demo123`
- **Features:** Report issues, view leaderboard, earn eco-points

### 👨‍💼 Staff Portal
- **URL:** `/staff/login`
- **Email:** `staff@demo.com`
- **Password:** `demo123`
- **Features:** View assigned tasks, complete tasks, report issues

### ⚙️ Admin Portal
- **URL:** `/admin/login`
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Features:** Manage complaints, view analytics, manage staff

## 🎯 What You'll See

### Staff Portal Features:
- ✅ **Assigned Tasks Tab** - View and complete tasks
- ✅ **Completed Tasks Tab** - View task history
- ✅ **Report Issue Tab** - Report new issues from field
- ✅ **Schedule Tab** - View schedule and quick actions

### Demo Data Includes:
- 2 Open/Assigned tasks (for Staff Portal)
- 2 Completed tasks (for Staff Portal history)
- Realistic locations and descriptions
- Proper task IDs (#WM001, #WM002, etc.)

## 🔄 Reset Demo Data

To reset and recreate demo data:

```bash
cd backend
npm run seed
```

This will:
- Clear existing demo users
- Create fresh demo users
- Create fresh demo complaints

## ✅ All Features Working

- ✅ Login/Register for all 3 portals
- ✅ Role-based access control
- ✅ Task management (Staff Portal)
- ✅ Complaint management (Admin Portal)
- ✅ Issue reporting (Citizen Portal)
- ✅ Analytics dashboard (Admin Portal)
- ✅ Staff management (Admin Portal)
- ✅ Heatmap visualization (Admin Portal)

## 🎨 Staff Portal Matches Images

The Staff Portal now matches the design images:
- ✅ Team info card with person icon
- ✅ Task cards with proper styling
- ✅ Completed tasks with green left border
- ✅ Assigned tasks with orange left border
- ✅ Proper task IDs (#WM001, #WM002, etc.)
- ✅ Location names (Main Street & 5th Avenue, etc.)
- ✅ Completion times and durations
- ✅ All action buttons (Mark Complete, Add Photo, Navigate)

Enjoy exploring the SmartWaste platform! 🎉

