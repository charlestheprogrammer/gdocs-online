import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SaveSchema = new Schema({
  content: String,
  authors: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now},
  document : { type: Schema.Types.ObjectId, ref: "Document"}
  
});

export default mongoose.model("Save", SaveSchema);
