
const json5 = require('json5')
const qrcode = require('qrcode-terminal')
const xml2js = require('xml2js')
const url = require('url')

const now = () => +new Date()
const sleep = t => new Promise(resolve => setTimeout(resolve, t * 1e3))
const makeQrcode = uri => new Promise(resolve => qrcode.generate(uri, {small: true}, resolve))
const parseXml = text => new Promise((resolve, reject) => xml2js.parseString(text, (err, result) => err ? reject(err) : resolve(result)))
const getHost = r => url.parse(r).host
const makeDeviceID = () => 'e' + Math.random().toFixed(15).toString().substring(2, 17);

const parseJsData = data => {
  const result = {}
  data.split(';').forEach(field => {
    const matched = field.match(/^\s*([a-zA-z0-9_\.]+)\s*=\s*(.+)\s*$/)
    if (matched) {
      const [, key, value_raw] = matched
      result[key] = json5.parse(value_raw.trim())
    }
  })
  return result
}

module.exports = {
  now, sleep, makeQrcode, parseXml, parseJsData, getHost, makeDeviceID
}