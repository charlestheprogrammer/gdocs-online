require("dotenv").config();

const cors = require("cors");
const { WebSocketServer } = require("ws");
const { parseMessage, disconnect } = require("./routes/collaboration");

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

const express = require("express");
const app = express();
const db = require("./db");
const User = require("./schemas/user");
const Document = require("./schemas/document");

app.options("*", cors());

var openFileRouter = require("./routes/openFile");
var saveRouter = require("./routes/save");
var updateRouter = require("./routes/update");
var imageRouter = require("./routes/images");

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

const identifiedUsers = {};

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
app.use("/update", updateRouter);
app.use("/images", imageRouter);

async function startServer() {
  // Connexion à la base de données
  try {
    await db.connectToDB(mongoURI);
  } catch (err) {
    console.error("Impossible de se connecter à la base de données :", err);
    process.exit(1);
  }
  console.log("Connexion à la base de données réussie");

  // Définition des routes

  // POST /api/login : identification d'un utilisateur
  app.post("/api/login", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
      const username = req.body.name;
      const userimage = req.body.image_url;
      const existingItem = await User.findOne({ name: username }).exec();

      if (existingItem) {
        res.status(200).json({ message: "Vous êtes identifié" });
      } else {
        const user = new User({
          name: username,
          image_url: userimage,
        });
        await user.save();
        res.status(201).json({ message: "Vous êtes inscrit" });
      }
    } catch (err) {
      console.error("Erreur lors de la gestion de l'utilisateur :", err);
      res
        .status(500)
        .json({ error: "Erreur interne survenue lors de l'identification" });
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
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche dans la base de données" });
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
      res.status(200).json(items);
    } catch (err) {
      console.error("Erreur lors de la recherche dans MongoDB :", err);
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche dans la base de données" });
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
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche dans la base de données" });
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
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche dans la base de données" });
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
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche dans la base de données" });
    }
  });

  // Lancement du serveur
  app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
  });
}

startServer();

// Gestion de la terminaison du serveur
process.on("SIGINT", () => {
  db.closeDB();
  console.log("Arrêt du serveur");
  process.exit();
});

module.exports = {
  app,
  wss,
  identifiedUsers,
};
