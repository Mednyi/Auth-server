var express = require('express');
var router = express.Router();
const uuid = require('uuid');
let mongo = require('../modules/mongo')
// const col_name = 'users'
router.get('/', async (req, res, next) => {
    try {
        let params = req.query
        const result = await mongo.findEntities({client_id: params.client_id}, 'apps')
        const application = result[0].value
        if (application.redirect_uri === params.redirect_uri)  throw new Error('Invalid redirect_uri') 
        res.send(200)
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});
router.post('/consent', async (req, res, next) => {
    try {
        let params = req.body
        const user = await mongo.findEntities({Name: params.Name}, 'clients')
        if(!user[0].value) throw new Error('Unauthorized')
        const result = await mongo.findEntities({client_id: params.client_id}, 'apps')
        const application = result[0].value
        if (application.redirect_uri === params.redirect_uri)  throw new Error('Invalid redirect_uri') 
        console.log(result)
        const location = `${params.redirect_uri}?code=${uuid.v4()}&state=${params.state}`
        res.redirect(location)
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});

module.exports = router;
