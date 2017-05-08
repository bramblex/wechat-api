
const {touch} = require('../src/utils')

touch('/tmp/alalalal')


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