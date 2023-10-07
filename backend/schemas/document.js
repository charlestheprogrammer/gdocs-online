const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: String,
  versions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
    },
  ],
});

module.exports = mongoose.model("Document", documentSchema);