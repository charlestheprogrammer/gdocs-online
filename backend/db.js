const mongoose = require("mongoose");

async function connectToDB(mongoURI) {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connecté à MongoDB via Mongoose");
    } catch (err) {
        console.error("Impossible de se connecter à la base de données :", err);
        throw err;
    }
}

function closeDB() {
    mongoose.connection.close(() => {
        console.log("Déconnexion de MongoDB via Mongoose");
    });
}

module.exports = { connectToDB, closeDB };
