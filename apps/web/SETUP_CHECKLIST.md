# ✅ Setup Checklist - Login Tak Pohochne Ke Liye

## Pre-Launch Checklist

- [ ] **MongoDB Installation**
  - [ ] MongoDB installed (local) OR MongoDB Atlas account
  - [ ] MongoDB service running (`mongod` command)
  - [ ] Connection string ready
  
- [ ] **Environment Setup**
  - [ ] `.env` file updated with `MONGODB_URI`
  - [ ] `JWT_SECRET` set (32+ characters)
  - [ ] `NODE_ENV="development"`

- [ ] **Code Setup**
  - [ ] Dependencies installed: `pnpm install`
  - [ ] Database initialized: `npx tsx scripts/full-setup.ts`
  - [ ] Development server starts: `pnpm dev`

- [ ] **Credentials Ready**
  - [ ] Test user 1: `admin@fincomplify.com` / `admin123`
  - [ ] Test user 2: `test@fincomplify.com` / `test123`
  - [ ] Test user 3: `user@example.com` / `password123`

---

## Step-by-Step Setup

### ✅ Step 1: MongoDB Chalu Karo
```bash
mongod
# Ya MongoDB Atlas se connection string use karo
```
**Verification:** Terminal mein ye dikhe:
```
[initandlisten] Listening on 27017
```

### ✅ Step 2: `.env` Check Karo
```env
MONGODB_URI="mongodb://localhost:27017/fincomplify"
JWT_SECRET="fincomply-secret-key-2025-test-super-secret-key-32chars"
NODE_ENV="development"
```

### ✅ Step 3: Dependencies Install Karo
```bash
pnpm install
```

### ✅ Step 4: Database Setup Karo
```bash
npx tsx scripts/full-setup.ts
```
**Expected Output:**
```
✅ Connected to MongoDB
📝 Creating test users...
✅ Created: admin@fincomplify.com
✅ Created: test@fincomplify.com
✅ Created: user@example.com
🎉 SETUP COMPLETE!
```

### ✅ Step 5: Server Start Karo
```bash
pnpm dev
```
**Expected Output:**
```
▲ Next.js 16.0.3
▲ Local: http://localhost:3000
```

### ✅ Step 6: Browser Mein Open Karo
```
http://localhost:3000
```

---

## Login Testing

### ✅ Test 1: Basic Login
- [ ] Go to: `http://localhost:3000/auth/login`
- [ ] Email: `admin@fincomplify.com`
- [ ] Password: `admin123`
- [ ] Click: Login
- [ ] Result: Redirect to dashboard

### ✅ Test 2: Dashboard Access
- [ ] Verify: Dashboard page loads
- [ ] Verify: Your name shows in header
- [ ] Verify: Threads list visible
- [ ] Verify: Create Thread button works

### ✅ Test 3: Features
- [ ] Create personal thread
- [ ] Create community thread
- [ ] Send message to thread
- [ ] View profile
- [ ] Update profile
- [ ] Logout button works

### ✅ Test 4: Re-login
- [ ] After logout, go to login again
- [ ] Same credentials work
- [ ] Dashboard accessible

---

## Database Verification

### ✅ Check MongoDB Collections
```bash
# Terminal mein mongosh chalaao:
mongosh

# Database select karo:
use fincomplify

# Collections dekho:
show collections

# Users dekho:
db.users.find()

# Profiles dekho:
db.profiles.find()

# Threads dekho:
db.threads.find()
```

### ✅ Expected Collections:
```
users            ← 3 test users
profiles         ← 3 profiles
threads          ← (created after testing)
messages         ← (created after testing)
communityDoubts  ← (created after testing)
```

---

## Troubleshooting Checklist

### ❌ "Cannot connect to MongoDB"
- [ ] MongoDB service running?
- [ ] Connection string correct?
- [ ] Port 27017 accessible?

### ❌ "MONGODB_URI not found"
- [ ] `.env` file exists?
- [ ] MONGODB_URI line present?
- [ ] No typos in variable name?

### ❌ "Login not working"
- [ ] Test users created? (check setup output)
- [ ] Password correct? (admin123)
- [ ] MongoDB running?

### ❌ "Port 3000 already in use"
```bash
# Kill process using port 3000:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### ❌ "npm packages missing"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Quick Verification Commands

```bash
# Check MongoDB running:
mongosh --eval "db.adminCommand('ping')"

# Check connections in MongoDB:
mongosh --eval "db.connections.find()"

# Check test users created:
mongosh --eval "use fincomplify; db.users.find()"

# Check JWT_SECRET set:
grep JWT_SECRET .env
```

---

## Files Created for Setup

```
scripts/
├─ setup-mongodb.ts           ✅ Create indexes
├─ create-test-users.ts       ✅ Add test users
└─ full-setup.ts              ✅ Both together

API Routes:
app/api/
├─ auth/
│  ├─ signup/route.ts         ✅ Register
│  ├─ login/route.ts          ✅ Login
│  ├─ logout/route.ts         ✅ Logout
│  └─ session/route.ts        ✅ Check status
├─ threads/route.ts           ✅ Thread ops
├─ threads/[threadId]/route.ts ✅ Messages
├─ user/profile/route.ts      ✅ Profile
└─ chat/route.ts              ✅ Chat

Updated:
.env                           ✅ MongoDB config
middleware.ts                  ✅ Auth middleware
app/auth/login/page.tsx        ✅ Login page
app/auth/signup/page.tsx       ✅ Signup page
```

---

## Success Indicators ✨

- ✅ MongoDB connected
- ✅ Test users created
- ✅ Dev server running
- ✅ Login page accessible
- ✅ Can login with credentials
- ✅ Dashboard loads
- ✅ Can create threads
- ✅ Can send messages
- ✅ Can logout
- ✅ Can login again

---

## Performance Notes

- ✅ First request may be slow (mongoose loading)
- ✅ Indexes created for fast queries
- ✅ JWT tokens cached in cookies
- ✅ No database connection pooling issues

---

## Next After Login Works

1. ✅ Test features
2. ⏳ Customize UI
3. ⏳ Add more test data
4. ⏳ Deploy to production
5. ⏳ Add email verification (optional)
6. ⏳ Add password reset (optional)

---

**🎉 Final Step: Open http://localhost:3000 aur login karo!**

**Email:** `admin@fincomplify.com`  
**Password:** `admin123`

Agar sab kuch working hai, toh setup complete! 🚀
