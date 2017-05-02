// 'use strict'

// const _ = require('lodash')
// const { API_TEMPLATE, HOST } = require('./constrains')

// const API_COMPILED = _.mapValues(API_TEMPLATE, template => _.template(template))

// class API {
//   constructor () {
//     this.HOST = {
//       BASE: HOST.BASE,
//       WECHAT: HOST.WECHAT,
//       FILE: HOST.FILE,
//       SYNC: HOST.SYNC_LIST[0]
//     }
//     this.reset({})
//   }

//   reset (HOST) {
//     _.merge(this.HOST, HOST)
//     _.mapKeys(API_COMPILED, (compiled, name) => {
//       this[name] = compiled(this.HOST)
//     })
//   }
// }

// API.COMPILED = API_COMPILED

// module.exports = API