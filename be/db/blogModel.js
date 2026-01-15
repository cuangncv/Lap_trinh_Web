const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String },
  blog: { type: String },
  date_time: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model.Blogs || mongoose.model("Blogs", blogSchema);
