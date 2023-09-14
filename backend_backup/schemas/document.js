const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  title: String,
});

module.exports = mongoose.model("Document", DocumentSchema);