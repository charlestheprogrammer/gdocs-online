var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var express = require('express');
var router = express.Router();

/* POST Open a file based on his name. */
router.post('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
