var express = require("express");
var router = express.Router();

const { userWantToRead } = require("../misc/chainOfResponsability");

router.get("/", function (req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    userWantToRead("651719d40b1965c936ce07cc");
    res.send({ message: "Hello World" });
});

module.exports = router;
