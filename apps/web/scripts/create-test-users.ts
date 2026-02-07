#!/usr/bin/env node
/**
 * Setup Test Users Script
 * Creates demo credentials for immediate testing
 */

import mongoose from "mongoose";
import { User, Profile } from "../lib/db/models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

async function setupTestUsers() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    // Test User 1
    console.log("\n📝 Creating test users...");

    const testUsers = [
      {
        email: "admin@fincomplify.com",
        password: "admin123",
        name: "Admin User",
      },
      {
        email: "test@fincomplify.com",
        password: "test123",
        name: "Test User",
      },
      {
        email: "user@example.com",
        password: "password123",
        name: "Example User",
      },
    ];

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⏭️  ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user
        const user = new User({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          emailVerified: true,
        });

        await user.save();
        console.log(`✅ Created: ${userData.email}`);

        // Create profile
        const profile = new Profile({
          userId: user._id,
          companyStatus: "listed",
          industrySector: "Finance",
          companySize: "large",
        });

        await profile.save();
        console.log(`   └─ Profile created`);
      } catch (err: any) {
        if (err.code === 11000) {
          console.log(`⏭️  ${userData.email} already exists`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, err.message);
        }
      }
    }

    console.log("\n🎉 Setup Complete!");
    console.log("\n📋 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    testUsers.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log("─────────────────────────────────────");
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setupTestUsers();
