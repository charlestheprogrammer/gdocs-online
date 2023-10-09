const UserSchema = require("../schemas/user");

const setupTestUser = async () => {
    const testUser = new UserSchema({
        userId: "test",
        name: "test",
        image_url: "test",
    });
    await testUser.save();
};

module.exports = {
    setupTestUser,
};
