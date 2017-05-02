'use strict'

const _ = require('lodash')

const LANG = 'zh_CN'

const SP_ACCOUNTS = 'newsapp,fmessage,filehelper,weibo,qqmail,fmessage,' +
  'tmessage,qmessage,qqsync,floatbottle,lbsapp,shakeapp,medianote,qqfriend,' +
  'readerapp,blogapp,facebookapp,masssendapp,meishiapp,feedsapp,voip,' +
  'blogappweixin,weixin,brandsessionholder,weixinreminder,wxid_novlwrv3lqwv11,' +
  'gh_22b87fa7cb3c,officialaccounts,notification_messages,wxid_novlwrv3lqwv11,' +
  'gh_22b87fa7cb3c,wxitil,userexperience_alarm,notification_messages'

const APPID = 'wx782c26e4c19acffb'

module.exports = {
  LANG,
  APPID,
  SP_ACCOUNTS,
  HOST: require('./host'),
  API_TEMPLATE: require('./api'),
  CODES: require('./codes')
}