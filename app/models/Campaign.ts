import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  image_url: { type: String }, // Optional image for the notification
  type: {
    type: String,
    required: true
  },
  audience: { type: String, default: 'All' },
  filterParams: { type: mongoose.Schema.Types.Mixed }, // Store raw JSON filters to use in worker
  targetScreen: { type: String }, // Optional since Flutter app handles it based on type
  status: {
    type: String,
    default: 'Draft'
  },
  scheduledAt: { type: Date },
  metrics: {
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);