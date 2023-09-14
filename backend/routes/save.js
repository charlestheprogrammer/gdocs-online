var express = require('express');
var router = express.Router();

/* POST Create a new document and add the first save or add a save to an existing document */
router.post('/', function(req, res) {
    'Si req.body.id non null cest document existant a update'
    'Sinon cest un nouveau document a créer'
    'req.body.nom a foutre dans document.nom'
    'req.body.contenu a foutre dans save.contenu'
    res.send('Vous avez sauvegardé votre fichier');
});

module.exports = router;