const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  title: String,
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;