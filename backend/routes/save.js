const DocumentSchema = require("../schemas/document");
const SaveSchema = require("../schemas/save");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

var express = require("express");
var router = express.Router();

/* POST Create a new document and add the first save or add a save to an existing document */
router.post("/", async function (req, res) {
    if (req.body.id == null) {
        var user = await UserSchema.findOne({ name: req.body.username }).exec();
        if (!user) {
            res.status(404).json({ error: "Utilisateur non trouvé" });
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
        res.set("Access-Control-Allow-Origin", "*");
        res.send({ message: "Note ton id sur un post it", document: document });
    }
});

module.exports = router;
