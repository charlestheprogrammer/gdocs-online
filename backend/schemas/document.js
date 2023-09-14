import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  title: String,
  content: String,
});

export default mongoose.model("Document", DocumentSchema);
