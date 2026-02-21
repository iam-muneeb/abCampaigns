import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image_url: { type: String }, // Optional image for the notification
  type: { 
    type: String, 
    enum: ['App Update', 'Coupon Code', 'Deals', 'Events', 'New Articles', 'New Brand', 'Material', 'Category', 'New Features'],
    required: true
  },
  audience: { type: String, default: 'All' }, 
  targetScreen: { type: String, required: true }, // The Flutter screen to open
  status: { 
    type: String, 
    enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'], 
    default: 'Draft' 
  },
  scheduledAt: { type: Date },
  metrics: {
    delivered: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);