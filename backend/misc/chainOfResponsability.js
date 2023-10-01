const DocumentSchema = require("../schemas/document");
const ChainOfResponsabilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");
const UserSchema = require("../schemas/user");

const userWantToRead = async (document) => {
    const chainOfResponsability = await ChainOfResponsabilitySchema.findOne({ document: document })
        .populate("chain")
        .exec();
    if (!chainOfResponsability) {
        console.log("No chain of responsability found");
        return null;
    }
    const users = chainOfResponsability.chain;
    const allowedUsers = [];
    for (const userResponsability of users) {
        if (userResponsability.readPermission) {
            console.log("User " + userResponsability._id + " has read permission");
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
        console.log("No chain of responsability found");
        return null;
    }
    const users = chainOfResponsability.chain;
    for (const user of users) {
        if (user.writePermission) {
            console.log("User " + user._id + " has write permission");
            return user;
        }
    }
};

module.exports = {
    userWantToRead,
    userWantToWrite,
};
