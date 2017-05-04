
'use strict'

  /* 
     @TODO:

     webwxgetmsgimg
     webwxgetvoice
     webwxgetvideo
     webwxgeticon
     webwxgetheadimg

     webwxuploadmedia
     webwxsendmsgimg
     webwxsendemoticon
     webwxsendappmsg
     webwxcreatechatroom
     webwxupdatechatroom
     webwxrevokemsg
     webwxpushloginurl
     association_login

     send_text
     send_img
     send_emot
     send_file
     revoke_msg

     get_user_by_id
     get_group_user_by_id
     get_group_by_id
     get_user_id
  */

const http = require('http')
const https = require('https')
const axios = require('axios')
const tough = require('tough-cookie')
const EventEmitter = require('events')
const axiosCookieJarSupport = require('node-axios-cookiejar')
const vsprintf = require('sprintf-js').vsprintf

const { CODES, API, HOST, LANG, APPID, SPECIAL_ACCOUNTS, BASE_HOST} = require('./constrains')
const utils = require('./utils')

class WeChatAPI extends EventEmitter {
  constructor (wx_host = BASE_HOST) {
    super()

    // 停止信号
    this.stop_singal = false
    this.stop_callback = null

    // 设备号
    this.device_id = utils.makeDeviceID()

    // 登录信息
    this.uuid = null
    this.redirect_uri = null

    this.skey = null
    this.sid = null
    this.uin = null
    this.pass_ticket = null

    this.synckey = null

    // 用户信息
    this.user = null

    // 联系人
    this.contacts = null

    // hosts
    this.wx_host = null
    this.login_host = null
    this.file_host = null
    this.sync_host = null
    this.API = null
    this._setWxHost_(wx_host)

    // requests
    this.request = null
    this._initRequest_()
  }

  _setWxHost_ (wx_host) {
    // const [login_host, file_host, sync_host] = HOST[wx_host] || HOST['*']

    const [login_host, file_host, sync_host] = 
      HOST[Object.keys(HOST).find(tail => wx_host.includes(tail)) || '*']

    this.wx_host = wx_host
    this.file_host = file_host
    this.sync_host = sync_host
    this.api = API(wx_host, login_host, file_host, sync_host)
  }

