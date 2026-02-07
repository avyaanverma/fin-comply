#!/bin/bash
# 🚀 FinComply Quick Commands
# Copy-paste ye commands directly! 

# ================================================================
# STEP 1: MongoDB Start Karo
# ================================================================

# Windows (PowerShell as Admin):
mongod

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Or use MongoDB Atlas (Cloud):
# https://www.mongodb.com/cloud/atlas


# ================================================================
# STEP 2: Install Dependencies (if not done)
# ================================================================

pnpm install
# or
npm install


# ================================================================
# STEP 3: Setup Database + Test Users (ALL IN ONE)
# ================================================================

npx tsx scripts/full-setup.ts

# Agar ye nahi chalti toh separately:
npx tsx scripts/setup-mongodb.ts      # Indexes only
npx tsx scripts/create-test-users.ts  # Test users only


# ================================================================
# STEP 4: Start Development Server
# ================================================================

pnpm dev
# or
npm run dev


# ================================================================
# STEP 5: Open in Browser
# ================================================================

# http://localhost:3000


# ================================================================
# TEST CREDENTIALS (from setup output)
# ================================================================

# User 1:
# Email: admin@fincomplify.com
# Password: admin123

# User 2:
# Email: test@fincomplify.com
# Password: test123

# User 3:
# Email: user@example.com
# Password: password123


# ================================================================
# OPTIONAL: Production Build
# ================================================================

pnpm build
pnpm start


# ================================================================
# OPTIONAL: MongoDB Compass (Visual Database)
# ================================================================

# Download: https://www.mongodb.com/products/compass
# Connect to: mongodb://localhost:27017
# Then view collections: users, profiles, threads, messages


# ================================================================
# TROUBLESHOOTING
# ================================================================

# Check MongoDB running:
# Windows:
tasklist | findstr mongod

# Mac/Linux:
ps aux | grep mongod


# Clear everything and restart:
# 1. Stop mongod (Ctrl+C)
# 2. Delete .env aur retry
# 3. npm install
# 4. mongod
# 5. npx tsx scripts/full-setup.ts
# 6. pnpm dev


# ================================================================
# ALL IN ONE COMMAND (Recommended for first time)
# ================================================================

# First make sure mongod is running, then:
pnpm install && npx tsx scripts/full-setup.ts && pnpm dev

# Done! Open http://localhost:3000 aur login karo!
