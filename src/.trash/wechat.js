'use strict'


const EventEmitter = require('events')

const {APPID, LANG} = require('./constrains')
const API = require('./api')
const utils = require('./utils')
const CODES = require('./constrains/codes')
const {SYNC_HOST_LIST, SP_ACCOUNTS} = require('./constrains/index')

class WeChat extends EventEmitter {
  constructor () {
    super()
    this.is_runing = false

    this.device_id = utils.makeDeviceID()

    this.user = null
    this.sync_key = null
    this.formated_sync_key = null
    this.uuid = null
    this.tickets = null

    const contacts = null 

    this.api = new API()
    this.log = []

    this.sync_check_timer = null
    this.update_cantact_timer = null
  }

  __writeLog__ (msg) {
    this.log.push([msg, Date()])
  }

  get __base_request__ () {
    return {
      Uin: this.tickets.uin,
      Sid: this.tickets.sid,
      Skey: this.tickets.skey,
      DeviceID: this.device_id
    }
  }

  async __waitingForLogined__ (uuid) {
    let times = 1
    const try_times = 6
    while (true) {

      if (times > try_times) {
        // @TODO: throw error
      }

      const logined_result = await this.api.get('LOGIN.LOGINED', { params: { tip: 1, uuid: uuid, _: utils.now() } })
      const [, logined_code_str] = logined_result.match(/window\.code\s*=\s*(\d+)\s*;/)
      const logined_code = parseInt(logined_code_str)

      if (logined_code === 201) {
        await utils.sleep(3)
      } else if (logined_code === 200) {
        const [, redirect_uri] = logined_result.match(/window.redirect_uri\s*=\s*"(.*)"\s*;/)
        return redirect_uri
      } else if (logined_code === 408) {
        // @TODO: throw error
      } else {
        // @TODO: throw error
      }

      times++
    }
  }

  async __login__ () {
    const uuid_result = await this.api.get('LOGIN.JS_LOGIN', { params: { appid: APPID, fun: 'new', _: utils.now() } })
    const [, uuid] = uuid_result.match(/window\.QRLogin\.uuid\s*=\s*"(.*)"\s*;/)

    // @TODO: check uuid exist
    // const uuid = await this.__fetchUUID__()
    const qrcode = await utils.makeQrcode(this.api.parse(`LOGIN.QRCODE_CONTENT[${uuid}]`))
    this.emit('qrcode', {qrcode, img_url: this.api.parse(`LOGIN.QRCODE[${uuid}]`)})
    const redirect_uri = await this.__waitingForLogined__(uuid)


    this.api.HOST.WEBWX = utils.getHost(redirect_uri)
    const tickets_result = await this.api.rawGet(redirect_uri + '&fun=new')
    const tickets_xml = await utils.parseXml(tickets_result)
    const tickets = {
      skey: tickets_xml.error.skey[0],
      sid: tickets_xml.error.wxsid[0],
      uin: tickets_xml.error.wxuin[0],
      pass_ticket: tickets_xml.error.pass_ticket[0],
    }

    this.uuid = uuid
    this.tickets = tickets
  }

  async __init__ () {
    const data = await this.api.post('WEBWX.INIT', { 
      BaseRequest: this.__base_request__
    }, {
      params: {pass_ticket: this.tickets.pass_ticket, skey: this.tickets.skey}
    })

    if (!data || !data.BaseResponse || data.BaseResponse.Ret !== 0) {
      // @TODO: throw Error
    }

    this.user = data.User
    this.sync_key = data.SyncKey
    this.formated_sync_key = data.SyncKey.List.map((item) => item.Key + '_' + item.Val).join('|')

    // notify mobile
    // @TODO:
    await this.api.post('WEBWX.STATUS_NOTIFY', {
      BaseRequest: this.__base_request__,
      Code: CODES.STATUS_NOTIFY_CODE_INITED,
      FromUserName: this.user.UserName,
      ToUserName: this.user.UserName,
      ClientMsgId: utils.now()
    }, {
      params: {lang: LANG, pass_ticket: this.tickets.pass_ticket}
    })

    // lookup sync check host
    // @TODO:
    for (let host of SYNC_HOST_LIST) {
      this.api.HOST.SYNC = host
      const result = await this.api.get('SYNC.CHECK', {
        params: {
          r: utils.now(),
          skey: this.tickets.skey,
          sid: this.tickets.sid,
          uin: this.tickets.uin,
          deviceid: this.device_id,
          synckey: this.formated_sync_key,
          _: utils.now()
        }
      })

      const retcode = result.match(/retcode:"(\d+)"/)[1];
      if (retcode === '0') return
      // const retcode = data.BaseResponse.Ret
      // console.log(host, retcode)
      // if (retcode === 0) break
    }
  }

  async __initContact__ () {
    const result = await this.api.post('WEBWX.GET_CONTACT', {}, {
      params: {
        pass_ticket: this.tickets.pass_ticket, 
        skey: this.tickets.skey,
        r: utils.now()
      }
    })

    if (!result || !result.BaseResponse || result.BaseResponse !== 0) {
      // @TODO:
    }

    //  通讯录
    const contacts = {
      groups: [],
      frends: [],
      brands: [],
      sps: []
    }
    for (let member of result.MemberList) {
      const username = member.UserName

      if (member.VerifyFlag & CODES.MM_USERATTRVERIFYFALG_BIZ_BRAND) {
        contacts.brands.push(member)
      } else if (SP_ACCOUNTS.includes(member.UserName) || /@qqim$/.test(member.UserName)) {
        contacts.sps.push(member)
      } else if (member.UserName.includes('@@')) {
        contacts.groups.push(member)
      } else {
        contacts.frends.push(member)
      }
    }

    // for (let group of contacts.groups) {
    // }
    this.contacts = contacts
  }

  async __syncCheck__ () {
    while (this.is_runing) {
      const result = await this.api.get('SYNC.CHECK', {
        params: {
          r: utils.now(),
          skey: this.tickets.skey,
          sid: this.tickets.sid,
          uin: this.tickets.uin,
          deviceid: this.device_id,
          synckey: this.formated_sync_key,
          _: utils.now()
        }
      })

      await utils.sleep(3)
    }
  }

  async start () {
    await this.__login__()
    await this.__init__()

    this.is_runing = true
    await this.__initContact__()
    await this.__syncCheck__()
  }

  async stop () {
    this.is_runing = false
  }
}

module.exports = WeChat

    // set host
    // const tickets_result = await this.api.
//     return co(function* () {
//       const {data} = yield _this.request.get(redirect_uri)
//       const result = yield new Promise(resolve => xml2js.parseString(data, (err, r) => resolve(r)))
//       return _.mapValues(result.error, l => l[0])
//     })
    // await this.api.post('WEBWX.STATUS_NOTIFY', {
    //   BaseRequest: this.__base_request__,
    //   Code: CODES.STATUS_NOTIFY_CODE_INITED
    // }, {
    //   params: {lang: LANG, pass_ticket: this.tickets.pass_ticket}
    // })

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