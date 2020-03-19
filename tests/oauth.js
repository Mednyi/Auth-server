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
    _id: '',
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/callback',
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
                let patch = res.body[0]
                expect(patch.value).to.have.property("client_id")
                expect(patch.value.client_secret).to.equal("mysecret")
                params.client_id = patch.value.client_id
                params._id = patch.value._id
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
            let credentials = Buffer.from(`Cowboy:octopus`).toString('base64')
            let reqstr = Object.entries(params).reduce((acc, item, index) => {
                acc += index === 0 ? `${item[0]}=${item[1]}` : `&${item[0]}=${item[1]}`
                return acc
            }, "/auth?")
            chai.request('http://localhost:3002').get(reqstr).set('Authorization', `Basic ${credentials}`).redirects(0).end((err,res) => {
                expect(res).to.have.status(302)
                console.log(res.headers)
                expect(res.headers).to.have.property('location')
                let query = res.headers['location'].split('?')[1].split('&').reduce((acc,s) => {
                    let param = s.split('=')
                    acc[param[0]] = param[1]
                    return acc
                }, {})  
                expect(query).to.have.property('code')
                expect(query.state).to.be.equal(params.state)
                code = query.code
                done()
            })
        })
        it('Get token', done => { 
            let tokenParams = {
                grant_type: 'code',
                code,
                client_secret: 'mysecret',
                client_id,
                redirect_uri: 'http://localhost:3000/callback',
                state: uuid.v4()
            }
            chai.request('http://localhost:3002').post('/auth/token').send(tokenParams).then(res => {
                expect(res).to.have.status(200)    
                expect(res.body).to.have.property('access_token')
                expect(res.body).to.have.property('id_token')
                done()
            }).catch(e => {
                throw e
                done()
            })
        })
        it('delete request', (done) => {
            chai.request('http://localhost:3002').delete(`/apps/${params._id}`).send().then(res => {
                expect(res).to.have.status(200)
                let patch = res.body[0]
                expect(patch.path).to.be.equal(`/${params._id}`)
                expect(patch.op).to.equal("remove")
                done()
            }).catch(e => {
                throw e
                done()
            })
        })
    })
})