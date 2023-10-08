const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChainOfResponsabilitySchema = new Schema({
    document: {
        type: Schema.Types.ObjectId,
        ref: "Document",
    },
    chain: [
        {
            type: Schema.Types.ObjectId,
            ref: "UserResponsability",
        },
    ],
});

const ChainOfResponsability = mongoose.model("ChainOfResponsability", ChainOfResponsabilitySchema);

module.exports = ChainOfResponsability;
