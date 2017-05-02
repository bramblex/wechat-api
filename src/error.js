
// class WeChatError extends Error {
//   constructor (name, code, msg) {
//     super(`${name}[${code}]: ${msg}`)
//     this.name = name
//     this.code = code
//     this.msg = msg
//   }
// }

// [
//   [],
// ].forEach(([name, code, msg]) => {
//   const error = new WeChatError(name, code, msg)
//   WeChatError[name] = error
//   WeChatError[code] = error
// })

// module.exports = WeChatError