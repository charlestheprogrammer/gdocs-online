import mongoose from "mongoose";
import save from "./save";

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  title: String,
});

export default mongoose.model("Document", DocumentSchema);
