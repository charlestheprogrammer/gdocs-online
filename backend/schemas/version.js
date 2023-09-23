const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    content: String,
    user: String,
    timestamp: Date,
  });
  
  
  module.exports = mongoose.model("Version", versionSchema);