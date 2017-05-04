

const WechatApi = require('../src/wechat-api')
const utils = require('../src/utils')
const axios = require('axios')

const ROBOT_API_URL = 'http://www.tuling123.com/openapi/api'
const API_KEY = 'd145eb04c3054ef899bd4e007a2029ab'

async function tell_robot (userid, send_text) {
  const {data: {code, url, text, list}} = await axios.post(ROBOT_API_URL, {
    key: API_KEY,
    info: send_text,
    userid: userid.replace('@', '').replace('_', '')
  })
  if (!list) {
    return (url ? [text, url] : [text]).join('\n')
  } else {
    return (url ? [text, url] : [text]).concat(list.slice(0, 5).map(item => 
      Object.keys(item).map(key => `[${key}]: ${item[key]}`).join('\n')
    )).join('\n===================\n')
  }
}

const wechat_api = new WechatApi()

wechat_api.on('log', ({type, data}) => {
  console.log(`[${type}]`, data)
})

wechat_api.on('message', msg => {
  async function __handleMsg__ () {
    const text = await tell_robot(msg.FromUserName, msg.Content.replace(/@+[a-zA-Z0-9_]+:<br\/>/, ''))
    await wechat_api.webwxsendmsg(text, msg.FromUserName)
  }

  if (msg.MsgType === 1) {
    if (msg.FromUserName.includes('@@')) {
      if (msg.Content.includes('@' + wechat_api.user.NickName)) {
        __handleMsg__()
      }
    } else {
      __handleMsg__()
    }
  } 
})

wechat_api.start()
