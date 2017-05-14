const EventEmitter  = require('events')

module.exports = class Middleware extends EventEmitter{

  static compose(middlewares) {
    return [...middlewares, ctx => ctx].reduce((left, right) =>
      (ctx, next) => left(ctx, () => right(ctx, next)))
  }

  constructor () {
    super()
    this._middlewares_ = []
  }

  use (...middlewares) {
    this._middlewares_ = this._middlewares_.concat(middlewares)
    return this
  }

  handle (ctx) {
    return Middleware.compose(this._middlewares_)(ctx)
  }
}