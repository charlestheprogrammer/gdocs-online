const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Version",
    },
    content: String,
    user: String,
    timestamp: Date,
});

module.exports = mongoose.model("Comment", commentSchema);
