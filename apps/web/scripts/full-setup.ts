#!/usr/bin/env node
/**
 * Complete Setup Script
 * Runs indexes + test users in one go
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runScript(
  scriptPath: string,
  scriptName: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n${"═".repeat(50)}`);
    console.log(`⚙️  Running: ${scriptName}`);
    console.log(`${"═".repeat(50)}\n`);

    const child = spawn("npx", ["tsx", scriptPath], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.error(`\n❌ ${scriptName} failed`);
        resolve(false);
      }
    });

    child.on("error", (err) => {
      console.error(`Error running ${scriptName}:`, err);
      resolve(false);
    });
  });
}

async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   🚀 FinComply MongoDB Complete Setup 🚀              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  // Step 1: Create indexes
  const indexesOk = await runScript(
    path.join(__dirname, "setup-mongodb.ts"),
    "MongoDB Setup (Create Indexes)",
  );

  if (!indexesOk) {
    console.error("\n❌ MongoDB setup failed!");
    process.exit(1);
  }

  // Step 2: Create test users
  const usersOk = await runScript(
    path.join(__dirname, "create-test-users.ts"),
    "Create Test Users",
  );

  if (!usersOk) {
    console.error("\n❌ Test user creation failed!");
    process.exit(1);
  }

  // Success!
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║             ✅ SETUP COMPLETE! ✅                     ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("\n🎯 Next Steps:");
  console.log("   1. Run: pnpm dev");
  console.log("   2. Open: http://localhost:3000");
  console.log("   3. Click: Login");
  console.log("   4. Use test credentials above\n");
}

main().catch(console.error);
