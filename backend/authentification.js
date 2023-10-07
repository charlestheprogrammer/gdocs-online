const { OAuth2Client } = require("google-auth-library");
const oauth2Client = new OAuth2Client();

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

async function getAuthenticatedUser(req) {
    if (!req.headers.token) return null;
    let userId = null;
    try {
        userId = await verify(req.headers.token);
    } catch (error) {
        return null;
    }
    const existingUser = await User.findOne({ userId: userId }).exec();
    return existingUser;
}

module.exports = {
    verify,
    getAuthenticatedUser,
};
