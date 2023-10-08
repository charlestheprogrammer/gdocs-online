var express = require("express");
var router = express.Router();

const uploadImage = require("../misc/uploadImages");
const { getAuthenticatedUser } = require("../authentification");

/* GET Open a file based on his name. */
router.post("/upload", async function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    const user = await getAuthenticatedUser(req);
    if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    const base64Image = req.body.base64Image;
    try {
        const image = uploadImage(base64Image);
        res.set("Access-Control-Allow-Origin", "*");
        res.status(201).json({ image });
    } catch (err) {
        console.error("Erreur lors de l'upload de l'image :", err);
        res.status(500).json({ error: "Erreur interne survenue lors de l'upload de l'image" });
    }
});

module.exports = router;
