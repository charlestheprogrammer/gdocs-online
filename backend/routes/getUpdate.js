const express = require("express");
const router = express.Router();
const Version = require("../schemas/version");

// Route to retrieve a specific version by ID
router.get("/:versionId", async (req, res) => {
    try {
        const versionId = req.params.versionId;

        const version = await Version.findById(versionId).populate("user");
        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }
        // Return the version as JSON
        res.set("Access-Control-Allow-Origin", "*");
        res.json(version);
    } catch (err) {
        console.error("Error retrieving version:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
