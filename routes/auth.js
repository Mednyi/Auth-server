var express = require('express');
var router = express.Router();
const uuid = require('uuid');
let mongo = require('../modules/mongo')
let jwt = require('jsonwebtoken');
// const col_name = 'users'
router.get('/callback', async (req, res, next) => {
    try {
        res.send(req.query)
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});
router.get('/', async (req, res, next) => {
    try {
        let params = req.query
        const result = await mongo.findEntities({client_id: params.client_id}, 'apps')
        const application = result[0].value
        if (application.redirect_uri !== params.redirect_uri)  throw new Error('Invalid redirect_uri') 
        if(req.headers['authorization']) {
            let [name, password] = Buffer.from(req.headers['authorization'].split(' ')[1], 'base64').toString().split(':')
            const user = await mongo.findEntities({name: name, password: password}, 'users')
            if(!user[0].value) throw new Error('Unauthorized')
            const code = uuid.v4()
            await mongo.updateOne({_id: user[0].value._id}, {code: code}, 'users')
            const location = `${params.redirect_uri}?code=${code}&state=${params.state}`
            res.redirect(302, location)
        } else {
        res.send(200)
        }
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});
router.post('/token', async (req, res, next) => {
    try {
        let params = req.body
        const users = await mongo.findEntities({code: params.code}, 'users')
        await mongo.updateOne({_id: users[0].value._id}, {code: ""}, 'users', false)
        if(!users[0].value) throw new Error('Unauthorized')
        const user = users[0].value
        let id_token = jwt.sign({
            iss: "authprovider",
            aud: "webserver",
            iat: new Date().getTime(),
            ...user
        }, params.client_secret,{
            expiresIn: "30m"
        })
        let access_token = jwt.sign({
            iss: "authprovider",
            aud: "apiserver",
            iat: new Date().getTime()
        }, params.client_secret,{
            expiresIn: "30m"
        })
        let refresh_token = jwt.sign({
            iss: "authprovider",
            aud: "apiserver",
            iat: new Date().getTime()
        }, params.client_secret,{
            expiresIn: "2 days"
        })
        res.status(200).send({id_token, access_token, refresh_token})
    } catch(e) {
        res.status(500).send(e.message)
        throw e
    }
});

module.exports = router;
