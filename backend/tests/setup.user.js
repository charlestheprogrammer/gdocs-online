const UserSchema = require("../schemas/user");

const setupTestUser = async () => {
    const testUser = new UserSchema({
        userId: "test-default",
        name: "Default Test User",
        image_url: "test",
        email: "test-default",
    });
    await testUser.save();

    const testUser2 = new UserSchema({
        userId: "test-2",
        name: "Test User 2",
        image_url: "test2",
        email: "test-2",
    });

    await testUser2.save();

    const testUser3 = new UserSchema({
        userId: "test-3",
        name: "Test User 3",
        image_url: "test3",
        email: "test-3",
    });
    await testUser3.save();
};

module.exports = {
    setupTestUser,
};
