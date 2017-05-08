'use strict'

const EventEmitter = require('events')
const WeChatApi = require('./wechat-api')
const utils = require('./utils')

class WeChat extends EventEmitter {

  static compose(middlewares) {
    return [...middlewares, ctx => ctx].reduce((left, right) =>
      (ctx, next) => left(ctx, () => right(ctx, next)))
  }

  constructor (config) {
    super()
    const {prefix = '/tmp/wechat'} = config || {}
    
    // create api
    this.api = new WeChatApi(prefix)

    // middlewares
    this.middlewares = []

    // contacts
    this.contacts = null

    // history
    this.history = null

    // stop signal
    this.stop_singal = false
    this.is_running = false
    this.stop_cb = null
  }

  use (middleware) {
    this.middlewares.push(middleware)
    return this
  }

  async start () {
    if (this.is_running) {
      throw new Error('WeChat is already running')
    } else {
      this.is_running = true
      this.stop_singal = false
    }

    // make handler
    const handler = WeChat.compose(this.middlewares)

    const api = this.api
    await api.init()

    if (!api.pass_ticket) {
      await api.getUUID()

      const qrcode = await api.genQrcode()
      this.emit(qrcode, qrcode)

      await api.waitForLogin()
      await api.login()
    }

    const user = await api.webwxinit()
    await api.webwxstatusnotify()

    while (!this.stop_singal) {
      const result = await api.synccheck()

      if (result.retcode !== 0) {
        if (result.retcode === 1100) {
          throw (new Error('已登出'))
        } else if (result.retcode === 1101) {
          throw (new Error('在其他地方登录'))
        } else {
          throw (new Error('未知错误: ' + result.retcode))
        }
      } 

      if (result.selector !== 0) {
        const result = await api.webwxsync()
        for (let msg of [...result.AddMsgList]) {
          handler({msg, user, api})
        }
      }

      await utils.sleep(3)
    }

    this.stop_cb ? this.stop_cb() : void(0)
    this.is_running = false
    this.stop_singal = false
    this.stop_cb = null
  }

  async stop() {
    if (!this.is_running || this.stop_singal === true) {
      throw new Error('WeChat not running')
    }
    this.stop_singal = true
    await new Promise(resolve => {
      this.stop_cb = resolve
    })
  }

} 

module.exports = WeChat