  _initRequest_ () {
    const jar = new tough.CookieJar()
    const request = axios.create({
      timeout: 35e3,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        'Referer': 'https://wx2.qq.com/',
      },
      jar,
      withCredentials: true,
      xsrfCookieName: null,
      xsrfHeaderName: null,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    })
    axiosCookieJarSupport(request)
    this.request = request
  }

  _log_ (type, data) {
    this.emit('log', {type, data})
  }

  _throw_ (error) {
    this._log_('error', error)
    throw error
  }

  _debug_ (data) {
    this._log_('debug', data)
  }

  async _get_ (url, params = {}) {
    const { data } = await this.request.get(url, { params })
    this._log_('api', ['GET', url, params, data])
    return data
  }

  async _post_ (url, params = {}, body = {}) {
    const { data } = await this.request.post(url, body, { params })
    this._log_('api', ['POST', url, params, body, data])
    return data
  }

  _baseRequest_ () {
    return {
      Uin: parseInt(this.uin, 10),
      Sid: this.sid,
      Skey: this.skey,
      DeviceID: this.device_id
    }
  }

  _synckey_ () {
    return this.synckey.List.map(({Key, Val}) => Key + '_' + Val).join('|')
  }

  async getUUID () {
    // 获取用于登录的 uuid
    this._debug_(`获取uuid`)
    const data = await this._get_(
      this.api.jslogin,
      { appid: APPID, fun: 'new', lang: LANG, _: utils.now() }
    )
    const result = utils.parseJsData(data)

    if (result['window.QRLogin.code'] !== 200)
      this._throw_(new Error(`获取 uuid 错误, 状态码 ${result['window.QRLogin.code']}`))

    this.uuid = result['window.QRLogin.uuid']
    this._debug_(`uuid: ${this.uuid}`)
  }

  async genQrcode () {
    // 用 uuid 生成二维码链接和二维码图片
    this._debug_ ('生成二维码')

    const qrcode_img = this.api.qrcode_img + this.uuid
    const qrcode_content = this.api.qrcode + this.uuid
    const qrcode = await utils.makeQrcode(qrcode_content)

    this._debug_('qrcoe_img: ' + qrcode_img)
    this._debug_('qrcode_content: ' + qrcode_content)
    this._debug_('\n' + qrcode)

    this.emit('qrcode', {url: qrcode_img, qrcode})
  }

  async waitForLogin(tip = 1) {
    // 等待二维码扫描登录
    // tip 
    //      1: 等待扫描
    //      0: 等待点击登录
    this._debug_('开始等待扫描登录')
    while (true) {
      const data = await this._get_(
        this.api.login,
        { tip: tip, uuid: this.uuid, _: utils.now() }
      )
      const result = utils.parseJsData(data)
      const code = result['window.code']

      if (code === 201) {
        this._debug_('已扫描，等待点击登录')
        await utils.sleep(3)
      } else if (code === 200) {
        this.redirect_uri = result['window.redirect_uri'] + '&fun=new'
        this._setWxHost_(utils.getHost(this.redirect_uri))
        this._debug_('已点击登录，登录 url :' + this.redirect_uri)
        break;
      } else if (code === 408) {
        this._throw_(new Error('等待登录超时: 408'))
      } else {
        this._throw_(new Error(`未知等待登录错误: ${code}`))
      }
    }
  }

  async login () {
    this._debug_('登录中...')
    const data = await this._get_(this.redirect_uri)
    const {error} = await utils.parseXml(data)

    if (error.ret[0] !== '0') {
      this._throw_(new Error('未知登录错误, 错误码: ' + error.ret))
    }

    this.skey = error.skey[0]
    this.sid = error.wxsid[0]
    this.uin = error.wxuin[0]
    this.pass_ticket = error.pass_ticket[0]

    this._debug_(`登录成功
      skey: ${this.skey}
      sid: ${this.sid}
      uin: ${this.uin}
      pass_ticket: ${this.pass_ticket}
    `)
  }

  async webwxinit () {
    // 微信初始化，掉线后 300 秒内可以用此 api 登录
    // 获取的联系人和群 ID 不变
    this._debug_('初始化微信')
    const result = await this._post_(
      this.api.webwxinit,
      { pass_ticket: this.pass_ticket, skey: this.skey },
      { BaseRequest: this._baseRequest_() }
    )

    if (result.BaseResponse.Ret !== 0) 
      this._throw_(new Error('初始化微信错误，错误码: ' + result.BaseResponse.Ret))

    this.user = result.User

    this.synckey = result.SyncKey

    this._debug_(`初始化成功
      user: ${this.user},
      synckey: ${this.sync_key},
      synckey_fromted: ${this._synckey_()}
    `)
  }

  async webwxstatusnotify () {
    // 通知手机网页成功
    this._debug_('通知手机登录')
    const result = await this._post_(
      this.api.webwxstatusnotify,
      {lang: LANG, pass_ticket: this.pass_ticket},
      {
        BaseRequest: this._baseRequest_(),
        Code: 3,
        FromUserName: this.user.UserName,
        ToUserName: this.user.UserName,
        ClientMsgId: utils.now()
      }
    )

    if (result.BaseResponse.Ret !== 0) {
      this._throw_(new Error('通知手机登录错误，错误码: ' + result.BaseResponse.Ret))
    }
  }

  async webwxgetcontact() {
    // 获取联系人列表
    this._debug_('获取联系人列表')
    const result = await this._post_(
      this.api.webwxgetcontact,
      {pass_ticket: this.pass_ticket, skey: this.skey, r: utils.now()}
    )

    if (result.BaseResponse.Ret !== 0) {
      this._throw_(new Error('获取联系人列表错误，错误码: ' + result.BaseResponse.Ret))
    }

    const contacts = {
      friends: [],
      specials: [],
      publics: [],
      groups: []
    }

    for (let member of result.MemberList) {
      if (member.VerifyFlag & 8 != 0) {
        contacts.specials.push(member)
      } else if (SPECIAL_ACCOUNTS.indexOf(member.UserName) >= 0) {
        contacts.specials.push(member)
      } else if (/^@@/.test(member.UserName)) {
        contacts.groups.push(member)
      } else {
        contacts.friends.push(member)
      }
    }

    this.contacts = contacts
    this._debug_(`通讯录获取成功
      全部成员数: ${result.MemberList.length}
      公众号账号数: ${this.contacts.publics.length}
      特殊账号数: ${this.contacts.specials.length}
      通讯录好友数： ${this.contacts.friends.length}
      保存的群数: ${this.contacts.groups.length}
    `)
  }

  async webwxbatchgetcontact(id_list) {
    // 获取群信息
    this._debug_(`获取群 ${id_list.join(',')} 信息`)

    const result = await this._post_(
      this.api.webwxbatchgetcontact,
      {type: 'ex', r: utils.now()},
      {
        BaseRequest: this._baseRequest_(),
        Count: id_list.length, 
        List: id_list.map(gid => ({UserName: gid, EncryChatRoomId: ''}))
      }
    )

    if (result.BaseResponse.Ret !== 0) {
      this._throw_(new Error('获取群信息错误，错误码: ' + result.BaseResponse.Ret))
    }

    this._debug_(`获取群信息成功: ${JSON.stringify(result.ContactList)}`)
    return result.ContactList
  }

  async synccheck() {
    /* 同步检查
       retcode: 
        0 正常
        1100 登出
        1101 在其他地方登录

       selector:
        0 正常
        2 消息
        6 未知
        7 webwxsync同步
    */
    this._debug_('同步检查')
    const data = await this._get_(
      this.api.synccheck,
      {
        r: utils.now(),
        sid: this.sid,
        uin: this.uin,
        skey: this.skey,
        deviceid: this.device_id,
        synckey: this._synckey_(),
        _: utils.now()
      }
    )

    const result = utils.parseJsData(data)
    this._debug_('同步检查结果: ' + JSON.stringify(result['window.synccheck']))
    return {
      retcode: parseInt(result['window.synccheck']['retcode']),
      selector: parseInt(result['window.synccheck']['selector'])
    }
  }

  async webwxsync () {
    // 同步消息
    this._debug_('同步微信消息')
    const result = await this._post_(
      this.api.webwxsync,
      {sid: this.sid, skey: this.skey, pass_ticket: this.pass_ticket},
      {BaseRequest: this._baseRequest_(), SyncKey: this.synckey, rr: ~utils.now()}
    )

    if (result.BaseResponse.Ret !== 0) {
      this._throw_(new Error('同步消息错误，错误码: ' + result.BaseResponse.Ret))
    }

    this.synckey = result.SyncKey
    return result
  }

  async webwxsendmsg (text, to='filehelper') {
    this._debug_(`发送消息 ${JSON.stringify(text)} 给 ${to}`)
    const clientMsgId = (+new Date + Math.random().toFixed(3)).replace('.', '')
    const result = await this._post_(
      this.api.webwxsendmsg,
      {pass_ticket: this.pass_ticket},
      {
        BaseRequest: this._baseRequest_(),
        Msg: {
          Type: 1,
          Content: text,
          FromUserName: this.user.UserName,
          ToUserName: to,
          LocalID: clientMsgId,
          ClientMsgId: clientMsgId,
        }
      }
    )
    if (result.BaseResponse.Ret !== 0) {
      this._throw_(new Error('发送消息失败'))
    }
  }

  async start () {
    this.stop_singal = false
    // this.stop_promise = new Promise

    await this.getUUID()
    await this.genQrcode()
    await this.waitForLogin()
    await this.login()
    await this.webwxinit()
    await this.webwxstatusnotify()
    // await this.webwxgetcontact()
    await this.webwxsendmsg('我登录啦')

    while (!this.stop_singal) {
      const result = await this.synccheck()

      if (result.retcode !== 0) {
        if (result.retcode === 1100) {
          this._throw_(new Error('已登出'))
        } else if (result.retcode === 1101) {
          this._throw_(new Error('在其他地方登录'))
        } else {
          this._throw_(new Error('未知错误: '+result.retcode))
        }
      } 

      if (result.selector === 2) {
        const result = await this.webwxsync()
        this._debug_(`收到消息: ${result.AddMsgList}`)
        for (let msg of result.AddMsgList) {
          if (msg.FromUserName === this.user.UserName) {
            this.emit('command', msg)
          } else {
            this.emit('message', msg)
          }
        }
      }

      await utils.sleep(3)
    }
    this.stop_callback()
  }

  async stop () {
    this.stop_singal = true
    await new Promise(resolve => {
      this.stop_callback = resolve
    })
  }

}

module.exports = WeChatAPI