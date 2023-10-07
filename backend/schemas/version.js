const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
    },
    content: String,
    comment: [String],
    user: String,
    timestamp: Date,
    description: String,
});

module.exports = mongoose.model("Version", versionSchema);
