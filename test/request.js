
const createRequest = require('../src/request')
const req = createRequest()

req.get('https://github.com').then(() => {
    console.log('== Success ==')
})