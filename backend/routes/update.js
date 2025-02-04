const express = require("express");
const router = express.Router();
const Version = require("../schemas/version");
const Document = require("../schemas/document");

const { getAuthenticatedUser } = require("../authentification");

// POST Update an existing document with new content
const updateRouterMiddleware = (wss) => async (req, res, next) => {
    try {
        const documentId = req.body.documentId;
        const content = req.body.content;
        const user = await getAuthenticatedUser(req);
        if (!user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const timestamp = req.body.timestamp;
        const description = req.body.description;

        // Create a new version with user name, timestamp, and content
        const newVersion = new Version({
            document: documentId,
            content,
            user,
            timestamp: timestamp,
            description: description,
        });

        // Save the new version to the "versions" collection
        const savedVersion = await newVersion.save();

        // Update the document to point to the new version
        await Document.findByIdAndUpdate(documentId, {
            $push: { versions: savedVersion._id },
        });

        res.set("Access-Control-Allow-Origin", "*");
        res.send({
            message: "Document updated and saved as a new version",
            version: savedVersion,
        });
    } catch (error) {
        console.error("Error updating and saving document:", error);
        res.status(500).json({ error: "Error updating and saving document" });
    }
};

router.post("/", updateRouterMiddleware);

module.exports = updateRouterMiddleware;
