const DocumentSchema = require("../schemas/document");
const VersionSchema = require("../schemas/version");
const SaveSchema = require("../schemas/save");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const { userWantToRead } = require("../misc/chainOfResponsability");
const { identifiedUsers } = require("../misc/users");
const { getAuthenticatedUser } = require("../authentification");

var express = require("express");
var router = express.Router();

/* GET Open a file based on his name. */
router.get("/:document_id", async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    const user = await getAuthenticatedUser(req);
    if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    const chainOfResponsability = await ChainOfResponsabilitySchema.findOne({
        document: req.params.document_id,
    })
        .populate("chain")
        .exec();
    if (!chainOfResponsability) {
        res.status(404).json({ error: "Document non trouvé" });
        return;
    }
    const users = chainOfResponsability.chain;
    let userFound = false;
    for (const userResponsability of users) {
        if (user._id.equals(userResponsability.user)) {
            userFound = true;
            break;
        }
    }
    if (!userFound) {
        const allowedUsers = await userWantToRead(req.params.document_id);
        if (allowedUsers) {
            for (const allowedUser of allowedUsers) {
                if (!allowedUser.user) {
                    continue;
                }
                identifiedUsers[allowedUser.user._id.toString()]?.socket.send(
                    JSON.stringify({
                        type: "requestRead",
                        document: req.params.document_id,
                        user: user,
                    })
                );
            }
        }
        res.status(403).json({ error: "Utilisateur non autorisé" });
        return;
    }
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
        const lastVersion = await VersionSchema.findOne({ document: document_id }).sort({ timestamp: -1 }).limit(1);

        // Find the last save, if any
        const lastSave = await SaveSchema.findOne({ document: document_id }).sort({ date: -1 }).limit(1);

        // Determine the content based on the last version or save
        const contentFound = lastVersion ? lastVersion.content : lastSave ? lastSave.content : "";

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
