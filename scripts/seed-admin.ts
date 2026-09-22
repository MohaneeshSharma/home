/**
 * One-off local script: creates the single AdminUser document.
 * Run with: npm run seed:admin
 *
 * Prompts interactively rather than taking the password as a CLI arg or
 * hardcoding it in the script (gaurdrail.md §6 — never store/pass secrets
 * in plaintext where they'd land in shell history or source).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

// A standalone tsx script does NOT get Next.js's automatic .env.local
// loading — that only happens inside `next dev`/`next build`. Load it
// explicitly, before anything below reads process.env.MONGODB_URI.
loadEnv({ path: resolve(process.cwd(), ".env.local") });

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/db";
import AdminUserModel from "../lib/models/AdminUser";
import mongoose from "mongoose";

/**
 * Reads two answers from stdin via a single async-iterator pass over the
 * readline interface, instead of two chained `rl.question()` calls. Two
 * sequential `.question()` calls drop the second answer on Windows when
 * stdin is piped/non-TTY (a real Node readline quirk, reproduced running
 * this script via some Windows shells) — iterating `rl` directly with
 * `for await` does not have that failure mode.
 */
async function promptTwo(firstPrompt: string, secondPrompt: string): Promise<[string, string]> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answers: string[] = [];

  stdout.write(firstPrompt);
  for await (const line of rl) {
    answers.push(line);
    if (answers.length === 1) {
      stdout.write(secondPrompt);
    } else {
      break;
    }
  }
  rl.close();

  return [answers[0] ?? "", answers[1] ?? ""];
}

async function main() {
  const [emailRaw, password] = await promptTwo("Admin email: ", "Admin password: ");
  const email = emailRaw.trim().toLowerCase();

  if (!email || !password || password.length < 8) {
    console.error("Email and an 8+ character password are required.");
    process.exit(1);
  }

  await connectToDatabase();

  const existing = await AdminUserModel.findOne({ email });
  if (existing) {
    console.error(`An admin with email ${email} already exists.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUserModel.create({ email, passwordHash });

  console.log(`Admin user ${email} created.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
