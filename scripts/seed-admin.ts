/**
 * One-off local script: creates the single AdminUser document.
 * Run with: npm run seed:admin
 *
 * Prompts interactively rather than taking the password as a CLI arg or
 * hardcoding it in the script (gaurdrail.md §6 — never store/pass secrets
 * in plaintext where they'd land in shell history or source).
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/db";
import AdminUserModel from "../lib/models/AdminUser";
import mongoose from "mongoose";

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password: ");
  rl.close();

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
