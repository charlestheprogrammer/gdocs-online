require("dotenv").config();
const { startServer } = require("./server");

const port = process.env.PORT || 3000;
const mongoURI = process.env.mode === "TEST" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

startServer(port, mongoURI);
