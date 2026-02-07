#!/usr/bin/env node
/**
 * MongoDB Setup Script
 * Creates indexes and initial collections for the FinComply application
 */

import mongoose from "mongoose";
import {
  User,
  Profile,
  Thread,
  Message,
  CommunityDoubt,
} from "../lib/db/models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

async function setupMongoDB() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create indexes
    console.log("📑 Creating indexes...");

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log("✅ User email index created");

    // Profile indexes
    await Profile.collection.createIndex({ userId: 1 }, { unique: true });
    console.log("✅ Profile userId index created");

    // Thread indexes
    await Thread.collection.createIndex({ userId: 1, mode: 1 });
    await Thread.collection.createIndex({ mode: 1 });
    console.log("✅ Thread indexes created");

    // Message indexes
    await Message.collection.createIndex({ threadId: 1 });
    await Message.collection.createIndex({ userId: 1 });
    await Message.collection.createIndex({ threadId: 1, createdAt: -1 });
    console.log("✅ Message indexes created");

    // CommunityDoubt indexes
    await CommunityDoubt.collection.createIndex({ threadId: 1 });
    await CommunityDoubt.collection.createIndex({ userId: 1 });
    console.log("✅ CommunityDoubt indexes created");

    console.log("🎉 MongoDB setup completed successfully!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during MongoDB setup:", error);
    process.exit(1);
  }
}

setupMongoDB();
