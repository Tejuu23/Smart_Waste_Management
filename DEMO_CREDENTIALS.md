# Demo Credentials for SmartWaste Platform

## 🎯 Quick Access

After running the seed script, you can use these credentials to access all three portals:

### 📝 Citizen Portal
- **Email:** `citizen@demo.com`
- **Password:** `demo123`
- **Access:** `/login` → Login → `/report` or `/citizen`

### 👨‍💼 Staff Portal
- **Email:** `staff@demo.com`
- **Password:** `demo123`
- **Access:** `/staff/login` → Login → `/staff`

### ⚙️ Admin Portal
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Access:** `/admin/login` → Login → `/dashboard`

## 🚀 How to Create Demo Users

### Step 1: Start MongoDB
Make sure MongoDB is running on your system.

### Step 2: Run Seed Script
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

### Step 3: Access the Portals

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   - Go to `http://localhost:5173`
   - Use the credentials above to login

## 📋 What's Included

### Demo Users:
- ✅ **Citizen User** - Can report issues, view leaderboard, earn eco-points
- ✅ **Staff User** - Can view assigned tasks, complete tasks, report issues
- ✅ **Admin User** - Can manage complaints, view analytics, manage staff

### Demo Data:
- ✅ **4 Demo Complaints:**
  - 2 Open/Assigned tasks (for Staff Portal)
  - 2 Completed tasks (for Staff Portal history)
  - All with realistic locations and descriptions

## 🔄 Re-seed Data

If you want to reset the demo data, just run the seed script again:
```bash
cd backend
npm run seed
```

This will:
- Clear existing demo users
- Create fresh demo users
- Create fresh demo complaints

## 🎨 Features to Test

### Citizen Portal:
- ✅ Report issues with photos
- ✅ View eco-points
- ✅ Check leaderboard
- ✅ Track complaints

### Staff Portal:
- ✅ View assigned tasks
- ✅ Mark tasks as complete
- ✅ View completed tasks history
- ✅ Report new issues from field
- ✅ View schedule and quick actions

### Admin Portal:
- ✅ View all complaints
- ✅ Assign teams to complaints
- ✅ Resolve complaints
- ✅ View analytics
- ✅ Manage staff teams
- ✅ View heatmap

## 🔐 Security Note

These are demo credentials for development/testing only. 
**DO NOT** use these in production!

For production, ensure:
- Strong passwords
- Email verification
- Role-based access control
- Secure authentication

