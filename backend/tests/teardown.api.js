const { stopServer } = require("../server");

// // Global setup file used for tests that will complete once before ALL test suites run
const setup = async (done) => {
    await stopServer(false);
};

module.exports = setup;
