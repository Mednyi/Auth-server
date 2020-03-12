const jwt = require('jsonwebtoken')
const usermock = require('../mocks/users')
const private_key = "my_private_key"
const uuid = require('uuid');
const authorize = (name, password) => {
    try {
        if(usermock.name === name && usermock.password === password) {
            let id_token = jwt.sign({
                iss: "myauthserver",
                aud: "webserver",
                iat: new Date().getTime(),
                ...usermock
            }, private_key,{
                expiresIn: "30m"
            })
            let access_token = jwt.sign({
                iss: "myauthserver",
                aud: "apiserver",
                iat: new Date().getTime()
            }, private_key,{
                expiresIn: "30m"
            })
            let refresh_token = jwt.sign({
                iss: "myauthserver",
                aud: "apiserver",
                iat: new Date().getTime()
            }, private_key,{
                expiresIn: "2 days"
            })
            return {
                id_token,
                access_token,
                refresh_token
            }
        } else {
            throw new Error("Unauthorized")
        }
    } catch(e) {
        throw e
    }
}
const genAccessCode = (user) => {
    user.accesscode = uuid.v4()
    return user.accesscode
} 
const checkAccessCode = (code, user) => {
    return user.accesscode === code
} 
module.exports = {
    authorize,
    genAccessCode,
    checkAccessCode
}