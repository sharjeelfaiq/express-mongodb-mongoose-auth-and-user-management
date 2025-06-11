import mongoose from "mongoose";

const { Schema } = mongoose;

const OtpSchema = new Schema({
  otpHash: {
    type: String,
    required: [true, "OTP hash is required"],
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
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

OtpSchema.index({ userId: 1, expiresAt: 1 });

OtpSchema.pre("save", function (next) {
  if (this.expiresAt <= this.createdAt) {
    next(new Error("Expiry date must be in the future"));
  }
  next();
});

export const OtpModel = mongoose.model("Otp", OtpSchema);
