const { setupTestVersion } = require("./setup.db");
const { setupTestUser } = require("./setup.user");
require("dotenv").config();
const { startServer } = require("../server");

// // Global setup file used for tests that will complete once before ALL test suites run
const setup = async () => {
    await startServer(3080, process.env.MONGO_URI_TEST);
    await setupTestVersion();
    await setupTestUser();
};

module.exports = setup;
