
const API = require('../src/api')

const api = new API()

console.log(api)

api.reset({
  BASE: 'lalalala'
})

console.log(api)
