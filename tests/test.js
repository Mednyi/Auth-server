var chai = require('chai')
var expect = chai.expect;
var chaiHttp = require('chai-http')
chai.use(chaiHttp)
describe("Register new app", () => {
    let _id
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
            _id = patch.value._id
            done()
        }).catch(e => {
            throw e
        })
    })
    it('Get app', (done) => {
        let addr = `/apps/${_id}`
        chai.request('http://localhost:3002').get(addr).end((err,res) => {
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
            done()
        })
    })
    it('Update app', (done) => {
        let addr = `/apps/${_id}`
        chai.request('http://localhost:3002').put(addr).send({
            name: "myapp1",
            redirect_uri: 'http://localhost:3000'
        }).then(res => {
            expect(res).to.have.status(200)
            let patch = res.body[0]
            expect(patch).to.have.property("op")
            expect(patch).to.have.property("path")
            expect(patch).to.have.property("value")
            expect(patch.value).to.have.property("name")
            expect(patch.value.name).to.equal("myapp1")
            _id = patch.value._id
            done()
        }).catch(e => {
            throw e
        })
    })
    it('Delete app', (done) => {
        let addr = `/apps/${_id}`
        chai.request('http://localhost:3002').delete(addr).send().then(res => {
            expect(res).to.have.status(200)
            let patch = res.body[0]
            expect(patch).to.have.property("op")
            expect(patch).to.have.property("path")
            expect(patch).to.have.property("value")
            expect(patch.path).to.equal(`/${_id}`)
            done()
        }).catch(e => {
            throw e
        })
    })
})