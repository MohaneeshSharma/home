import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const certificateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, default: null },
    pdfUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export type Certificate = InferSchemaType<typeof certificateSchema>;

export default (models.Certificate as Model<Certificate>) ?? model<Certificate>("Certificate", certificateSchema);
