const GET = 'get', POST = 'post'

const LOGIN_API = {
  QRCODE_PATH: [GET, '/qrcode/:uuid'],
  JS_LOGIN: [POST, '/jslogin'],
  LOGIN: [GET, '/cgi-bin/mmwebwx-bin/login'],
}

const SYNC_API = {
  SYNC_CHECK: '/cgi-bin/mmwebwx-bin/synccheck'
}

const FILE_API = {
  WEBWX_DOWNLOAD_MEDIA: '/cgi-bin/mmwebwx-bin/webwxgetmedia',
  WEBWX_UPLOAD_MEDIA: '/cgi-bin/mmwebwx-bin/webwxuploadmedia',
}

const WEBWX_API = {
  WEBWX_PREVIEW: '/cgi-bin/mmwebwx-bin/webwxpreview',
  WEBWX_INIT: '/cgi-bin/mmwebwx-bin/webwxinit',
  WEBWX_GET_CONTACT: '/cgi-bin/mmwebwx-bin/webwxgetcontact',
  WEBWX_SYNC: '/cgi-bin/mmwebwx-bin/webwxsync',
  WEBWX_BATCH_GET_CONTACT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxbatchgetcontact',
  WEBWX_GET_ICON: '/cgi-bin/mmwebwx-bin/webwxgeticon',
  WEBWX_SEND_MSG: '/cgi-bin/mmwebwx-bin/webwxsendmsg',
  WEBWX_SEND_MSG_IMG: '/cgi-bin/mmwebwx-bin/webwxsendmsgimg',
  WEBWX_SEND_EMOTICON: '/cgi-bin/mmwebwx-bin/webwxsendemoticon',
  WEBWX_SEND_APP_MSG: '/cgi-bin/mmwebwx-bin/webwxsendappmsg',
  WEBWX_GET_HEAD_IMG: '/cgi-bin/mmwebwx-bin/webwxgetheadimg',
  WEBWX_GET_MSG_IMG: '/cgi-bin/mmwebwx-bin/webwxgetmsgimg',
  WEBWX_GET_MEDIA: '/cgi-bin/mmwebwx-bin/webwxgetmedia',
  WEBWX_GET_VIDEO: '/cgi-bin/mmwebwx-bin/webwxgetvideo',
  WEBWX_LOGOUT: '/cgi-bin/mmwebwx-bin/webwxlogout',
  WEBWX_GET_VOICE: '/cgi-bin/mmwebwx-bin/webwxgetvoice',
  WEBWX_UPDATE_CHATROOM: '/cgi-bin/mmwebwx-bin/webwxupdatechatroom',
  WEBWX_CREATE_CHATROOM: '/cgi-bin/mmwebwx-bin/webwxcreatechatroom',
  WEBWX_STATUS_NOTIFY: '/cgi-bin/mmwebwx-bin/webwxstatusnotify',
  WEBWX_CHECK_URL: '/cgi-bin/mmwebwx-bin/webwxcheckurl',
  WEBWX_VERIFY_USER: '/cgi-bin/mmwebwx-bin/webwxverifyuser',
  WEBWX_FEEDBACK: '/cgi-bin/mmwebwx-bin/webwxsendfeedback',
  WEBWX_REPORT: '/cgi-bin/mmwebwx-bin/webwxstatreport',
  WEBWX_SEARCH: '/cgi-bin/mmwebwx-bin/webwxsearchcontact',
  WEBWX_OPLOG: '/cgi-bin/mmwebwx-bin/webwxoplog'
}

module.exports = {
}