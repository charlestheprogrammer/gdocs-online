const express = require("express");
const router = express.Router();
const Version = require("../schemas/version");
const Comment = require("../schemas/comment.js");

// Create a new comment for a version
router.post("/", async (req, res) => {
    try {
        const versionId = req.body.versionId;

        // Check if the version exists
        const version = await Version.findById(versionId);

        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        // Create a new comment
        const comment = new Comment({
            version: versionId,
            content: req.body.content,
            user: req.body.user,
            timestamp: new Date(),
        });

        // Save the comment
        const savedComment = await comment.save();

        // Associate the comment with the version
        version.comments.push(comment._id);
        await version.save();
        res.set("Access-Control-Allow-Origin", "*");
        res.send({
            message: "Version updated and added a new comment",
            comment: savedComment,
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Error creating comment" });
    }
});

module.exports = router;
