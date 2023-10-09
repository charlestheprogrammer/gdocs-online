const { stopServer } = require("../server");

// // Global setup file used for tests that will complete once before ALL test suites run
const setup = async () => {
    stopServer();
};

module.exports = setup;
