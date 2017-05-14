'use strict'

class Contacts {

  constructor() {
    this.init()
  }

  init() {
    this.content = {
      groups: [],
      friends: [],
      specials: [],
      publics: []
    }
    this.id_index = {}
    this.nick_index = {}

    // this.temp
    // this.group_member_index = {}
  }

  insert (member) {
  }

  quickFind(key) {
    return this.id_index[key] || this.nick_index[key]
  }

  update (key) {
    const member = this.quickFind(key)
    if (member) {
      member
    }
  }
}