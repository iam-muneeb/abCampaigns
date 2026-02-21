// app/models/CampaignType.ts
import mongoose from "mongoose";

const CampaignTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { timestamps: true });

export default (mongoose.models.CampaignType as mongoose.Model<any>) || mongoose.model("CampaignType", CampaignTypeSchema);
