const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SaveSchema = new Schema({
  content: String,
  date: { type: Date, default: Date.now},
  document : { type: Schema.Types.ObjectId, ref: "Document"}
  
});

const Save = mongoose.model("Save", SaveSchema);

module.exports = Save;