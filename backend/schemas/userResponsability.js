const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userResponsabilitySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    document: {
        type: Schema.Types.ObjectId,
        ref: "Document",
    },
    readPermission: Boolean,
    writePermission: Boolean,
    deletePermission: Boolean,
});

const UserResponsability = mongoose.model("UserResponsability", userResponsabilitySchema);

module.exports = UserResponsability;
