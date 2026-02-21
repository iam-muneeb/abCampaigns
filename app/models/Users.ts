// app/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, immutable: true },
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

export default (mongoose.models.User as mongoose.Model<any>) || mongoose.model("User", UserSchema);