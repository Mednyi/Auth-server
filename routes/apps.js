var express = require('express');
var router = express.Router();
const uuid = require('uuid');
let mongo = require('../modules/mongo')
const col_name = 'apps'
router.post('/', async (req, res, next) => {
    let client_id = uuid.v4()
    try {
        const result = await mongo.addOne({client_id, ...req.body}, col_name)
        res.send(result)
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});
router.get('/:_id', async (req, res, next) => {
    try {
        const result = await mongo.findEntities({_id: req.params._id}, col_name)
        console.log(result)
        res.send(result)
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});

module.exports = router;
