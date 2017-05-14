
// class A {
//   async constructor () {
//     await (new Promise(resolve => setTimeout(resolve, 3000)))
//     console.log('aaa')
//   }
// }

// const main = async () => {
//   const a = await (new A())
//   console.log('bbb')
// }

// main()

// const a = {}

const staticObjct = obj => {
  const static_object = {}
  for (let proto in obj) {
    const value = obj[proto]
    Object.defineProperty(static_object, proto, {
      get: () => value,
      set: () => {throw new Error('Static Obj')}
    })
  }
  return static_object
}

const o = staticObjct({
  aaa: 'bbb',
  ccc: 'ddd',
  eee: 'fff'
})

console.log(o)


// const WeChatAPI = require('../src/wechat-api')
// const api = new WeChatAPI()
// const utils = require('../src/utils')
// const fs = require('fs')

// api.on('log', ({type, data}) => {
//   console.log(`[${type}]`, data)
// })

// const main = async () => {
//   // await api.init()
//   // const response = await api.request.get('https://baidu.com')
//   // await api.getUUID()

//   await api.init()

//   let user
//   try {
//     if (!api.pass_ticket) {
//       throw new Error()
//     } else {
//       user = await api.webwxinit()
//     }
//   } catch (e) {
//     await api.getUUID()

//     const qrcode = await api.genQrcode()

//     await api.waitForLogin()
//     await api.login()
//     user = await api.webwxinit()


//     const clientMsgId = utils.now() + Math.floor(Math.random() * 1e4)
//     const result = await api._post_(api.API.webwxsendmsgimg,
//       { fun: 'async', f: 'json', pass_ticket: api.pass_ticket },
//       {
//         "BaseRequest": api._baseRequest_(),
//         "Msg": {
//           "Type": 3,
//           "MediaId": data.MediaId,
//           "FromUserName": api.user.UserName,
//           "ToUserName": 'filehelper',
//           "LocalID": clientMsgId,
//           "ClientMsgId":  clientMsgId
//         }
//       }
//     )
//     console.log(data)
//     console.log(result)
//     void(0)
//   }

//   await api.webwxstatusnotify()
// }

// main()

// const {touch} = require('../src/utils')
// touch('/tmp/alalalal')


// class BaseClass {
// 	constructor () {
// 		this._middlewares = []
// 	}

// const compose = middlewares => {
// 	return [...middlewares, ctx => ctx].reduce((left, right) =>
// 		(ctx, next) => left(ctx, () => right(ctx, next))
// 	)
// }

// 	use (...middlewares) {
// 		this._middlewares = this._middlewares.concat(middlewares)
// 		return this
// 	}

// 	handle (data) {
// 		return BaseClass.compose(this._middlewares)(data)
// 	}
// }

// const base = new BaseClass()

// base
// 	.use(async ({req, res, next}) => {
// 	})
// 	.use(async ({req, res, next}) => {
// 	})
// 	.use(async ({req, res, next}) => {
// 	})

  // static composeMiddleware(middlewares) {
  //   return [...middlewares, async ctx => ctx].reduce((left, right) =>
  //     async ({api, msg, next}) => await left({api, msg, next: async () => await right({api, msg, next})}))
  // }

// {api, msg, next: async () => await right({api, msg, next})}

// const {next, ...ctx} = {
// 	next: 'next',
// 	lalala: 'lalala',
// 	hahaha: 'hahahah'
// } 

// console.log(next)
// console.log(ctx)

// const middlewares = [
// 	async (msg, next) => {
// 		console.log('1_start', JSON.stringify(msg))
// 		msg[1] = 1
// 		// await next()
// 		console.log('1_end', JSON.stringify(msg))
// 	},
// 	async (msg, next) => {
// 		console.log('2_start', JSON.stringify(msg))
// 		msg[2] = 2
// 		// await next()
// 		console.log('2_end', JSON.stringify(msg))
// 	},
// 	async (msg, next) => {
// 		console.log('3_start', JSON.stringify(msg))
// 		msg[3] = 3
// 		await next()
// 		console.log('3_end', JSON.stringify(msg))
// 	},
// ]

// compose(middlewares)({})

// // generate
// // const warpContext = (msg, fn) => {
// // 	return async (next) => {
// // 		return await fn(msg, next)
// // 	}
// // }

// // const msg = {}
// // const warped_middlewares = [...middlewares, async (msg) => {console.log('end')}]
// // .map(middleware => warpContext(msg, middleware))

// const job = [...middlewares, async msg => msg].reduce((left, right) => {
// 	return async (msg, next) => {
// 		return await left(msg, async () => await right(msg, next))
// 	}
// })

// const main = async () => {
// 	const msg = {}
// 	await job(msg)
// 	console.log(msg)
// }

// main()

// // warped(()=>{console.log('end')})
// // middlewares.reduceRight()
// // const msg = {}
// // const compose = (right, left) => {
// // 	return async () => {
// // 		await right(msg, async () => await left(msg))
// // 	}
// // }
// // const r = compose(middlewares[0], middlewares[1])
// // r()