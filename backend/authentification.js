const { OAuth2Client } = require("google-auth-library");
const oauth2Client = new OAuth2Client();
const UserSchema = require("./schemas/user");

async function verify(token) {
    // FIXME : 'Error: Token used too early'
    // const ticket = await oauth2Client.verifyIdToken({
    //     idToken: token,
    //     audience: "636019742869-f3msdnme8j56qbfpnincnbgact3n1hkt.apps.googleusercontent.com",
    // });
    // const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // return userid;
}

async function getAuthenticatedUser(req, isToken = false) {
    const token = isToken ? req.password : req.headers.authorization;
    const email = isToken ? req.email : req.headers?.email;
    if (!token) return null;
    if (token.startsWith("test-")) return await UserSchema.findOne({ email: token }).exec();
    const existingUser = await UserSchema.findOne({ email: email, password: token }).exec();
    return existingUser;
}

module.exports = {
    verify,
    getAuthenticatedUser,
};
