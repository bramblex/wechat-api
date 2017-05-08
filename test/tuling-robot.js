

const Wechat = require('../src/wechat')
const utils = require('../src/utils')
const axios = require('axios')
const {SPECIAL_ACCOUNTS} = require('../src/constrains')

const ROBOT_API_URL = 'http://www.tuling123.com/openapi/api'
const API_KEY = 'd145eb04c3054ef899bd4e007a2029ab'

const tell_robot = async (userid, send_text) => {
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

const wechat = new Wechat()

wechat.api.on('log', ({type, data}) => {
  console.log(`[${type}]`, data)
})

// wechat
//   .use(async ({ api, msg, user }) => {
    // if (msg.MsgType !== 1) return
    // if (msg.MsgType === 1 && msg.FromUserName !== user.UserName && SPECIAL_ACCOUNTS.indexOf(msg.FromUserName) < 0) {
    //   const text = await tell_robot(msg.FromUserName, msg.Content.replace(/@+[a-zA-Z0-9_]+:<br\/>/, ''))
    //   await api.webwxsendmsg(text, msg.FromUserName)
    // }
  // })
  // .start()

wechat
  .use(async ({msg}, next) => {
    try { return await next() } catch (e) {}
  })
  .use(async ({msg}, next) => {
    if (msg.MsgType !== 1 || SPECIAL_ACCOUNTS.indexOf(msg.FromUserName) >= 0) {
      return
    }
    await next()
  })
  .use(async ({ msg, user, api }, next) => {
    if (msg.FromUserName.includes('@@')) {
      if (msg.Content.includes(`@${user.NickName}`)) {
        const UserName = msg.Content.match(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/)[1]
        const text = await tell_robot(UserName, msg.Content.replace(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/, ''))
        await api.webwxsendmsg(text, msg.FromUserName)
      }
    }
    else {
      await next()
    }
  })
  .use(async ({msg, user, api}, next) => {
    if (msg.FromUserName === user.UserName && /^\[机器人\]/.test(msg.Content)) {
      return
    }
    const text = await tell_robot(msg.FromUserName, msg.Content)
    if (msg.FromUserName === user.UserName) {
      await api.webwxsendmsg('[机器人]' + text, msg.FromUserName)
    } else {
      await api.webwxsendmsg(text, msg.FromUserName)
    }
  })
  .start()