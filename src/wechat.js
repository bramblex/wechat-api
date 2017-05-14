'use strict'

const Middleware = require('./wechat-middleware')
const WechatAPI = require('./wechat-api')

class Wechat extends Middleware {
  constructor (config) {
    super()

    const {
      root_path = '/tmp/wechat'
    } = config || {}

    this.api = new WechatAPI(root_path)

    this.tmp = {}
  }

  _startSyncCheck_ () {
    const api = this.api
    this.tmp.sync_interval = setInterval(async () => {
      const {retcode, selector} = await api.synccheck()
      if (retcode !== 0) {
        const ok = await this.tryRelogin()
      }

      if (selector !== 0) {
        const result = await api.webwxsync()
        this.handle({ messages: result, contacts: api.contacts, api })
      }
    }, 24e3)
  }

  _stopSyncCheck_ () {
    clearInterval(this.tmp.sync_interval)
  }

  async _waitForLogin_ (uuid) {
    let tip = 1
    while (true) {
      const {code, redirect_uri} = await this.api.logincheck(uuid, tip)
      if (code === 201) {
        this.emit('login-confirm')
        tip = 0
      } else if (code === 408) {
        continue
      } else if (code === 200) {
        return redirect_uri
      } else {
        throw new Error('等待登录错误')
      }
    }
  }

  async tryRelogin() {
    try {
      await this.api.webwxinit()
      return true
    } catch (e) {
      return false
    }
  }

  async login () {
    const api = this.api
    const uin = api.tickets.uin

    const push_result = await api.webwxpushloginurl()
    if (push_result.ret === '0') {
      const uuid = push_result.uuid
      this.emit('login-confirm')
      const redirect_uri = await this._waitForLogin_(uuid)
      await this.api.login(redirect_uri)
    } else {
      const { code, uuid } = await api.jslogin()
      if (code !== 200)
        throw new Error('获取 UUID 失败')
      const qrcode_url = api.qrcode_img(uuid)
      const qrcode = await api.qrcode(uuid)
      this.emit('login-qrcode', { qrcode, qrcode_url })
      const redirect_uri = await this._waitForLogin_(uuid)
      await this.api.login(redirect_uri)
    }
    await this.api.webwxinit()
  }

  async start () {
    const api = this.api
    await api.init()
    const lastsync = await api.restore()

    const ok = (new Date() - lastsync < 60e3) && (await this.tryRelogin())

    if (!ok) {
      await this.login()
    }

    await this.api.webwxstatusnotify()
    await this.api.webwxgetcontact()

    this._startSyncCheck_()
  }

  async stop () {
    this._stopSyncCheck_()
  }
}

module.exports = Wechat