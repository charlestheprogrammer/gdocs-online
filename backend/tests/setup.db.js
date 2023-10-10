const VersionSchema = require("../schemas/version");
const DocumentSchema = require("../schemas/document");
const UserSchema = require("../schemas/user");
const SaveSchema = require("../schemas/save");
const ChainOfResponsibilitySchema = require("../schemas/chainOfResponsability");
const UserResponsabilitySchema = require("../schemas/userResponsability");

const setupTestVersion = async () => {
    await VersionSchema.deleteMany({});
    await DocumentSchema.deleteMany({});
    await UserSchema.deleteMany({});
    await SaveSchema.deleteMany({});
    await ChainOfResponsibilitySchema.deleteMany({});
    await UserResponsabilitySchema.deleteMany({});
};

module.exports = {
    setupTestVersion,
};
