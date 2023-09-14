const DocumentSchema = require("../schemas/document");
const SaveSchema = require('../schemas/save');

var express = require('express');
var router = express.Router();

/* POST Create a new document and add the first save or add a save to an existing document */
router.post('/', async function(req, res) {
    if (req.body.id == null){
        var newDocument = new DocumentSchema({title: req.body.title});
        var documentId = await newDocument.save();
        var newSave = new SaveSchema({content: req.body.content, document: documentId});
        await newSave.save();
        res.send({message: 'Note ton id sur un post it nouveau', document: documentId});
    }
    else{
        var document = await DocumentSchema.findById(req.body.id).exec();
        var newSave = new SaveSchema({content: req.body.content, document: document});
        await newSave.save();
        res.send({message: 'Note ton id sur un post it', document: document});
    }
});

module.exports = router;
