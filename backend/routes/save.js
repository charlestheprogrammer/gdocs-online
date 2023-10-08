const DocumentSchema = require("../schemas/document");
const SaveSchema = require("../schemas/save");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const { getAuthenticatedUser } = require("../authentification");

var express = require("express");
var router = express.Router();

/* POST Create a new document and add the first save or add a save to an existing document */
router.post("/", async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.body.id == null) {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        var newDocument = new DocumentSchema({ title: req.body.title });
        var documentId = await newDocument.save();
        const userResponsability = await new UserResponsabilitySchema({
            user: user,
            document: documentId,
            readPermission: true,
            writePermission: true,
            deletePermission: true,
        }).save();
        await new ChainOfResponsabilitySchema({
            document: documentId,
            chain: [userResponsability],
        }).save();
        var newSave = new SaveSchema({
            content: req.body.content,
            document: documentId,
        });
        await newSave.save();
        res.set("Access-Control-Allow-Origin", "*");
        res.send({
            message: "Note ton id sur un post it nouveau",
            document: documentId,
        });
    } else {
        var document = await DocumentSchema.findById(req.body.id).exec();
        if (document.title !== req.body.title) {
            document.title = req.body.title;
            await document.save();
        }
        var newSave = new SaveSchema({
            content: req.body.content,
            document: document,
        });
        await newSave.save();
        res.send({ message: "Note ton id sur un post it", document: document });
    }
});

module.exports = router;
