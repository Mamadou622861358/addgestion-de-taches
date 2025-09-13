const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  priority: {
    type: String,
    enum: ["basse", "moyenne", "haute"],
    default: "moyenne",
  },
  deadline: { type: Date },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // assigné à
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // admin créateur
  history: [
    {
      action: String, // 'création', 'modification', 'changement état', 'suppression'
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now },
      details: String,
    },
  ],
  comments: [
    {
      text: String,
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Task", taskSchema);
