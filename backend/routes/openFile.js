const DocumentSchema = require("../schemas/document");
const VersionSchema = require("../schemas/version");
const SaveSchema = require("../schemas/save");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

var express = require("express");
var router = express.Router();

/* GET Open a file based on his name. */
router.get("/:document_id", async function (req, res) {
    const document_id = req.params.document_id;
    
    try {
        // Find the document by its ID
        const documentFound = await DocumentSchema.findById(document_id);
        
        if (!documentFound) {
            return res.status(404).send({
                message: "Document not found",
            });
        }

        // Find the last version, if any
        const lastVersion = await VersionSchema.findOne({ document: document_id })
            .sort({ timestamp: -1 })
            .limit(1);

        // Find the last save, if any
        const lastSave = await SaveSchema.findOne({ document: document_id })
            .sort({ date: -1 })
            .limit(1);

        // Determine the content based on the last version or save
        const contentFound = lastVersion ? lastVersion.content : (lastSave ? lastSave.content : "");

        res.set("Access-Control-Allow-Origin", "*");
        res.send({
            message: "Récupère ton contenu chacal",
            content: contentFound,
            document: documentFound,
        });
    } catch (error) {
        console.error("Error retrieving document:", error);
        res.status(500).json({ error: "Error retrieving document" });
    }
});

module.exports = router;