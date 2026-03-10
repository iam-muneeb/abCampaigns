// app/models/AudienceSnapshot.ts
import mongoose from "mongoose";

const AudienceSnapshotSchema = new mongoose.Schema({
    label: { type: String, required: true },
    // The raw filter params stored as an object — enough to reconstruct the API call
    filters: {
        order: { type: String, default: "" },
        appVersion: { type: String, default: "" },
        itemtype: { type: String, default: "" },
        weartype: { type: String, default: "" },
        category: { type: String, default: "" },
        style: { type: String, default: "" },
        type: { type: String, default: "" },
        os: { type: String, default: "" },
        country: { type: String, default: "" },
    },
    // Human-readable filter summary stored for display
    filterLabels: [{ key: String, value: String }],
    // API query string — the canonical reference to reproduce the user set
    apiQuery: { type: String, default: "" },
    // Count at time of snapshot
    userCount: { type: Number, required: true },
    // Creator
    createdBy: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, required: true },
    },
}, { timestamps: true });

export default (mongoose.models.AudienceSnapshot as mongoose.Model<any>)
    || mongoose.model("AudienceSnapshot", AudienceSnapshotSchema);
