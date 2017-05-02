// 'use strict'

// const { APPID, LANG, HOST: {SYNC_LIST} } = require('./constrains')
// const createRequest = require('./request')
// const API = require('./api')

// const co = require('co')
// const EventEmitter = require('events')
// const qrcode = require('qrcode-terminal')
// const xml2js = require('xml2js')
// const url = require('url')
// const _ = require('lodash')
// const WeChatError = require('./error')

// const now = () => +new Date()
// const log = console.log

// const wait = t => new Promise(resolve => setTimeout(resolve))
// // const retry = (times, func) => {
// //   try { 
// //     func 
// //   } catch (e) {
// //     console.log(e)
// //   }
// // }

// module.exports = class WeChat extends EventEmitter {
//   constructor() {
//     super()

//     this.API = new API()
//     this.request = createRequest()
//     this.config = null
//   }

//   fetchUUID () {
//     const _this = this
//     return co(function *() {
//       const { data } = yield _this.request.get(_this.API.JS_LOGIN, {
//         params: { appid: APPID, fun: 'new', _: now() }
//       })

//       const uuid = (() => {
//         const window = { QRLogin: {} }
//         eval(data)
//         return window.QRLogin.uuid
//       })()

//       return uuid
//     })
//   }

//   fetchLoginStatus (uuid) {
//     const _this = this
//     return co(function * () {

//       const { data } = yield  _this.request.get(_this.API.LOGIN, {
//         params: { tip: 1, uuid: uuid, _: now() }
//       })

//       const result = (() => {
//         const window = {}
//         eval(data)
//         return window
//       })()

//       return result
//     })
//   }

//   generateQrcode(uuid) {
//     return new Promise(resolve => {
//       const qrcode_url = this.API.QRCODE_PATH + uuid
//       qrcode.generate(qrcode_url.replace('/qrcode/', '/l/'), { small: true }, code => resolve({url: qrcode_url, code: code}))
//     })
//   }

//   waitingForLogin (uuid, wait_times = 6) {
//     const _this = this
//     return co(function* () {
//       let times = 0
//       while (true) {

//         if (times > wait_times) 
//           throw new Error('wait_times_error')

//         const result = yield _this.fetchLoginStatus(uuid)
//         const code = result.code

//         if (code === 200) {
//           return result.redirect_uri
//         } else if (code === 201) {
//           yield wait(3)
//         } else if (code === 408) {
//           throw new Error('login_time_out')
//         } else {
//           throw new Error('unknown_login_error')
//         }
//         times++
//       }
//     })
//   }

//   fetchTickets (redirect_uri) {
//     const _this = this
//     return co(function* () {
//       const {data} = yield _this.request.get(redirect_uri)
//       const result = yield new Promise(resolve => xml2js.parseString(data, (err, r) => resolve(r)))
//       return _.mapValues(result.error, l => l[0])
//     })
//   }

//   webwxinit (base_request, pass_ticket, skey) {
//     return co(function* () {
//       const { data } = yield req.post(
//         URLS.API_webwxinit,
//         { BaseRequest: this.baseRequest },
//         {
//           params: {
//             pass_ticket: this.passTicket,
//             skey: this.skey,
//           },
//         }
//       )
//     })
//   }

//   loopUpSyncHost() {
//     const _this = this
//     const config = this.config
//     return co(function* () {
//       for (let sync_host of SYNC_LIST) {
//         const {data} = yield _this.request.get(API.COMPILED.SYNC_CHECK({SYNC: sync_host}), {
//           params: {
//             r: now(),
//             skey: config.skey,
//             sid: config.sid,
//             uin: config.uin,
//             deviceid: config.deviceid,
//             synckey: config.synckey
//           }
//         })

//         const retcode = data.match(/retcode:"(\d+)"/)[1]
//         if (retocde === 0) {
//           return sync_host
//         }
//       }
//     })
//   }

//   // initAPI (base_host) {
//   //   const _this = this
//   //   return co(function* () {
//   //     _this.API.reset({ BASE: base_host })

//   //     for (let sync_host of SYNC_LIST) {
//   //       const {data} = yield _this.request.get(API.COMPLATED.SYNC_CHECK)
//   //       const retcode = data.match(/retcode:"(\d+)"/)[1]
        
//   //       if (retcode === 0) {
//   //         _this.API.reset()
//   //       }
//   //     }

//   //   })
//   // }

//   login() {
//     const _this = this

//     return co(function* () {

//       log('login')
//       const uuid = yield _this.fetchUUID()
//       log('uuid: ' + uuid)

//       const logind_qrcode = yield _this.generateQrcode(uuid)
//       log('qrcode_url: ' + logind_qrcode.url)
//       log('qrcode: \n' + logind_qrcode.code)

//       log('waiting for scan qrcode...')
//       yield redirect_uri = yield _this.waitingForLogin(uuid)

//       log('get tickets: ')
//       const tickets = yield _this.fetchTickets()

//       // _this.uuid = uuid
//       // _this.tickets = tickets

//       // init config
//       log('login success: ')
//       const deviceid = 'e' + Math.random().toFixed(15).toString().substring(2, 17) 
//       // _this.config = {
//       //   uuid, 
//       //   deviceid,
//       //   pass_ticket: tickets.pass_ticket,
//       //   uin: tickets.wxuin,
//       //   sid: tickets.wxsid,
//       //   skey: tickets.skey,
//       //   BaseRequest: {
//       //     Uin: tickets.wxuin,
//       //     Sid: tickets.wxsid,
//       //     Skey: tickets.skey,
//       //     DeviceID: deviceid
//       //   }
//       // }

//       // log('init API')
//       // _this.initAPI(url.parse(redirect_uri).host)

//     })
//   }

// }