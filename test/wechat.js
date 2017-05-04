

const WechatApi = require('../src/wechat-api')
const utils = require('../src/utils')
const open = require('open')

const wechat_api = new WechatApi()

wechat_api.on('log', ({type, data}) => {
  console.log(`[${type}]`, data)
})
wechat_api.on('qrcode', ({url}) => open(url))
wechat_api.on('message', msg => {

  wechat_api.webwxsendmsg(
    '[自动回复]这里是机器人自动回复消息，测试用的~',
    msg.FromUserName
  )

  wechat_api.webwxsendmsg(
    '你说要三条信息的，这是第二条',
    msg.FromUserName
  )

  wechat_api.webwxsendmsg(
    '三条了，这条换成图片就好了',
    msg.FromUserName
  )

  if (msg.FromUserName.includes('@@')) {
    wechat_api.webwxbatchgetcontact([msg.FromUserName]).then(([group]) => {
      wechat_api.webwxsendmsg(
        `这个群总共有 ${group.MemberCount} 人, 分别是 ${group.MemberList.map(User => User.NickName).join(',')}`,
        msg.FromUserName
      )
    })
  }

})
wechat_api.start()

// wechat_api._retry_('错误', 3, 3, async function () {
//   console.log('这是错误')
//   throw new Error('lalala')
// })

// wechat_api.on('log', console.log)

// utils.sleep(10)

// const WeChat = require('../src/wechat')
// const open = require('open')

// const client = new WeChat()
// client.on('qrcode', ({code, img_url}) => {
//   open(img_url)
// })
// client.start()