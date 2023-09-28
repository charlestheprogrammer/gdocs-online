const DocumentSchema = require("../schemas/document");
const SaveSchema = require("../schemas/save");

var express = require("express");
var router = express.Router();

/* GET Open a file based on his name. */
router.get("/:document_id", async function (req, res) {
    const document_id = req.params.document_id;
    var documentFound = await DocumentSchema.findById(document_id).exec();
    var saveFound = await SaveSchema.findOne({ document: documentFound }).sort({ date: -1 }).exec();
    res.set("Access-Control-Allow-Origin", "*");
    res.send({
        message: "Récupère ton contenu chacal",
        content: saveFound.content,
        document: documentFound,
    });
});

module.exports = router;
