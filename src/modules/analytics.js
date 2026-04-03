const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["signup", "login", "logout", "verification", "property_view", "property_like", "property_share", "chat_message", "page_view", "search"],
  },
  action: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;