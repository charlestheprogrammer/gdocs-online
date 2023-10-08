const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
    },
    content: String,
    comment: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    timestamp: Date,
    description: String,
});

module.exports = mongoose.model("Version", versionSchema);
