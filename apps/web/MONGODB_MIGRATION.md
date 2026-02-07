# MongoDB Migration Guide for FinComply

## Overview
This guide walks through the migration from Supabase to MongoDB for the FinComply project.

## Changes Made

### 1. **Dependencies Updated** (`package.json`)
- ❌ Removed: `@supabase/ssr`, `@supabase/supabase-js`
- ✅ Added: `mongoose`, `bcryptjs`, `jsonwebtoken`, `nodemailer`

### 2. **Database Connection** (`lib/db/mongodb.ts`)
- Created MongoDB connection utility with connection pooling
- Implements singleton pattern for managing database connections
- Auto-reconnection handling for Node environments

### 3. **Database Models** (`lib/db/models.ts`)
Created Mongoose schemas for:
- **User** - Authentication and user info
  - Email (unique), password (hashed), name, emailVerified, verificationToken
- **Profile** - User profile information
  - userId (ref to User), companyStatus, industrySector, companySize
- **Thread** - Chat/Discussion threads
  - userId, title, mode ('personal'|'community'), timestamps
- **Message** - Messages in threads
  - threadId, userId, senderType ('user'|'ai'), content, citations
- **CommunityDoubt** - Community questions
  - threadId, userId, question, timestamp

### 4. **Authentication System** (`lib/auth/`)
- **tokens.ts** - JWT token generation and verification
  - `generateToken()` - Creates 30-day auth tokens
  - `verifyToken()` - Validates and decodes tokens
  - `generateVerificationToken()` - For email verification (24h)
  
- **session.ts** - Server-side session management
  - `getSession()` - Retrieves current user from cookies
  - `setSessionCookie()` - Sets secure HTTP-only auth cookie
  - `clearSessionCookie()` - Logout functionality
  - `isAuthenticated()` - Quick auth check

### 5. **API Routes** (`app/api/auth/`)
- **signup** (`/api/auth/signup`) - Register new user
  - Validates email uniqueness
  - Hashes password automatically
  - Creates user and profile
  - Returns JWT token
  
- **login** (`/api/auth/login`) - Authenticate user
  - Validates credentials
  - Compares hashed passwords
  - Returns JWT token
  
- **logout** (`/api/auth/logout`) - Clear session
  - Removes auth cookie
  
- **session** (`/api/auth/session`) - Check auth status
  - Returns current user info

### 6. **Chat API Update** (`app/api/chat/route.ts`)
- Now saves messages to MongoDB
- Persists both user and AI messages
- Associates messages with threads and users
- Maintains message history

### 7. **Frontend Pages Updated**
- **Login Page** (`app/auth/login/page.tsx`) - Uses `/api/auth/login`
- **Signup Page** (`app/auth/signup/page.tsx`) - Uses `/api/auth/signup`
- Removed OAuth dependency on Supabase

### 8. **Middleware** (`middleware.ts`, `lib/auth/middleware.ts`)
- JWT-based authentication protection
- Automatic redirect to login for unauthenticated users
- Token validation on each request

## Setup Instructions

### 1. **Install Dependencies**
```bash
pnpm install
```

### 2. **Set Up Environment Variables** (`.env`)
```env
# MongoDB Connection
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/fincomplify"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-key-min-32-characters"

# Node Environment
NODE_ENV="development"
```

**Getting MongoDB URI:**
- **MongoDB Atlas** (Recommended): 
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create free cluster
  3. Get connection string
  
- **Local MongoDB**:
  ```
  mongodb://localhost:27017/fincomplify
  ```

### 3. **Generate Strong JWT Secret**
```bash
# Run in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. **Initialize Database**
```bash
# Run the setup script to create indexes
npx ts-node scripts/setup-mongodb.ts
```

### 5. **Start Development Server**
```bash
pnpm dev
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  emailVerified: Boolean,
  verificationToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  companyStatus: "listed" | "unlisted",
  industrySector: String,
  companySize: "small" | "medium" | "large",
  createdAt: Date,
  updatedAt: Date
}
```

### Threads Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  mode: "personal" | "community",
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  threadId: ObjectId (ref: Thread),
  userId: ObjectId (ref: User),
  senderType: "user" | "ai",
  content: String,
  citations: [
    {
      title: String,
      source: String
    }
  ],
  createdAt: Date
}
```

### CommunityDoubts Collection
```javascript
{
  _id: ObjectId,
  threadId: ObjectId (ref: Thread),
  userId: ObjectId (ref: User),
  question: String,
  createdAt: Date
}
```

## API Authentication

All protected routes use JWT tokens in HTTP-only cookies. The authentication flow:

1. **Signup** → Creates user → Returns JWT
2. **Login** → Validates credentials → Returns JWT
3. **Protected Routes** → Verify JWT from cookies
4. **Logout** → Clear cookie

### Example Protected API Call:
```typescript
const response = await fetch('/api/protected-route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ data: 'value' }),
  credentials: 'include' // Important: send cookies
})
```

## Migration from Supabase Data

If you have existing Supabase data, use this migration script:

```bash
# Export Supabase data as JSON, then import to MongoDB
# Example using mongoimport:
mongoimport --uri "mongodb+srv://..." --collection users --file users.json
```

## Key Differences from Supabase

| Feature | Supabase | MongoDB |
|---------|----------|---------|
| Auth | Built-in (Postgres) | JWT-based |
| Sessions | Server managed | Cookie-based JWT |
| ORM | PostgREST API | Mongoose |
| Passwords | Supabase handles | bcryptjs |
| Row Level Security | Built-in RLS | Logic in API routes |
| Scalability | Postgres limits | Horizontal scaling |
| Cost | Free tier limited | Free tier generous |

## Common Tasks

### Reset Database
```bash
# Connect to MongoDB and run:
db.dropDatabase()
```

### View Data
```bash
# Install MongoDB Compass or use CLI
mongosh "your-mongodb-uri"
db.users.find()
db.threads.find()
db.messages.find()
```

### Add User Manually
```bash
const user = await User.create({
  email: 'test@example.com',
  password: 'password123', // Will be hashed automatically
  name: 'Test User',
  emailVerified: true
})
```

## Troubleshooting

### Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas firewall/network access
- Ensure connection string has correct username/password

### Authentication Issues
- Check `JWT_SECRET` is set and consistent
- Verify cookies are being sent (use `credentials: 'include'`)
- Check browser dev tools → Application → Cookies

### Database Issues
- Ensure indexes are created: `npx ts-node scripts/setup-mongodb.ts`
- Check collection names match schema
- Verify ObjectId references are correct

## Next Steps

1. ✅ Set up MongoDB connection
2. ✅ Configure environment variables
3. ✅ Test signup/login flows
4. ✅ Migrate existing data (if any)
5. ⏳ Set up email verification (optional)
6. ⏳ Implement password reset (optional)
7. ⏳ Add OAuth (optional, currently disabled)

## Support

For MongoDB documentation: https://docs.mongodb.com/
For Mongoose: https://mongoosejs.com/docs/
For JWT: https://jwt.io/

---

**Migration completed! Your app is now running on MongoDB instead of Supabase.**
