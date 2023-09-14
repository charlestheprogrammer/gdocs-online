const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb://localhost:27017/nlpf';
let db;
let client;

function connectToDB() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, connectedClient) => {
      if (err) {
        console.error('Erreur de connexion à MongoDB :', err);
        reject(err);
      } else {
        console.log('Connecté à MongoDB');
        db = connectedClient.db();
        client = connectedClient;
        resolve();
      }
    });
  });
}

function closeDB() {
  if (client) {
    client.close(() => {
      console.log('Déconnexion de MongoDB');
    });
  }
}

function getDB() {
  return db;
}

module.exports = { connectToDB, closeDB, getDB };