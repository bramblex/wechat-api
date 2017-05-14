
'use strict'

const request = require('request-promise-native')
const FileCookieStore = require('tough-cookie-filestore')

const mime = require('mime-types')
const fs = require('mz/fs')
const path = require('path')
const mkdirp = require('mkdirp')
const EventEmitter = require('events')
const vsprintf = require('sprintf-js').vsprintf

const { CODES, API, HOST, LANG, APPID, SPECIAL_ACCOUNTS, BASE_HOST} = require('./constrains')
const utils = require('./utils')

class WeChatAPI extends EventEmitter {
  constructor (prefix = '/tmp/wechat') {
    super()

    // 设备号
    this.device_id = utils.makeDeviceID()

    // 存储信息
    this.prefix = prefix
    this.cookie_path = path.join(prefix, 'cookie.json')
    this.tickets_path = path.join(prefix, 'tickets.json')
    this.last_sync_path = path.join(prefix, 'last_sync.json')
    this.media_path = path.join(prefix, 'media')

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
    // this.contacts = null

    // hosts
    this.wx_host = null
    this.login_host = null
    this.file_host = null
    this.sync_host = null
    this.API = null

    // requests
    this.request = null
    this.cookie_jar = null

    // media
    this._media_id_ = 0
  }

  async init() {
    this._debug_('初始化微信')

    try {
      await fs.access(this.prefix, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK)
    } catch (e) {
      await new Promise((resolve, reject) =>
        mkdirp(this.prefix, err => err ? reject(err) : resolve())
      )
      // this._throw_(new Error(`路径 ${this.prefix} 不能存在或不能读写`))
    }

    try {
      this._debug_(`尝试从文件恢复: ${this.tickets_path}`)
      const config = await utils.readJsonFile(this.tickets_path)
      const last_sync = await utils.readJsonFile(this.last_sync_path)
      if ((utils.now() - last_sync) / 1000 > 60) {
        this._debug_('初始化信息已过期, 跳过')
      } else {
        for (let key in config) {
          this[key] = config[key]
        }
        this._debug_('恢复成功')
      }
    } catch (e) {
      this._debug_('未恢复成功，跳过')
    }

    this._initWxHost_(this.wx_host || BASE_HOST)
    await utils.touch(this.cookie_path)
    this._initRequest_(this.cookie_path)
  }

  _initWxHost_ (wx_host) {
    const [login_host, file_host, sync_host] = 
      HOST[Object.keys(HOST).find(tail => wx_host.includes(tail)) || '*']

    this.wx_host = wx_host
    this.file_host = file_host
    this.sync_host = sync_host
    this.API = API(wx_host, login_host, file_host, sync_host)
  }

  _initRequest_ (cookie_path) {
    this.cookie_jar = request.jar(new FileCookieStore(cookie_path))
    this.request = request.defaults({
      jar: this.cookie_jar, timeout: 35e3, json: true,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        'Referer': 'https://wx2.qq.com/',
      },
      rejectUnauthorized: false
    })
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

  async _get_(uri, params = {}, retry = 3) {
    const data = await this.request.get({ uri, qs: params })
    this._log_('api', ['GET', uri, params, data])
    return data
  }

  async _post_(uri, params = {}, body = {}, retry = 3) {
    const data = await this.request.post({ uri, body, qs: params, })
    // const { data } = await this.request.post(url, body, { params })
    this._log_('api', ['POST', uri, params, body, data])
    return data
  }

  // @TODO:
  async _download_ (uri, params = {}, path, retry = 3) {
    // const data = await this.request.get({uri})
  }

  _baseRequest_ () {
    return {
      Uin: parseInt(this.uin, 10),
      Sid: this.sid,
      Skey: this.skey,
      DeviceID: this.device_id
    }
  }

  _isBaseResponseErr_ (result) {
    return !result || !result.BaseResponse || result.BaseResponse.Ret !== 0
  }

  _synckey_ () {
    return this.synckey.List.map(({Key, Val}) => Key + '_' + Val).join('|')
  }

