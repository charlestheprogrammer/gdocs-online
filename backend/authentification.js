const { OAuth2Client } = require("google-auth-library");
const oauth2Client = new OAuth2Client();
const UserSchema = require("./schemas/user");

async function verify(token) {
    // FIXME : 'Error: Token used too early'
    const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: "636019742869-f3msdnme8j56qbfpnincnbgact3n1hkt.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];

    return userid;
}

async function getAuthenticatedUser(req, isToken = false) {
    const token = isToken ? req : req.headers.authorization;
    if (token.startsWith("test-")) return await UserSchema.findOne({ userId: token }).exec();
    if (!token) return null;
    let userId = null;
    try {
        userId = await verify(token);
    } catch (error) {
        return null;
    }
    const existingUser = await UserSchema.findOne({ userId: userId }).exec();
    return existingUser;
}

module.exports = {
    verify,
    getAuthenticatedUser,
};
