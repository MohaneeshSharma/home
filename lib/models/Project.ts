import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const PROJECT_CATEGORIES = ["ui_ux", "graphic_design", "video_editing"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: String, enum: PROJECT_CATEGORIES, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: null },
    coverImageUrl: { type: String, required: true },
    galleryImageUrls: { type: [String], default: [] },
    videoEmbedUrl: { type: String, default: null },
    tags: { type: [String], default: [] },
    externalLink: { type: String, default: null },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Project = InferSchemaType<typeof projectSchema>;

export default (models.Project as Model<Project>) ?? model<Project>("Project", projectSchema);
