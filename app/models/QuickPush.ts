// app/models/QuickPush.ts
import mongoose from "mongoose";

const QuickPushSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    // Recipient user IDs (for display — tokens are not stored for privacy)
    recipientIds: [{ type: String }],
    // Token count sent
    totalTokens: { type: Number, required: true },
    // Firebase results at send time
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    // Who sent it
    sentBy: {
        id: { type: String },
        name: { type: String },
        role: { type: String },
    },
    // Rolling metrics (updated later via poll or track endpoint)
    metrics: {
        opened: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
    },
}, { timestamps: true });

export default (mongoose.models.QuickPush as mongoose.Model<any>)
    || mongoose.model("QuickPush", QuickPushSchema);
