import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactMethod: { type: String, required: true },
    message: { type: String, required: true },
    inquiryType: {
      type: String,
      enum: ["job_opportunity", "freelance_project", "general"],
      required: true,
    },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
    notes: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Lead = InferSchemaType<typeof leadSchema>;

export default (models.Lead as Model<Lead>) ?? model<Lead>("Lead", leadSchema);
