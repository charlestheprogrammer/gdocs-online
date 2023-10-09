const UserSchema = require("../schemas/user");

const setupTestUser = async () => {
    const testUser = new UserSchema({
        userId: "test-default",
        name: "Default Test User",
        image_url: "test",
    });
    await testUser.save();

    const testUser2 = new UserSchema({
        userId: "test-default2",
        name: "Default Test User 2",
        image_url: "test2",
    });

    await testUser2.save();

    const testUser3 = new UserSchema({
        userId: "test-default3",
        name: "Default Test User 3",
        image_url: "test3",
    });
    await testUser3.save();
};

module.exports = {
    setupTestUser,
};
