const DocumentSchema = require("../schemas/document");
const SaveSchema = require("../schemas/save");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const { userWantToRead } = require("../misc/chainOfResponsability");
const { identifiedUsers } = require("../misc/users");

var express = require("express");
var router = express.Router();

/* GET Open a file based on his name. */
router.get("/:document_id", async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    const user = await UserSchema.findOne({ name: req.headers.username }).exec();
    if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
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
                identifiedUsers[allowedUser.user.name]?.socket.send(
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
    var documentFound = await DocumentSchema.findById(document_id).exec();
    var saveFound = await SaveSchema.findOne({ document: documentFound }).sort({ date: -1 }).exec();
    res.send({
        message: "Récupère ton contenu chacal",
        content: saveFound.content,
        document: documentFound,
    });
});

module.exports = router;
