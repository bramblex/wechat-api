'user strict'

const path = require('path')
const fs = require('mz/fs')
const utils = require('./utils')
const jparse = JSON.parse
const jstringify = JSON.stringify
const mime = require('mime-types')

const checkFile = async (path, data) => {
  await utils.touch(path)
  try {
    jparse(await fs.readFile(path))
  } catch (err) {
    await fs.writeFile(path, jstringify(data))
  }
}

module.exports = class Store {
  constructor (root_path) {
    this._root_path = root_path

    this._cookie_path = path.join(root_path, 'cookie.json')
    this._tickets_path = path.join(root_path, 'tickets.json')
    this._lastsync_path = path.join(root_path, 'lastsync')
    this._media_dir = path.join(root_path, 'media')
  }

  async init () {

    // 创建目录结构
    if (!await utils.isExist(this._root_path)) { await fs.mkdir(this._root_path) }
    if (!await utils.isExist(this._media_dir)) { await fs.mkdir(this._media_dir) }

    // 创建并检查 cookie 文件
    await checkFile(this._cookie_path, {})

    // 检查并创建 tickets 文件
    await checkFile(this._tickets_path, {})

    // 检查并创建 lastsync 文件
    await checkFile(this._lastsync_path, 0)
  }

  getCookiePath () { return this._cookie_path }

  async writeTickets (device_id, wx_host, tickets) { 
    await this.writeLastsync()
    await fs.writeFile(this._tickets_path, jstringify({
      device_id, wx_host, tickets
    })) 
  }

  async readTickets() {
    const lastsync = jparse(await fs.readFile(this._lastsync_path))
    const {wx_host, tickets, device_id} = jparse(await fs.readFile(this._tickets_path)) 
    return {wx_host, tickets, lastsync, device_id}
  }

  writeLastsync () {
    const data = jstringify(utils.now())
    return fs.writeFile(this._lastsync_path, data)
  }

  async saveMedia(media_buffer, content_type) {
    while (true) {
      const filename = utils.createMsgID() + '.' + mime.extension(content_type)
      const fullpath = path.join(this._media_dir, filename)
      if (!await utils.testAsync(fs.access(fs.constants.F_OK))) {
        await fs.writeFile(fullpath, media_buffer)
        return filename
      }
    }
  }

  async getMedia(filename) {
    return await fs.readFile(filename)
  }

  getFullPath (filename) {
    return path.join()
  }
}