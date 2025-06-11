import mongoose from "mongoose";

const { Schema } = mongoose;

const BlacklistedTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Token expiration date is required"],
      index: { expireAfterSeconds: 0 }, // TTL index: auto-delete after expiry
    },
  },
  {
    versionKey: false,
  }
);

export const BlacklistedToken = mongoose.model(
  "BlacklistedToken",
  BlacklistedTokenSchema
);
