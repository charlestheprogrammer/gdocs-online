const axios = require("axios");
const cors = require("cors");

const { WebSocketServer } = require("ws");
const { parseMessage, disconnect } = require("./routes/collaboration");
const { verify } = require("./authentification");

const express = require("express");
const app = express();
const db = require("./db");
const User = require("./schemas/user");
const Document = require("./schemas/document");
const SaveSchema = require("./schemas/save");
const VersionSchema = require("./schemas/version");

app.options("*", cors());
app.use(express.json({ limit: "50mb" }));

var openFileRouter = require("./routes/openFile");
var saveRouter = require("./routes/save");
var updateRouterMiddleware = require("./routes/update");
var versionsRouter = require("./routes/getDocumentUpdates");
var singleVersionRouter = require("./routes/getUpdate");
var commentVersionRouter = require("./routes/addComment");
var imageRouter = require("./routes/images");
var rightsRouter = require("./routes/rights");

const { identifiedUsers } = require("./misc/users");

const wss = new WebSocketServer({ port: 3001 });

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4();
};

const clients = [];

wss.on("connection", function connection(ws) {
    ws.id = wss.getUniqueID();
    clients.push(ws);
    console.log(clients.length + " clients connectés");
    ws.on("error", console.error);

    ws.on("close", function close() {
        disconnect(ws, identifiedUsers);
        clients.splice(clients.indexOf(ws), 1);
        console.log(clients.length + " clients connectés");
    });

    ws.on("message", function message(data) {
        parseMessage(ws, data, clients, identifiedUsers);
    });
});

app.use(express.json());

app.use("/openFile", openFileRouter);
app.use("/save", saveRouter);
app.use("/update", updateRouterMiddleware(wss));
app.use("/getDocumentUpdates", versionsRouter);
app.use("/getUpdate", singleVersionRouter);
app.use("/comment", commentVersionRouter);
app.use("/images", imageRouter);
app.use("/rights", rightsRouter);

let server = null;

async function startServer(port, mongoURI, verbose = true) {
    // Connexion à la base de données
    try {
        await db.connectToDB(mongoURI, verbose);
    } catch (err) {
        console.error("Impossible de se connecter à la base de données :", err);
        process.exit(1);
    }

    // Définition des routes

    // POST /api/login : identification d'un utilisateur
    app.get("/api/login", async (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");

        const token = req.headers.authorization;
        const email = req.headers.email;
        if (!token || token === "" || !email || email === "") {
            res.status(400).send("Mot de passe manquant");
            return;
        }

        try {
            const existingItem = await User.findOne({ email, password: token }).exec();

            const userRegistered = await User.findOne({ email }).exec();

            if (userRegistered && !existingItem) {
                res.status(401).send("Mot de passe incorrect");
                return;
            }

            if (!existingItem) {
                const newUser = new User({
                    email,
                    password: token,
                    name: email.split("@")[0],
                    image_url:
                        "https://lh3.googleusercontent.com/a/ACg8ocKphLaRCXDdXR_xtZ0qpu6fidU2vkTcEMrQ8_Ue-obTwJc=s96-c",
                });
                const user = await newUser.save();
                res.status(201).send(JSON.stringify(user));
                return;
            } else {
                res.status(200).send(JSON.stringify(existingItem));
                return;
            }
        } catch (error) {
            console.error("Erreur lors de la recherche dans MongoDB :", error);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
            return;
        }
    });

    // GET /api/users : récupération de la liste des utilisateurs
    app.get("/api/users", async (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        try {
            const items = await User.find({});
            res.status(200).json(items);
        } catch (err) {
            console.error("Erreur lors de la recherche dans MongoDB :", err);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
        }
    });

    // POST /api/documents : création d'un nouveau document
    app.post("/api/documents", async (req, res) => {
        try {
            const newDocument = req.body;
            const document = new Document(newDocument);
            await document.save();
            res.status(201).json(document);
        } catch (err) {
            console.error("Erreur lors de la création du document :", err);
            res.status(500).json({
                error: "Erreur interne survenue lors de la création du document",
            });
        }
    });

    // GET /api/documents : récupération de la liste des documents
    app.get("/api/documents", async (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        try {
            const items = await Document.find({});
            const documents = [];
            for (let i = 0; i < items.length; i++) {
                const lastVersion = await VersionSchema.findOne({ document: items[i] })
                    .sort({ timestamp: -1 })
                    .limit(1);

                // Find the last save, if any
                const lastSave = await SaveSchema.findOne({ document: items[i] }).sort({ date: -1 }).limit(1);

                // Determine the content based on the last version or save
                const contentFound = lastVersion ? lastVersion.content : lastSave ? lastSave.content : "";
                const date = lastVersion ? lastVersion.timestamp : lastSave ? lastSave.date : null;
                documents.push({
                    _id: items[i]._id,
                    title: items[i].title,
                    lastSave: date,
                    content: contentFound,
                });
            }

            res.status(200).json(
                documents.sort((a, b) => {
                    return new Date(b.lastSave) - new Date(a.lastSave);
                })
            );
        } catch (err) {
            console.error("Erreur lors de la recherche dans MongoDB :", err);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
        }
    });

    // GET /api/documents/:id : récupération d'un document
    app.get("/api/documents/:id", async (req, res) => {
        try {
            const document = await Document.findById(req.params.id);
            if (document) {
                res.status(200).json(document);
            } else {
                res.status(404).json({ error: "Document non trouvé" });
            }
        } catch (err) {
            console.error("Erreur lors de la recherche dans MongoDB :", err);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
        }
    });

    // PUT /api/documents/:id : modification d'un document
    app.put("/api/documents/:id", async (req, res) => {
        try {
            const document = await Document.findById(req.params.id);
            if (document) {
                document.content = req.body.content;
                await document.save();
                res.status(200).json(document);
            } else {
                res.status(404).json({ error: "Document non trouvé" });
            }
        } catch (err) {
            console.error("Erreur lors de la recherche dans MongoDB :", err);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
        }
    });

    // DELETE /api/documents/:id : suppression d'un document
    app.delete("/api/documents/:id", async (req, res) => {
        try {
            const document = await Document.findById(req.params.id);
            if (document) {
                await document.remove();
                res.status(200).json({ message: "Document supprimé avec succès" });
            } else {
                res.status(404).json({ error: "Document non trouvé" });
            }
        } catch (err) {
            console.error("Erreur lors de la recherche dans MongoDB :", err);
            res.status(500).json({ error: "Erreur lors de la recherche dans la base de données" });
        }
    });

    // Lancement du serveur
    server = app.listen(port, () => {
        if (verbose) console.log(`Serveur en cours d'exécution sur le port ${port}`);
    });
}

// Gestion de la terminaison du serveur
process.on("SIGINT", async () => {
    await stopServer();
    process.exit();
});

const stopServer = async (verbose = true) => {
    await db.closeDB();
    if (verbose) console.log("Arrêt du serveur");
    server.close();
    wss.close();
};

module.exports = {
    wss,
    startServer,
    stopServer,
    server,
};
