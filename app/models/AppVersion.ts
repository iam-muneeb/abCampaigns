// app/models/AppVersion.ts
import mongoose from "mongoose";

const AppVersionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    versionCode: { type: String, required: true, unique: true },
    publishDate: { type: Date, required: true },
}, { timestamps: true });

export default (mongoose.models.AppVersion as mongoose.Model<any>) ||
    mongoose.model("AppVersion", AppVersionSchema);
