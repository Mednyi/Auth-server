/* 
1 Send GET req, 
http://localhost:3002/auth?response_type=code&client_id={}&redirect_uri={http://localhost:3000/callback}&scope=id_token access_token&state={}
where:
response_type - specify code for authorization code flow
client_id - string generated for app during creation
redirect_uri - link to callback on client
scope - needed access permitions from client
state - random string 
*/
var uuid = require('uuid')
var chai = require('chai')
var expect = chai.expect;
var chaiHttp = require('chai-http')
chai.use(chaiHttp)
var client_id
let code
var params = {
    response_type: 'code',
    redirect_uri: 'http://localhost:3000',
    scope: "id_token access_token",
    state: uuid.v4()
} 
describe("OAuth + OpenID", () => {
    describe("Authorization code flow", () => {
        it('Register request', (done) => {
            chai.request('http://localhost:3002').post('/apps').send({
                client_secret: "mysecret",
                name: "myapp",
                redirect_uri: 'http://localhost:3000/callback'
            }).then(res => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an("Array")
                let patch = res.body[0]
                expect(patch).to.have.property("op")
                expect(patch).to.have.property("path")
                expect(patch).to.have.property("value")
                expect(patch.value).to.have.property("name")
                expect(patch.value).to.have.property("client_id")
                expect(patch.value).to.have.property("client_secret")
                expect(patch.value).to.have.property("redirect_uri")
                expect(patch.value.client_secret).to.equal("mysecret")
                params.client_id = patch.value.client_id
                console.log(`Client ID: ${patch.value.client_id}`)
                done()
            }).catch(e => {
                throw e
                done()
            })
        })
        it('Redirect User', (done) => {
            let reqstr = Object.entries(params).reduce((acc, item, index) => {
                acc += index === 0 ? `${item[0]}=${item[1]}` : `&${item[0]}=${item[1]}`
                return acc
            }, "/auth?")
            console.log(reqstr)
            chai.request('http://localhost:3002').get(reqstr).end((err,res) => {
                expect(res).to.have.status(200) 
                done()
            })
        })
        it('Get code', (done) => { 
            chai.request('http://localhost:3002').post('/auth/consent').send({consent: true, Name:'Cowboy', Surname :'Baby', password: '', ...params}).then(res => {
                expect(res).to.have.status(301)
                expect(res.query.code).to.be.a("string")
                expect(res.query.state).to.be.equal(params.state)
                code = req.query.code
                done()
            }).catch(e => {
                throw e
                done()
            })
        })
        it('Get token', (done) => { 
            let tokenParams = {
                grant_type: 'code',
                code,
                client_secret: 'mysecret',
                client_id,
                redirect_uri: 'http://localhost:3000',
                state: uuid.v4()
            }
            chai.request('http://localhost:3002').post('/auth/token').send(tokenParams).then(res => {
                expect(res).to.have.status(301)
                expect(res.body).to.have.param('access_token')
                expect(res.body).to.have.param('id_token')
                done()
            }).catch(e => {
                throw e
                done()
            })
        })
    })
})