
const LOGIN = {
  QRCODE:  '/qrcode/%s',
  QRCODE_CONTENT: '/l/%s',
  JS_LOGIN: '/jslogin',
  LOGINED: '/cgi-bin/mmwebwx-bin/login',
}

const SYNC = {
  CHECK: '/cgi-bin/mmwebwx-bin/synccheck'
}

const FILE = {
  DOWNLOAD_MEDIA: '/cgi-bin/mmwebwx-bin/webwxgetmedia',
  UPLOAD_MEDIA: '/cgi-bin/mmwebwx-bin/webwxuploadmedia',
}

const WEBWX = {
  PREVIEW: '/cgi-bin/mmwebwx-bin/webwxpreview',
  INIT: '/cgi-bin/mmwebwx-bin/webwxinit',
  GET_CONTACT: '/cgi-bin/mmwebwx-bin/webwxgetcontact',
  SYNC: '/cgi-bin/mmwebwx-bin/webwxsync',
  BATCH_GET_CONTACT: '/cgi-bin/mmwebwx-bin/webwxbatchgetcontact',
  GET_ICON: '/cgi-bin/mmwebwx-bin/webwxgeticon',
  SEND_MSG: '/cgi-bin/mmwebwx-bin/webwxsendmsg',
  SEND_MSG_IMG: '/cgi-bin/mmwebwx-bin/webwxsendmsgimg',
  SEND_EMOTICON: '/cgi-bin/mmwebwx-bin/webwxsendemoticon',
  SEND_APP_MSG: '/cgi-bin/mmwebwx-bin/webwxsendappmsg',
  GET_HEAD_IMG: '/cgi-bin/mmwebwx-bin/webwxgetheadimg',
  GET_MSG_IMG: '/cgi-bin/mmwebwx-bin/webwxgetmsgimg',
  GET_MEDIA: '/cgi-bin/mmwebwx-bin/webwxgetmedia',
  GET_VIDEO: '/cgi-bin/mmwebwx-bin/webwxgetvideo',
  LOGOUT: '/cgi-bin/mmwebwx-bin/webwxlogout',
  GET_VOICE: '/cgi-bin/mmwebwx-bin/webwxgetvoice',
  UPDATE_CHATROOM: '/cgi-bin/mmwebwx-bin/webwxupdatechatroom',
  CREATE_CHATROOM: '/cgi-bin/mmwebwx-bin/webwxcreatechatroom',
  STATUS_NOTIFY: '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
  CHECK_URL: '/cgi-bin/mmwebwx-bin/webwxcheckurl',
  VERIFY_USER: '/cgi-bin/mmwebwx-bin/webwxverifyuser',
  FEEDBACK: '/cgi-bin/mmwebwx-bin/webwxsendfeedback',
  REPORT: '/cgi-bin/mmwebwx-bin/webwxstatreport',
  SEARCH: '/cgi-bin/mmwebwx-bin/webwxsearchcontact',
  OPLOG: '/cgi-bin/mmwebwx-bin/webwxoplog'
}

module.exports = { LOGIN, SYNC, FILE, WEBWX }