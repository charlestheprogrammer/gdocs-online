const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    name: String,
    image_url: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
