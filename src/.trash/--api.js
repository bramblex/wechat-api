'use strict'

const http = require('http')
const https = require('https')
const axios = require('axios')
const tough = require('tough-cookie')
const axiosCookieJarSupport = require('node-axios-cookiejar')
const vsprintf = require('sprintf-js').vsprintf

const API_CONSTRAINS = require('./constrains/api')
const utils = require('./utils')

class API {
  constructor () {
    this.retry_times = 3
    this.HOST = {
      LOGIN: 'login.weixin.qq.com',
      FILE: 'file.wx.qq.com',
      WEBWX: null,
      SYNC: null,
    }
    this.__initRequest__ ()
  }

  __initRequest__() {
    const jar = new tough.CookieJar()
    const request = axios.create({
      timeout: 35e3,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
        'Referer': 'https://wx2.qq.com/',
      },
      jar,
      withCredentials: true,
      xsrfCookieName: null,
      xsrfHeaderName: null,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    })
    axiosCookieJarSupport(request)
    this.request = request
  }

  parse (api_path) {
    const [, path_matched, , args_matched] = api_path.match(/([0-9A-Za-z_\.]+)(\[([=0-9A-Za-z_,]+)\])?/)
    const [host, name] = path_matched.split('.').map(item => item.trim())
    const args = args_matched ? args_matched.split(',') : []
    return `https://${this.HOST[host]}${vsprintf(API_CONSTRAINS[host][name], args)}`
  }

  async rawGet (...args) {
    for (let times = 1; times <= this.retry_times; times++) {
      try {
        const { data } = await this.request.get(...args)
        return data
      } catch (err) {
        if (times === this.retry_times) throw err
      }
      await utils.sleep(3)
    }
  }

  async rawPost (...args) {
    for (let times = 1; times <= this.retry_times; times++) {
      try {
        const { data } = await this.request.post(...args)
        return data
      } catch (err) {
        if (times === this.retry_times) throw err
      }
      await utils.sleep(3)
    }
  }

  get (api_path, ...args) {
    return this.rawGet(this.parse(api_path), ...args)
  }

  post (api_path, ...args) {
    return this.rawPost(this.parse(api_path), ...args)
  }

}

module.exports = API