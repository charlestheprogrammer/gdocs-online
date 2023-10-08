const express = require("express");
const router = express.Router();
const Version = require("../schemas/version");

// GET all versions of a document
router.get("/:documentId", async function (req, res) {
    try {
        const documentId = req.params.documentId;

        // Find all versions of the specified document
        const versions = await Version.find({ document: documentId }).populate("user").sort({
            timestamp: 1,
        });

        res.set("Access-Control-Allow-Origin", "*");
        res.json(versions);
    } catch (error) {
        console.error("Error fetching document versions:", error);
        res.status(500).json({ error: "Error fetching document versions" });
    }
});

module.exports = router;
