'use strcit'

const EventEmitter = require('events')
const fs = require('mz/fs')
const paht = require('path')
const mime = require('mime-types')

const utils = require('./utils')

const Constrains = require('./wechat-api-constrains')
const Store = require('./wechat-api-store')
const Request = require('./wechat-api-request.js')
const Contact = require('./wechat-api-contact')

const { APPID, LANG, CODES } = require('./constrains')

module.exports = class WechatAPI {
  constructor(root_path = '/tmp/wechat') {

    // 设定存储路径
    this.root_path = root_path

    // 设备 ID
    this.device_id = utils.makeDeviceID()

    // 初始化各种 API 地址
    this.cons = new Constrains()

    // 初始化 API 存储
    this.store = new Store(this.root_path)

    // 初始化 request
    this.req = new Request(this.store.getCookiePath())

    // 保存登录信息
    this.tickets = {
      skey: null,
      sid: null,
      uin: null,
      pass_tickets: null
    }

    // 存储登录后的用户信息
    this.me = null

    // 存储通讯录信息
    this.contacts = new Contact()

    // 用于
    this.synckey_dict = null

    // tmp
    this._upload_media_id_ = 0
  }

  get baserequest() {
    const t = this.tickets
    return {
      Uin: parseInt(t.uin, 10),
      Sid: t.sid,
      Skey: t.skey,
      DeviceID: this.device_id
    }
  }

  get synckey() {
    return this
      .synckey_dict
      .List
      .map(({ Key, Val }) => Key + '_' + Val).join('|')
  }

  _isResFail_(result) {
    return !result || !result.BaseResponse || result.BaseResponse.Ret !== 0
  }

  async init() {
    await this.store.init()
    this.req.init()
  }

  // 获取登陆二维码 url
  qrcode(uuid) {
    return utils.makeQrcode(this.cons.qrcode + uuid)
  }

  // 获取登陆二维码图片 (字符版本)
  qrcode_img(uuid) {
    return this.cons.qrcode_img + uuid
  }

  async jslogin() {
    // 获取微信登录的 uuid
    const data = await this.req.get(
      this.cons.jslogin,
      { appid: APPID, fun: 'new', lang: LANG, _: utils.now() }
    )
    const result = utils.parseJsData(data)
    return {
      code: result['window.QRLogin.code'],
      uuid: result['window.QRLogin.uuid'] || null
    }
  }

  webwxpushloginurl() {
    // 绑定登陆，不需要扫描二维码
    return this.req.get(
      this.cons.webwxpushloginurl,
      { uin: this.tickets.uin }
    )
  }

  async logincheck(uuid, tip = 1) {
    // 获取登陆状态，并获取登陆用 uri
    // tip - 1: 等待扫描; 0: 等待点击登录
    const data = await this.req.get(
      this.cons.login,
      { tip, uuid, _: utils.now() }
    )
    const result = utils.parseJsData(data)
    return {
      code: result['window.code'],
      redirect_uri: result['window.redirect_uri'] || null
    }
  }

  async restore() {
    // 从存储中获取登录信息
    // try {
      const { wx_host, tickets, lastsync, device_id } = await this.store.readTickets()
      Object.assign(this.tickets, tickets)
      this.device_id = device_id || this.device_id
      if (wx_host) {
        this.cons.init(wx_host)
      }
      return lastsync
    // } catch (err) {
    //   return 0
    // }
  }

  async login(redirect_uri) {
    // 用 redirect_uri 登陆，并且初始化 API 存储 tickets
    const wx_host = utils.getHost(redirect_uri)
    const data = await this.req.get(redirect_uri + '&fun=new')
    const {error} = await utils.parseXml(data)

    this.cons.init(wx_host)

    if (parseInt(error.ret[0]) !== 0) {
      throw new Error('登陆失败')
    }

    this.tickets = {
      skey: error.skey[0],
      sid: error.wxsid[0],
      uin: error.wxuin[0],
      pass_tickets: error.pass_ticket[0]
    }

    this.store.writeTickets(this.device_id, wx_host, this.tickets)
  }

  async webwxinit() {
    // 微信初始化，用 tickets 来初始化获取 synckey
    // 掉线 300 秒内可以用词 api 恢复
    const t = this.tickets
    const result = await this.req.post(
      this.cons.webwxinit,
      {pass_tickets: t.pass_tickets, skey: t.skey},
      { BaseRequest: this.baserequest}
    )

    if (this._isResFail_(result)) {
      throw new Error('微信初始化失败')
    }

    this.me = result.User
    this.synckey_dict = result.SyncKey
    this.store.writeLastsync()
  }

  async webwxstatusnotify() {
    // 通知手机已经登录成功
    const result = await this.req.post(
      this.cons.webwxstatusnotify,
      {lang: LANG, pass_tickets: this.tickets.pass_tickets},
      {
        BaseRequest: this.baserequest,
        Code: 3,
        FromUserName: this.me.UserName,
        ToUserName: this.me.UserName,
        ClientMsgId: utils.createMsgID()
      }
    )
    if (this._isResFail_(result)) {
      throw new Error('通知手机登录错误')
    }
  }

  async synccheck() {
    // 同步检查
    // retocde: 0, 1100, 1101, 1102
    // selector: 0, 2, 3, 7
    const t = this.tickets
    const data = await this.req.get(
      this.cons.synccheck,
      {
        r: utils.now(),
        sid: t.sid,
        uin: t.uin,
        skey: t.skey,
        deviceid: this.device_id,
        synckey: this.synckey,
        _: utils.now()
      }
    )
    const result = utils.parseJsData(data)
    this.store.writeLastsync()
    return {
      retcode: parseInt(result['window.synccheck']['retcode']),
      selector: parseInt(result['window.synccheck']['selector'])
    }
  }

  async webwxsync() {
    // 获取消息
    const t = this.tickets
    const result = await this.req.post(
      this.cons.webwxsync,
      {sid: t.sid, skey: t.skey, pass_ticket: t.pass_ticket},
      {BaseRequest: this.baserequest, SyncKey: this.synckey_dict, rr:~utils.now()}
    )
    if (this._isResFail_(result)) {
      throw new Error('获取消息失败')
    }

    this.synckey_dict = result.SyncKey
    return result
  }

  async webwxsendmsg(text, to='filehelper') {
    const msg_id = utils.createMsgID()
    const result = await this.req.post(
      this.cons.webwxsendmsg,
      {pass_tickets: this.tickets.pass_tickets},
      {
        BaseRequest: this.baserequest,
        Msg: {
          Type: CODES.MSGTYPE_TEXT,
          Content: text,
          FromUserName: this.me.UserName,
          ToUserName: to,
          LocalID: msg_id,
          ClientMsgId: msg_id
        }
      }
    )
    if (this._isResFail_(result)) {
      throw new Error('消息发送失败')
    }
  }

  async webwxsendmsgimg(media_id, to = 'filehelper') {
    const msg_id = utils.createMsgID()
    const result = await this.req.post(
      this.cons.webwxsendmsgimg,
      { fun: 'async', f: 'json', pass_tickets: this.tickets.pass_tickets },
      {
        BaseRequest: this.baserequest,
        Msg: {
          Type: CODES.MSGTYPE_IMAGE,
          MediaId: media_id,
          FromUserName: this.me.UserName,
          ToUserName: to,
          LocalID: msg_id,
          ClientMsgId: msg_id
        }
      }
    )
    if (this._isResFail_(result)) {
      throw new Error('消息发送失败')
    }
  }

  async webwxuploadmedia(file_path) {
    const stats = await fs.stat(file_path)
    const id = `WU_FILE_${this._upload_media_id_++}`
    const filename = path.basename(file_path)
    const mime_type = mime.lookup(filename) || 'text/plain'
    const media_type = mime_type.includes('image') ? 'pic' : 'doc'
    const size = stats.size
    const last_modified_date = stats.mtime.toString()
    const webwx_data_ticket = this.req.getCookies(`https://${this.cons.wx_host}`, 'webwx_data_ticket')

    const headers = {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
      'Connection': 'keep-alive',
      'Host': this.cons.file_host,
      'Origin': 'https://' + this.cons.wx_host,
      'Referer': 'https://' + this.cons.wx_host
    }

    const formData = {
      id: id,
      name: filename,
      type: mime_type,
      lastModifiedDate: last_modified_date,
      size: size,
      mediatype: media_type,
      uploadmediarequest: JSON.stringify({
        "BaseRequest": this.baserequest,
        "ClientMediaId": utils.createMsgID(),
        "TotalLen": size,
        "StartPos": 0,
        "DataLen": size,
        "MediaType": CODES.UPLOAD_MEDIA_TYPE_ATTACHMENT
      }),
      webwx_data_ticket: webwx_data_ticket,
      pass_ticket: this.tickets.pass_ticket,
      filename: {
        value: fs.createReadStream(file_path),
        options: {
          filename: filename,
          contentType: mime_type
        }
      }
    }

    const params = { f: 'json' }
    const result = await this.req.upload(
      this.cons.webwxuploadmedia,
      headers, params, formData
    )

    if (this._isResFail_(result)) {
      throw new Error('上传文件失败')
    }

    return result
  }

  async webwxgetcontact() {
    // 获取联系人列表，所有联系人何保存在通讯录的群
    const result = await this.req.post(
      this.cons.webwxgetcontact,
      { pass_ticket: this.pass_ticket, skey: this.skey, r: utils.now() }
    )

    if (this._isResFail_(result)) {
      throw new Error('获取联系人列表错误 ')
    }

    this.contacts.init(this.me, result)
    return this.contacts
  }

  async webwxbatchgetcontact(id_list) {
    // 获取群信息
    const result = await this.req.post(
      this.cons.webwxbatchgetcontact,
      { type: 'ex', r: utils.now() },
      {
        BaseRequest: this.baserequest(),
        Count: id_list.length,
        List: id_list.map(gid => ({ UserName: gid, EncryChatRoomId: '' }))
      }
    )

    if (this._isResFail_(result)) {
      throw new Error('获取群信息错误')
    }

    return result
  }

  // ============================
  // @TODO:
  //    这下面属于基本功能，但是没时间做

  async webwxdownloadmedia() {
  }

  async webwxgetmsgimg() {
  }

  async webwxupdatechatroom() {
  }

  async webwxcreatechatroom() {
  }

  async webwxverifyuser() {
  }

  // ============================================
  // @TODO:
  //    这下面的看着慢慢做，不急，不是主要功能

  async webwxsendmsgvedio() {
  }

  async webwxsendemoticon() {
  }

  async webwxsendappmsg() {
  }

  async webwxgetheadimg() {
  }

  async webwxgetmedia() {
  }

  async webwxgetvideo() {
  }

  async webwxgetvoice() {
  }

  async webwxgeticon() {
  }

  async webwxlogout() {
  }

  async webwxcheckurl() {
  }

  async webwxfeedback() {
  }

  async webwxpreview() {
  }

  async webwxreport() {
  }

  async webwxsearch() {
  }

  async webwxoplog() {
  }

  async checkupload() {
  }

  async webwxrevokemsg() {
  }

}