const DocumentSchema = require('./schemas/document');
const SaveSchema = require('./schemas/save');

var express = require('express');
var router = express.Router();

/* GET Open a file based on his name. */
router.get('/', async function(req, res) {
  var documentFound = await DocumentSchema.findById(req.body.title).exec();
  var saveFound = await SaveSchema.findOne({document: documentFound}).sort({date: -1}).exec();
  res.send({message: "Récupère ton contenu chacal", content: saveFound.content});
});

module.exports = router;
