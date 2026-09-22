import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Single-admin login (gaurdrail.md §6/§9) — one document, created by
// scripts/seed-admin.ts, never via a public signup route.
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type AdminUser = InferSchemaType<typeof adminUserSchema>;

export default (models.AdminUser as Model<AdminUser>) ?? model<AdminUser>("AdminUser", adminUserSchema);
