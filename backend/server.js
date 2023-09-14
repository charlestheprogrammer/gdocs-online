const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');

app.use(express.json());

async function startServer() {
    // Connexion à la base de données
    try {
        await db.connectToDB();
    } catch (err) {
        console.error('Impossible de se connecter à la base de données :', err);
        process.exit(1);
    }
    console.log('Connexion à la base de données réussie');

    // Définition des routes

    // POST /api/login : identification d'un utilisateur
    app.post('/api/login', (req, res) => {
        const users = db.getDB().collection('users');
        const newUser = req.body;

        users.findOne({ name: newUser.name }, (err, existingItem) => {
            if (err) {
                console.error('Erreur lors de la recherche dans MongoDB :', err);
                res.status(500).json({ error: 'Erreur lors de la recherche dans la base de données' });
                return;
            }
            if (existingItem) {
                res.status(200).json({ message: 'Vous êtes identifié' });
            } else {
                users.insertOne(newUser, (err, result) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion dans MongoDB :', err);
                        res.status(500).json({ error: 'Erreur interne survenue lors de l\'identification' });
                        return;
                    }
                    res.status(200).json({ message: 'Vous êtes inscrit' });
                });
            };
        });
    });

    // GET /api/users : récupération de la liste des utilisateurs
    app.get('/api/users', (req, res) => {
        const users = db.getDB().collection('users');

        users.find({}).toArray((err, items) => {
            if (err) {
                console.error('Erreur lors de la recherche dans MongoDB :', err);
                res.status(500).json({ error: 'Erreur lors de la recherche dans la base de données' });
                return;
            }
            res.status(200).json(items);
        });
    });

    // POST /api/documents : création d'un nouveau document
    app.post('/api/documents', async (req, res) => {
        try {
            const documents = db.collection('documents');
            const newDocument = req.body; // Contient le contenu initial du document

            const result = await documents.insertOne(newDocument);

            res.status(201).json({ message: 'Document créé avec succès', documentId: result.insertedId });
        } catch (err) {
            console.error('Erreur lors de la création du document :', err);
            res.status(500).json({ error: 'Erreur lors de la création du document' });
        }
    });

    // GET /api/documents : récupération de la liste des documents
    app.get('/api/documents', async (req, res) => {
        try {
            const documents = db.collection('documents');

            const items = await documents.find({}).toArray();

            res.status(200).json(items);
        } catch (err) {
            console.error('Erreur lors de la récupération des documents :', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
        }
    });

    // GET /api/documents/:id : récupération d'un document
    app.get('/api/documents/:id', async (req, res) => {
        try {
            const documents = db.collection('documents');
            const documentId = req.params.id;
            
            const item = await documents.findOne({ _id: documentId });
            
            if (item) {
                res.status(200).json(item);
            } else {
                res.status(404).json({ error: 'Document non trouvé' });
            }
        } catch (err) {
            console.error('Erreur lors de la récupération du document :', err);
            res.status(500).json({ error: 'Erreur lors de la récupération du document' });
        }
    });

    // PUT /api/documents/:id : modification d'un document
    app.put('/api/documents/:id', async (req, res) => {
        try {
            const documents = db.collection('documents');
            const documentId = req.params.id;
            const newContent = req.body; // Contient le nouveau contenu du document

            const result = await documents.updateOne({ _id: documentId }, { $set: { content: newContent } });

            if (result.matchedCount === 1) {
                res.status(200).json({ message: 'Document modifié avec succès' });
            } else {
                res.status(404).json({ error: 'Document non trouvé' });
            }
        } catch (err) {
            console.error('Erreur lors de la modification du document :', err);
            res.status(500).json({ error: 'Erreur lors de la modification du document' });
        }
    });

    // DELETE /api/documents/:id : suppression d'un document
    app.delete('/api/documents/:id', async (req, res) => {
        try {
            const documents = db.collection('documents');
            const documentId = req.params.id;

            const result = await documents.deleteOne({ _id: documentId });

            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'Document supprimé avec succès' });
            } else {
                res.status(404).json({ error: 'Document non trouvé' });
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du document :', err);
            res.status(500).json({ error: 'Erreur lors de la suppression du document' });
        }
    });

    // Lancement du serveur
    app.listen(port, () => {
        console.log(`Serveur en cours d'exécution sur le port ${port}`);
    });
}

startServer();

// Gestion de la terminaison du serveur
process.on('SIGINT', () => {
    db.closeDB();
    console.log('Arrêt du serveur');
    process.exit();
});