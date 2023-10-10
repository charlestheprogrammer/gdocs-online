const mongoose = require("mongoose");

async function connectToDB(mongoURI, verbose = true) {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        if (verbose) console.log("Connecté à MongoDB via Mongoose");
    } catch (err) {
        console.error("Impossible de se connecter à la base de données :", err);
        throw err;
    }
}

async function closeDB() {
    await mongoose.connection.close();
}

module.exports = { connectToDB, closeDB };
