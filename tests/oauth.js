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
let client_id
describe("OAuth + OpenID", () => {
    describe("Authorization flow", () => {
        it('Register request', (done) => {
            chai.request('http://localhost:3002').post('/apps').send({
                client_secret: "mysecret",
                name: "myapp",
                redirect_uri: 'http://localhost:3000'
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
                client_id = patch.value.client_id
                done()
            }).catch(e => {
                throw e
            })
        })
        it('Get auth code', (done) => {
            let params = {
                response_type: 'code',
                client_id,
                redirect_uri: 'http://localhost:3000',
                scope: "id_token access_token",
                state: uuid.v4()
            } 
            let reqstr = Object.entries(params).reduce((acc, index, item) => {
                acc += index === 0 ? `${item[0]}=${item[1]}` : `&${item[0]}=${item[1]}`
                return acc
            }, "/auth?")
            chai.request('http://localhost:3002').get(reqstr).end((err,res) => {
                expect(res).to.have.status(301)
                expect(res.query.code).to.be.a("string")
                expect(res.query.state).to.be.equal(params.state) 
                done()
            })
        })
    })
})