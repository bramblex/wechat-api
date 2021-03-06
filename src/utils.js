
const json5 = require('json5')
const qrcode = require('qrcode-terminal')
const xml2js = require('xml2js')
const url = require('url')
const fs = require('mz/fs')

const now = () => Date.now()
const sleep = t => new Promise(resolve => setTimeout(resolve, t * 1e3))
const makeQrcode = uri => new Promise(resolve => qrcode.generate(uri, {small: true}, resolve))
const parseXml = text => new Promise((resolve, reject) => xml2js.parseString(text, (err, result) => err ? reject(err) : resolve(result)))
const getHost = r => url.parse(r).host
const makeDeviceID = () => 'e' + Math.random().toFixed(15).toString().substring(2, 17)
const readJsonFile = async path => json5.parse(await fs.readFile(path, 'utf-8'))
const writeJsonFile = (path, data) => fs.writeFile(path, json5.stringify(data), 'utf-8')
const merge = (...object) => Object.assign({}, ...object)
const touch = path => fs.appendFile(path, '')
const createMsgID = () => now() + Math.floor(Math.random() * 1e4)

const isExist = async path => {
  try {
    await fs.access(path, fs.constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}

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
  now, sleep, makeQrcode, parseXml, parseJsData, getHost, makeDeviceID,
  readJsonFile, writeJsonFile, merge, touch, createMsgID, isExist 
}