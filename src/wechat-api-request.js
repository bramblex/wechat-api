'use strict'

const FileCookieStore = require('tough-cookie-filestore')
const request = require('request-promise-native')
const EventEmitter = require('events')

const jstr = JSON.stringify

module.exports = class Request extends EventEmitter {
  constructor(cookie_path) {
    super()
    this.cookie_path = cookie_path
    this.cookie_jar = null
    this.request = null
  }

  init() {
    this.cookie_jar = request.jar(new FileCookieStore(this.cookie_path))
    this.request = request.defaults({
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        'Referer': 'https://wx.qq.com/',
      },
      jar: this.cookie_jar, timeout: 35e3, json: true, rejectUnauthorized: false
    })
  }

  async get(uri, params = {}) {
    const data = await this.request.get({ uri, qs: params })
    this.emit('log', ['GET', uri, jstr(params), jstr(data)])
    return data
  }

  async post(uri, params = {}, body = {}) {
    const data = await this.request.post({ uri, qs: params, body })
    this.emit('log', ['GET', uri, jstr(params), jstr(body), jstr(data)])
    return data
  }

  async upload(uri, headers, params = {}, formData) {
    const data = await this.request.post({ headers, uri, qs: params, formData })
    this.emit('log', ['GET', uri, jstr(headers), jstr(params), jstr(formData), jstr(data)])
    return data
  }

  async download(uri, params) {
    const data = await this.request.get({
      uri, qs: params, headers: { 'Range': 'bytes=0-' }
    })
    this.emit('log', ['DOWNLOAD', uri, jstr(params)])
    return data
  }

  getCookie(url, key) {
    return this.cookie_jar
      .getCookies(url)
      .find(cookie => cookie.key === key)
      .value
  }

} 