# FinComply - MongoDB Setup & Integration Guide

## 🎯 What Changed?

Your FinComply project has been successfully migrated from **Supabase** to **MongoDB**. This gives you more control, better reliability for your use case, and is something you're already familiar with.

## 📋 Quick Start

### Step 1: Install Dependencies
```bash
pnpm install
# or
npm install
```

### Step 2: Configure MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free shared cluster
4. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/fincomplify`)

#### Option B: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/fincomplify`

### Step 3: Set Environment Variables

Edit or create `.env` file:
```env
# MongoDB Connection String
MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fincomplify"

# JWT Secret (generate a strong random string - at least 32 characters)
JWT_SECRET="your-super-secret-key-change-this-in-production-12345678901234567890"

# Node Environment
NODE_ENV="development"
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Initialize Database

Run the setup script to create indexes:
```bash
npx tsx scripts/setup-mongodb.ts
```

Or using Node directly (if MongoDB connection is already set):
```bash
node scripts/setup-mongodb.ts
```

### Step 5: Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` and test signup/login!

## 🏗️ Project Structure

```
lib/
├── db/
│   ├── mongodb.ts       # MongoDB connection manager
│   └── models.ts        # Mongoose schemas (User, Profile, Thread, etc.)
├── auth/
│   ├── tokens.ts        # JWT token management
│   ├── session.ts       # Server-side session handling
│   └── middleware.ts    # Auth middleware for routes
└── supabase/
    ├── client.ts        # Updated to work with MongoDB
    └── server.ts        # Server utilities for MongoDB

app/
├── api/
│   ├── auth/
│   │   ├── signup/route.ts      # Register new user
│   │   ├── login/route.ts       # Authenticate user
│   │   ├── logout/route.ts      # Clear session
│   │   └── session/route.ts     # Check auth status
│   ├── chat/route.ts            # Chat API (saves to MongoDB)
│   ├── threads/route.ts         # Fetch/create threads
│   ├── threads/[threadId]/route.ts  # Get thread messages
│   └── user/profile/route.ts    # User profile management
├── auth/
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   └── ...
└── dashboard/
    └── page.tsx                 # Main app page
```

## 🔐 Authentication Flow

### Signup
```
User submits email + password
↓
POST /api/auth/signup
↓
Create user in MongoDB
Create profile
Hash password with bcrypt
Generate JWT token
Set secure HTTP-only cookie
↓
Redirect to /dashboard
```

### Login
```
User submits email + password
↓
POST /api/auth/login
↓
Find user in MongoDB
Compare passwords with bcrypt
Generate JWT token
Set secure HTTP-only cookie
↓
Redirect to /dashboard
```

### Protected Routes
```
User makes API request
↓
Middleware checks for auth_token cookie
↓
Verify JWT signature
↓
If valid, extract user info
If invalid, redirect to login
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",          // unique
  password: "hashed_password",        // bcrypt hashed
  name: "John Doe",
  emailVerified: true,
  verificationToken: "optional_token",
  createdAt: 2024-02-05T10:00:00Z,
  updatedAt: 2024-02-05T10:00:00Z
}
```

### Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                   // references Users
  companyStatus: "listed",            // or "unlisted"
  industrySector: "Finance",
  companySize: "large",               // or "small", "medium"
  createdAt: 2024-02-05T10:00:00Z,
  updatedAt: 2024-02-05T10:00:00Z
}
```

### Threads Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                   // references Users
  title: "Insider Trading Query",
  mode: "personal",                   // or "community"
  createdAt: 2024-02-05T10:00:00Z,
  updatedAt: 2024-02-05T10:00:00Z
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  threadId: ObjectId,                 // references Threads
  userId: ObjectId,                   // references Users
  senderType: "user",                 // or "ai"
  content: "What about insider trading?",
  citations: [
    {
      title: "SEBI Official Website",
      source: "SEBI"
    }
  ],
  createdAt: 2024-02-05T10:00:00Z
}
```

### CommunityDoubts Collection
```javascript
{
  _id: ObjectId,
  threadId: ObjectId,                 // references Threads
  userId: ObjectId,                   // references Users
  question: "Is this compliant?",
  createdAt: 2024-02-05T10:00:00Z
}
```

## 🛠️ Available APIs

### Authentication
- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user
- **GET** `/api/auth/session` - Check authentication status

### User Profile
- **GET** `/api/user/profile` - Get current user profile
- **PUT** `/api/user/profile` - Update user profile

### Threads
- **GET** `/api/threads?mode=personal` - Get user's personal threads
- **GET** `/api/threads?mode=community` - Get community threads
- **POST** `/api/threads` - Create new thread

### Messages
- **GET** `/api/threads/[threadId]` - Get messages in a thread
- **POST** `/api/chat` - Send message to thread

## 🔄 Migration from Supabase

If you had data in Supabase:

1. **Export from Supabase:**
   - Use pgAdmin or export tools to get CSV/JSON

2. **Transform data:**
   ```javascript
   // Map Supabase UUIDs to MongoDB ObjectIds
   // Map Supabase auth users to MongoDB User documents
   ```

3. **Import to MongoDB:**
   ```bash
   mongoimport --uri "mongodb+srv://..." --collection users --file users.json
   ```

## 🧪 Testing Authentication

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Check Session
```bash
curl -X GET http://localhost:3000/api/auth/session
```

## 🐛 Troubleshooting

### Issue: "MONGODB_URI is not defined"
**Solution:** Check `.env` file has correct variable name and value

### Issue: "Connection refused" error
**Solution:** 
- Verify MongoDB is running (or Atlas cluster is active)
- Check connection string is correct
- For Atlas, ensure your IP is whitelisted

### Issue: "JWT_SECRET is not defined"
**Solution:** Add `JWT_SECRET` to `.env` with at least 32 characters

### Issue: "Auth token validation failed"
**Solution:**
- Clear browser cookies (Application → Cookies)
- Regenerate JWT_SECRET and re-login
- Check cookie is being sent with requests (use `credentials: 'include'`)

### Issue: Can't connect to local MongoDB
```bash
# Start MongoDB service
# macOS:
brew services start mongodb-community

# Windows:
# Start from Services panel or run mongod.exe

# Linux:
sudo systemctl start mongod
```

## 📈 Performance Tips

1. **Create indexes** - Already done by setup script
2. **Use lean queries** for read-only operations
3. **Paginate results** for large datasets
4. **Cache frequently accessed data** in Redis (optional)

## 🔒 Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens signed securely
- [x] Cookies are HTTP-only
- [x] Cookies are secure (in production)
- [x] CSRF protection ready (add middleware)
- [ ] Email verification (optional feature to add)
- [ ] Rate limiting (optional feature to add)
- [ ] Password reset flow (optional feature to add)

## 📚 Useful Commands

```bash
# Reset database (careful!)
npx tsx -e "
  import { connectDB } from './lib/db/mongodb';
  await connectDB();
  // Run drop commands here
"

# View MongoDB data with Compass
# Download: https://www.mongodb.com/products/compass

# Check all indexes
db.users.getIndexes()
db.threads.getIndexes()

# Find user by email
db.users.findOne({ email: "user@example.com" })

# Count documents
db.threads.countDocuments({ mode: "community" })
```

## 🚀 Next Steps

1. ✅ Set up MongoDB
2. ✅ Configure `.env`
3. ✅ Run setup script
4. ✅ Test signup/login
5. ⏳ Add email verification (optional)
6. ⏳ Add password reset flow (optional)
7. ⏳ Set up rate limiting (optional)
8. ⏳ Deploy to production

## 📖 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

**Happy coding! Your MongoDB setup is complete.** 🎉
