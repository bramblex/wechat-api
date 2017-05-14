'use strict'

const HOST = {
  'wx2.qq.com': ['login.wx2.qq.com', 'file.wx2.qq.com', 'webpush.wx2.qq.com'],
  'wx8.qq.com': ['login.wx8.qq.com', 'file.wx8.qq.com', 'webpush.wx8.qq.com'],
  'qq.com': ['login.wx.qq.com', 'file.wx.qq.com', 'webpush.wx.qq.com'],
  'web2.wechat.com': ['login.web2.wechat.com', 'file.web2.wechat.com', 'webpush.web2.wechat.com'],
  'wechat.com': ['login.web.wechat.com', 'file.web.wechat.com', 'webpush.web.wechat.com'],
  '*': ['login.weixin.qq.com', 'file.wx.qq.com', 'webpush.weixin.qq.com']
}

const CODES = {
  'CONTACTFLAG_CONTACT': 1,
  'CONTACTFLAG_CHATCONTACT': 2,
  'CONTACTFLAG_CHATROOMCONTACT': 4,
  'CONTACTFLAG_BLACKLISTCONTACT': 8,
  'CONTACTFLAG_DOMAINCONTACT': 16,
  'CONTACTFLAG_HIDECONTACT': 32,
  'CONTACTFLAG_FAVOURCONTACT': 64,
  'CONTACTFLAG_3RDAPPCONTACT': 128,
  'CONTACTFLAG_SNSBLACKLISTCONTACT': 256,
  'CONTACTFLAG_NOTIFYCLOSECONTACT': 512,
  'CONTACTFLAG_TOPCONTACT': 2048,
  'MSGTYPE_TEXT': 1,
  'MSGTYPE_IMAGE': 3,
  'MSGTYPE_VOICE': 34,
  'MSGTYPE_VIDEO': 43,
  'MSGTYPE_MICROVIDEO': 62,
  'MSGTYPE_EMOTICON': 47,
  'MSGTYPE_APP': 49,
  'MSGTYPE_VOIPMSG': 50,
  'MSGTYPE_VOIPNOTIFY': 52,
  'MSGTYPE_VOIPINVITE': 53,
  'MSGTYPE_LOCATION': 48,
  'MSGTYPE_STATUSNOTIFY': 51,
  'MSGTYPE_SYSNOTICE': 9999,
  'MSGTYPE_POSSIBLEFRIEND_MSG': 40,
  'MSGTYPE_VERIFYMSG': 37,
  'MSGTYPE_SHARECARD': 42,
  'MSGTYPE_SYS': 10000,
  'MSGTYPE_RECALLED': 10002,
  'APPMSGTYPE_TEXT': 1,
  'APPMSGTYPE_IMG': 2,
  'APPMSGTYPE_AUDIO': 3,
  'APPMSGTYPE_VIDEO': 4,
  'APPMSGTYPE_URL': 5,
  'APPMSGTYPE_ATTACH': 6,
  'APPMSGTYPE_OPEN': 7,
  'APPMSGTYPE_EMOJI': 8,
  'APPMSGTYPE_VOICE_REMIND': 9,
  'APPMSGTYPE_SCAN_GOOD': 10,
  'APPMSGTYPE_GOOD': 13,
  'APPMSGTYPE_EMOTION': 15,
  'APPMSGTYPE_CARD_TICKET': 16,
  'APPMSGTYPE_REALTIME_SHARE_LOCATION': 17,
  'APPMSGTYPE_TRANSFERS': 2e3,
  'APPMSGTYPE_RED_ENVELOPES': 2001,
  'APPMSGTYPE_READER_TYPE': 100001,
  'UPLOAD_MEDIA_TYPE_IMAGE': 1,
  'UPLOAD_MEDIA_TYPE_VIDEO': 2,
  'UPLOAD_MEDIA_TYPE_AUDIO': 3,
  'UPLOAD_MEDIA_TYPE_ATTACHMENT': 4,
}

const SPECIAL_ACCOUNTS = [
  'newsapp', 'filehelper', 'weibo', 'qqmail',
  'fmessage', 'tmessage', 'qmessage', 'qqsync',
  'floatbottle', 'lbsapp', 'shakeapp', 'medianote',
  'qqfriend', 'readerapp', 'blogapp', 'facebookapp',
  'masssendapp', 'meishiapp', 'feedsapp', 'voip',
  'blogappweixin', 'brandsessionholder', 'weixin',
  'weixinreminder', 'officialaccounts', 'wxitil',
  'notification_messages', 'wxid_novlwrv3lqwv11',
  'gh_22b87fa7cb3c', 'userexperience_alarm',
]

const LANG = 'zh_CN'

const APPID = 'wx782c26e4c19acffb'

const BASE_HOST = 'wx.qq.com'

module.exports = { CODES, HOST, LANG, APPID, SPECIAL_ACCOUNTS, BASE_HOST }