  async getUUID () {
    // 获取用于登录的 uuid
    this._debug_(`获取uuid`)
    const data = await this._get_(
      this.API.jslogin,
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

    const qrcode_img = this.API.qrcode_img + this.uuid
    const qrcode_content = this.API.qrcode + this.uuid
    const qrcode = await utils.makeQrcode(qrcode_content)

    this._debug_('qrcoe_img: ' + qrcode_img)
    this._debug_('qrcode_content: ' + qrcode_content)
    this._debug_('\n' + qrcode)

    // this.emit('qrcode', {url: qrcode_img, qrcode})
    return {url: qrcode_img, qrcode}
  }

  async waitForLogin(tip = 1) {
    // 等待二维码扫描登录
    // tip 
    //      1: 等待扫描
    //      0: 等待点击登录
    this._debug_('开始等待扫描登录')
    while (true) {
      const data = await this._get_(
        this.API.login,
        { tip: tip, uuid: this.uuid, _: utils.now() }
      )
      const result = utils.parseJsData(data)
      const code = result['window.code']

      if (code === 201) {
        this._debug_('已扫描，等待点击登录')
        await utils.sleep(3)
      } else if (code === 200) {
        this.redirect_uri = result['window.redirect_uri'] + '&fun=new'
        this._initWxHost_(utils.getHost(this.redirect_uri))
        this._debug_('已点击登录，登录 url :' + this.redirect_uri)
        break;
      } else if (code === 408) {
        // this._throw_(new Error('等待登录超时: 408'))
        this._debug_('检查登录超时，继续等待')
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


    this._debug_('写入登录信息')
    await utils.writeJsonFile(this.tickets_path, {
      wx_host: this.wx_host,
      skey: this.skey,
      sid: this.sid,
      uin: this.uin,
      pass_ticket: this.pass_ticket
    })

    this._debug_(`登录成功
      skey: ${this.skey}
      sid: ${this.sid}
      uin: ${this.uin}
      pass_ticket: ${this.pass_ticket}
    `)
  }

  async webwxpushloginurl() {
    this._debug_('尝试绑定登录')
    const result = await this._get(this.API.webwxpushloginurl, {
      uin: this.uin
    })
    const {ret , uuid} = utils.parseJsData(result)
    if (ret !== 0) {
      this._throw_(new Error('绑定登录失败'))
    }
    return uuid
  }

//   def webwxpushloginurl(self, uin):
// """
//         @brief      push a login confirm alert to mobile device
//         @param      uin   String
//         @return     dic   Dict
//         """
//         url = self.wx_conf['API_webwxpushloginurl'] + '?uin=%s' % uin
//         dic = eval(get(url))
// return dic

  async webwxinit () {
    // 微信初始化，掉线后 300 秒内可以用此 api 登录
    // 获取的联系人和群 ID 不变
    this._debug_('初始化微信')
    const result = await this._post_(
      this.API.webwxinit,
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

    await utils.writeJsonFile(this.last_sync_path, utils.now())
    return this.user
  }

  async webwxstatusnotify () {
    // 通知手机网页成功
    this._debug_('通知手机登录')
    const result = await this._post_(
      this.API.webwxstatusnotify,
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
      this.API.webwxgetcontact,
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

    this._debug_(`通讯录获取成功
      全部成员数: ${result.MemberList.length}
      公众号账号数: ${this.contacts.publics.length}
      特殊账号数: ${this.contacts.specials.length}
      通讯录好友数： ${this.contacts.friends.length}
      保存的群数: ${this.contacts.groups.length}
    `)
    return contacts
  }

  async webwxbatchgetcontact(id_list) {
    // 获取群信息
    this._debug_(`获取群 ${id_list.join(',')} 信息`)

    const result = await this._post_(
      this.API.webwxbatchgetcontact,
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
      this.API.synccheck,
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
    await utils.writeJsonFile(this.last_sync_path, utils.now())
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
      this.API.webwxsync,
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
    const clientMsgId = utils.createMsgID()
    const result = await this._post_(
      this.API.webwxsendmsg,
      {pass_ticket: this.pass_ticket},
      {
        BaseRequest: this._baseRequest_(),
        Msg: {
          Type: CODES.MSGTYPE_TEXT,
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


// @TODO:
  async webwxuploadmedia(file_path) {
    this._debug_(`上传图片 ${file_path}`)

    const stats = await fs.stat(file_path)
    const id = `WU_FILE_${this._media_id_++}`
    const filename = path.basename(file_path)
    const mime_type = mime.lookup(filename) || 'text/plain'
    const media_type = mime_type.includes('image') ? 'pic' : 'doc'
    const size = stats.size
    const last_modified_date = stats.mtime.toString()
    const webwx_data_ticket = this.cookie_jar
      .getCookies(`https://${this.wx_host}`)
      .find(cookie => cookie.key === 'webwx_data_ticket')
      .value

    const headers = {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
      'Connection': 'keep-alive',
      'Host': this.file_host,
      'Origin': 'https://' + this.wx_host,
      'Referer': 'https://' + this.wx_host
    }

    const formData = {
      id: id,
      name: filename,
      type: mime_type,
      lastModifiedDate: last_modified_date,
      size: size,
      mediatype: media_type,
      uploadmediarequest: JSON.stringify({
        "BaseRequest": this._baseRequest_(),
        "ClientMediaId": utils.createMsgID(),
        "TotalLen": size,
        "StartPos": 0,
        "DataLen": size,
        "MediaType": CODES.UPLOAD_MEDIA_TYPE_ATTACHMENT
      }),
      webwx_data_ticket: webwx_data_ticket,
      pass_ticket: this.pass_ticket,
      filename: {
        value: fs.createReadStream(file_path),
        options: {
          filename: filename,
          contentType: mime_type
        }
      }
    }

    const uri = this.API.webwxuploadmedia
    const params = { f: 'json' }

    const result = await this.request.post({
      uri, qs: params, formData, headers
    })

    this._log_('api',
      ['UPLOAD', uri, qs, formData, result]
    )

    if (this._isBaseResponseErr_(result)) {
      this._throw_(new Error('上传文件失败'))
    }

    return result.MediaId
  }

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

}

module.exports = WeChatAPI