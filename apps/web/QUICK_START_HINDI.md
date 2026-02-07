# 🚀 FinComply - 5 Minute Quick Start

**Ya MongoDB set ho, test users ready ho, aur site dekh sakte ho!**

---

## 🎯 3 Simple Steps

### Step 1️⃣: MongoDB Start Karo

**Windows Users:**
```bash
# Agar chocolatey hai:
mongod

# Ya directly MongoDB installer se start karo
```

**Mac Users:**
```bash
brew services start mongodb-community
```

**Linux Users:**
```bash
sudo systemctl start mongod
```

**Ya MongoDB Atlas use karo (Cloud):**
- https://www.mongodb.com/cloud/atlas
- Free cluster banao
- Connection string copy karo
- `.env` mein paste karo

---

### Step 2️⃣: Setup Karo

Terminal kholo aur ye command chalao:

```bash
npx tsx scripts/full-setup.ts
```

**Ye kya karega:**
✅ MongoDB indexes create karega
✅ 3 test users add karega
✅ Everything ready karega

**Output aise hoga:**
```
✅ Connected to MongoDB
📝 Creating test users...
✅ Created: admin@fincomplify.com
✅ Created: test@fincomplify.com
✅ Created: user@example.com

🎉 SETUP COMPLETE!

📋 Test Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@fincomplify.com
Password: admin123
─────────────────────────────────
Email: test@fincomplify.com
Password: test123
─────────────────────────────────
Email: user@example.com
Password: password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 3️⃣: Site Dekho

```bash
pnpm dev
```

Browser mein open karo:
```
http://localhost:3000
```

**Login karo:**
- Email: `admin@fincomplify.com`
- Password: `admin123`

✅ **Done! Site dekh raha hoga!**

---

## 🧪 Test Credentials Ready

```
👤 Admin User
   Email: admin@fincomplify.com
   Password: admin123

👤 Test User
   Email: test@fincomplify.com
   Password: test123

👤 Example User
   Email: user@example.com
   Password: password123
```

---

## 📋 Kya Hone Wala Hai Login Ke Baad

1. ✅ Dashboard dikh jayega
2. ✅ Personal threads bana sakte ho
3. ✅ Community threads dekh sakte ho
4. ✅ Messages send kar sakte ho
5. ✅ Profile edit kar sakte ho
6. ✅ Logout kar sakte ho

---

## 🆘 Agar Kuch Problem Ho

### "Cannot connect to MongoDB"
```bash
# Check karo MongoDB chalti hai ya nahi:
# Windows:
tasklist | findstr mongod

# Mac/Linux:
ps aux | grep mongod
```

### "MONGODB_URI not found"
- Check `.env` file mein `MONGODB_URI` set hai
- Agar local hai: `mongodb://localhost:27017/fincomplify`
- Ya dekho `.env` file properly save hua

### "npm packages missing"
```bash
pnpm install
# ya
npm install
```

---

## 🎮 Ab Kya Kar Sakte Ho

✅ **Login karke:**
- [ ] Dashboard dekh sakte ho
- [ ] Personal thread bana sakte ho
- [ ] Message send kar sakte ho
- [ ] Community threads dekh sakte ho
- [ ] Profile update kar sakte ho
- [ ] Logout kar sakte ho

---

## 📱 Features Test Karo

### 1. Create Personal Thread
```
Dashboard → New Thread → Mode: Personal
Title: "Insider Trading Query"
Message: "What are the regulations?"
```

### 2. Create Community Thread
```
Dashboard → New Thread → Mode: Community
Title: "SEBI Compliance"
Message: "How to comply?"
```

### 3. Send Message to AI
```
Existing thread mein:
Type: "Tell me about KYC requirements"
Click Send
```

### 4. Update Profile
```
Settings → Profile
Company Status: Listed
Sector: Finance
Size: Large
```

---

## 🔑 Important Commands

```bash
# Full setup (indexes + test users)
npx tsx scripts/full-setup.ts

# Sirf indexes create karo
npx tsx scripts/setup-mongodb.ts

# Sirf test users add karo
npx tsx scripts/create-test-users.ts

# Site start karo
pnpm dev

# Production build
pnpm build
pnpm start
```

---

## 📊 Database Check (Optional)

MongoDB Compass download karo:
https://www.mongodb.com/products/compass

Phir local MongoDB se connect karo:
```
mongodb://localhost:27017
```

Ab dekh sakta hai:
- Users collection
- Profiles collection
- Threads collection
- Messages collection

---

## 🎉 Next Steps

1. ✅ MongoDB setup
2. ✅ Test credentials ready
3. ⏳ Login karke site dekho
4. ⏳ Features test karo
5. ⏳ Jab comfortable ho, aage wale features add karo

---

**Bas itna hi!** 3 commands, 5 minutes, site ready!

Happy testing! 🚀
