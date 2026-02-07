# Architecture Diagram - FinComply MongoDB

```
┌─────────────────────────────────────────────────────────────────┐
│                        🌐 BROWSER (Frontend)                     │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Login Page   │  │ Dashboard    │  │  Settings    │           │
│  │              │  │              │  │              │           │
│  │ Email/Pass   │  │ Threads      │  │ Profile Edit │           │
│  └──────┬───────┘  │ Messages     │  └──────────────┘           │
│         │          └──────────────┘                              │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          │ HTTP Requests
          │ (credentials: 'include' for cookies)
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              🖥️  NEXT.JS SERVER (Node.js Backend)               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes                                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Authentication Middleware                          │  │  │
│  │  │ - JWT token verification                           │  │  │
│  │  │ - Session validation                               │  │  │
│  │  │ - Cookie check                                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                     ▲                                      │  │
│  │  ┌──────────┬────────┴────────┬──────────┐              │  │
│  │  │          │                 │          │              │  │
│  │  ▼          ▼                 ▼          ▼              │  │
│  │ ┌────┐  ┌────────┐      ┌────────┐  ┌────────┐         │  │
│  │ │Auth│  │Threads │      │Messages│  │Profile │         │  │
│  │ │ API│  │  API   │      │  API   │  │  API   │         │  │
│  │ └────┘  └────────┘      └────────┘  └────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────┴──────────────────────────────────┐   │
│  │         Mongoose (ORM)                                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Schemas:                                        │   │   │
│  │  │ - User (email, password hash, name)            │   │   │
│  │  │ - Profile (company info)                       │   │   │
│  │  │ - Thread (title, mode)                         │   │   │
│  │  │ - Message (content, citations)                 │   │   │
│  │  │ - CommunityDoubt (questions)                   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          │
          │ Mongoose Connection
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🗄️  MONGODB (Database)                         │
│                                                                   │
│  Database: fincomplify                                          │
│  ├─ Collections                                                  │
│  │  ├─ users          (id, email, password_hash, name)         │
│  │  ├─ profiles       (userId, companyStatus, sector)          │
│  │  ├─ threads        (userId, title, mode, timestamps)        │
│  │  ├─ messages       (threadId, userId, content, citations)   │
│  │  └─ communityDoubts (threadId, userId, question)            │
│  │                                                               │
│  └─ Indexes (for performance)                                   │
│     ├─ users: email (unique)                                    │
│     ├─ profiles: userId (unique)                               │
│     ├─ threads: userId+mode, mode                              │
│     ├─ messages: threadId, userId, createdAt                   │
│     └─ communityDoubts: threadId, userId                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Login Example

```
User Types Email/Password
        │
        ▼
POST /api/auth/login
        │
        ├─ Validate input
        │
        ├─ Find user in MongoDB
        │
        ├─ Compare password (bcryptjs)
        │
        ├─ Generate JWT token
        │
        ├─ Set HTTP-only cookie
        │
        ▼
Return JWT + Redirect to /dashboard
        │
        ▼
Browser stores cookie automatically
        │
        ▼
All future requests include cookie
        │
        ├─ Middleware verifies JWT
        │
        ├─ Extract user info
        │
        ▼
Allow request or redirect to login
```

---

## 🛡️ Security Flow

```
                    HTTP-Only Cookie
                    (Secure in prod)
                           │
Request ──────────────────►│
                           │
                    Middleware
                    JWT Verification
                           │
                    ┌──────┴─────────┐
                    │                │
                  Valid           Invalid
                    │                │
                    ▼                ▼
             Allow Request    Redirect Login
             Return Data      Return 401
```

---

## 📦 Package Dependencies

```
Frontend Layer:
├─ React 19
├─ Next.js 16
├─ Zustand (state management)
├─ React Hook Form
├─ Zod (validation)
└─ UI Components (Radix UI)

Backend Layer:
├─ Mongoose 8 (MongoDB ODM)
├─ jsonwebtoken (JWT)
├─ bcryptjs (password hashing)
├─ nodemailer (email ready)
└─ Next.js API Routes

Database Layer:
└─ MongoDB (self-hosted or Atlas)
```

---

## 🚀 Data Persistence

```
User Signs Up
    │
    ├─ Validate data
    │
    ├─ Hash password (bcryptjs)
    │
    ├─ Save to MongoDB
    │      ├─ Create User document
    │      └─ Create Profile document
    │
    ├─ Generate JWT
    │
    ├─ Set Cookie
    │
    ▼
User Logged In & Data Persisted ✅
```

---

## 🎯 Test User Flow

```
Start Application
    │
    ▼
Run: npx tsx scripts/full-setup.ts
    │
    ├─ Create MongoDB Indexes
    │
    ├─ Create 3 Test Users:
    │  ├─ admin@fincomplify.com / admin123
    │  ├─ test@fincomplify.com / test123
    │  └─ user@example.com / password123
    │
    ▼
Ready to Login ✅
```

---

## 📊 Request/Response Example

### Login Request
```json
POST /api/auth/login

{
  "email": "admin@fincomplify.com",
  "password": "admin123"
}
```

### Login Response
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@fincomplify.com",
    "name": "Admin User"
  }
}

Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; Path=/
```

### Protected Request (with cookie)
```
GET /api/user/profile
Cookie: auth_token=eyJhbGciOiJIUzI1NiIs...
```

### Protected Response
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@fincomplify.com",
    "name": "Admin User"
  },
  "profile": {
    "userId": "507f1f77bcf86cd799439011",
    "companyStatus": "listed",
    "industrySector": "Finance",
    "companySize": "large"
  }
}
```

---

This is your complete stack! 🚀
