// 'use strict'

// const http = require('http')
// const https = require('https')
// const axios = require('axios')
// const tough = require('tough-cookie')
// const axiosCookieJarSupport = require('node-axios-cookiejar')

// const UA_LIST = [
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2652.0 Safari/537.36',
//   'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36',
//   'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0',
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
//   'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36 SE 2.X MetaSr 1.0',
//   'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
// ]

// const getUA = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)]

// const createRequest = () => {
//   const jar = new tough.CookieJar()
//   const request = axios.create({
//     timeout: 35e3,
//     headers: {
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       'User-Agent': getUA(),
//       'Referer': 'https://wx2.qq.com/',
//     },
//     jar,
//     withCredentials: true,
//     xsrfCookieName: null,
//     xsrfHeaderName: null,
//     httpAgent: new http.Agent({ keepAlive: true }),
//     httpsAgent: new https.Agent({ keepAlive: true }),
//   })
//   axiosCookieJarSupport(request)
//   return request
// }

// module.exports = createRequest