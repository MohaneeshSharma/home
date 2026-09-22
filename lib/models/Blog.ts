import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    summary: { type: String, required: true },
    // Tiptap JSON document, sanitized server-side before save (spec.md §6,
    // gaurdrail.md §6) — never rendered without passing through lib/sanitize.ts.
    content: { type: Schema.Types.Mixed, required: true },
    coverImageUrl: { type: String, default: null },
    author: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
    source: { type: String, enum: ["native", "medium", "linkedin"], default: "native" },
    sourceUrl: { type: String, default: null },
    views: { type: Number, default: 0 },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
  },
  { timestamps: true }
);

export type Blog = InferSchemaType<typeof blogSchema>;

export default (models.Blog as Model<Blog>) ?? model<Blog>("Blog", blogSchema);
