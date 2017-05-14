'user strict'

const {HOST, BASE_HOST} = require('./constrains')
 
class Constrains {
  constructor(wx_host = BASE_HOST) {
    this.init(wx_host)
  }

  init(wx_host) {
    const [login_host, file_host, sync_host] =
      HOST[Object.keys(HOST).find(tail => wx_host.includes(tail)) || '*']

    this.wx_host = wx_host
    this.file_host = file_host
    this.sync_host = sync_host

    this.qrcode = "https://login.weixin.qq.com/l/"
    this.qrcode_img = "https://login.weixin.qq.com/qrcode/"
    this.jslogin = "https://" + login_host + "/jslogin"
    this.login = "https://" + login_host + "/cgi-bin/mmwebwx-bin/login"
    this.synccheck = "https://" + sync_host + "/cgi-bin/mmwebwx-bin/synccheck"
    this.webwxdownloadmedia = "https://" + file_host + "/cgi-bin/mmwebwx-bin/webwxgetmedia"
    this.webwxuploadmedia = "https://" + file_host + "/cgi-bin/mmwebwx-bin/webwxuploadmedia"
    this.webwxpreview = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxpreview"
    this.webwxinit = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxinit"
    this.webwxgetcontact = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetcontact"
    this.webwxsync = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsync"
    this.webwxbatchgetcontact = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxbatchgetcontact"
    this.webwxgeticon = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgeticon"
    this.webwxsendmsg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendmsg"
    this.webwxsendmsgimg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendmsgimg"
    this.webwxsendmsgvedio = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendvideomsg"
    this.webwxsendemoticon = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendemoticon"
    this.webwxsendappmsg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendappmsg"
    this.webwxgetheadimg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetheadimg"
    this.webwxgetmsgimg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetmsgimg"
    this.webwxgetmedia = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetmedia"
    this.webwxgetvideo = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetvideo"
    this.webwxlogout = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxlogout"
    this.webwxgetvoice = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxgetvoice"
    this.webwxupdatechatroom = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxupdatechatroom"
    this.webwxcreatechatroom = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxcreatechatroom"
    this.webwxstatusnotify = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxstatusnotify"
    this.webwxcheckurl = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxcheckurl"
    this.webwxverifyuser = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxverifyuser"
    this.webwxfeedback = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsendfeedback"
    this.webwxreport = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxstatreport"
    this.webwxsearch = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxsearchcontact"
    this.webwxoplog = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxoplog"
    this.checkupload = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxcheckupload"
    this.webwxrevokemsg = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxrevokemsg"
    this.webwxpushloginurl = "https://" + wx_host + "/cgi-bin/mmwebwx-bin/webwxpushloginurl"

  }
}

module.exports = Constrains