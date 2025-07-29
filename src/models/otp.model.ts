import mongoose from "mongoose";

const { Schema } = mongoose;

const OTPSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: false,
    immutable: true,
  },

  otpHash: {
    type: String,
    required: [true, "OTP hash is required"],
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: auto-delete after expiry
  },
});

OTPSchema.pre("save", function (next) {
  if (this.expiresAt <= this.createdAt) {
    return next(new Error("Expiry date must be in the future"));
  }
  next();
});

export const OTPModel = mongoose.model("OTP", OTPSchema);
