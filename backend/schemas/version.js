const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
    },
    content: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    timestamp: Date,
    description: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Reference to comments
});

module.exports = mongoose.model("Version", versionSchema);
