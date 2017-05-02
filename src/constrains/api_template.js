// const GET = 'GET', POST = 'POST'
// const {WECHAT_HOST} = require('./host')

// const LOGIN = {
//   QRCODE_PATH: [GET, `https://login.${WECHAT_HOST}/qrcode/`],
//   JS_LOGIN: [POST, `https://login.${WECHAT_HOST}/jslogin`],
//   LOGIN: [POST, `https://login.${WECHAT_HOST}/cgi-bin/mmwebwx-bin/login`],
// }

// const SYNC = {
//   SYNC_CHECK: []
// }

module.exports = {
  QRCODE_PATH: 'https://login.weixin.qq.com/qrcode/',
  JS_LOGIN: 'https://login.<%= WECHAT %>/jslogin',
  LOGIN: 'https://login.<%= WECHAT %>/cgi-bin/mmwebwx-bin/login',

  SYNC_CHECK: 'https://<%= SYNC %>/cgi-bin/mmwebwx-bin/synccheck',

  WEBWX_DOWNLOAD_MEDIA: 'https://<%=  FILE %>/cgi-bin/mmwebwx-bin/webwxgetmedia',
  WEBWX_UPLOAD_MEDIA: 'https://<%=  FILE %>/cgi-bin/mmwebwx-bin/webwxuploadmedia',

  WEBWX_PREVIEW: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxpreview',
  WEBWX_INIT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxinit',
  WEBWX_GET_CONTACT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetcontact',
  WEBWX_SYNC: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsync',
  WEBWX_BATCH_GET_CONTACT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxbatchgetcontact',
  WEBWX_GET_ICON: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgeticon',
  WEBWX_SEND_MSG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsendmsg',
  WEBWX_SEND_MSG_IMG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsendmsgimg',
  WEBWX_SEND_EMOTICON: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsendemoticon',
  WEBWX_SEND_APP_MSG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsendappmsg',
  WEBWX_GET_HEAD_IMG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetheadimg',
  WEBWX_GET_MSG_IMG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetmsgimg',
  WEBWX_GET_MEDIA: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetmedia',
  WEBWX_GET_VIDEO: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetvideo',
  WEBWX_LOGOUT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxlogout',
  WEBWX_GET_VOICE: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxgetvoice',
  WEBWX_UPDATE_CHATROOM: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxupdatechatroom',
  WEBWX_CREATE_CHATROOM: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxcreatechatroom',
  WEBWX_STATUS_NOTIFY: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxstatusnotify',
  WEBWX_CHECK_URL: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxcheckurl',
  WEBWX_VERIFY_USER: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxverifyuser',
  WEBWX_FEEDBACK: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsendfeedback',
  WEBWX_REPORT: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxstatreport',
  WEBWX_SEARCH: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxsearchcontact',
  WEBWX_OPLOG: 'https://<%= BASE %>/cgi-bin/mmwebwx-bin/webwxoplog'
}