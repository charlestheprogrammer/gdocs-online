const DocumentSchema = require("../schemas/document");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const userWantToRead = async (document) => {
    const chainOfResponsability = await ChainOfResponsabilitySchema.findOne({ document: document })
        .populate("chain")
        .exec();
    if (!chainOfResponsability) {
        return null;
    }
    const users = chainOfResponsability.chain;
    const allowedUsers = [];
    for (const userResponsability of users) {
        if (userResponsability.readPermission) {
            const user = await UserSchema.findById(userResponsability.user).exec();
            userResponsability.user = user;
            allowedUsers.push(userResponsability);
        }
    }
    return allowedUsers;
};

const userWantToWrite = async (document) => {
    const chainOfResponsability = await ChainOfResponsabilitySchema.findOne({ document: document })
        .populate("chain")
        .exec();
    if (!chainOfResponsability) {
        return null;
    }
    const users = chainOfResponsability.chain;
    const allowedUsers = [];
    for (const userResponsability of users) {
        if (userResponsability.writePermission) {
            const user = await UserSchema.findById(userResponsability.user).exec();
            userResponsability.user = user;
            allowedUsers.push(userResponsability);
        }
    }
    return allowedUsers;
};

module.exports = {
    userWantToRead,
    userWantToWrite,
};
