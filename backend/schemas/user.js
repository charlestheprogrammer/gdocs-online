const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: String,
    name: String,
    image_url: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
