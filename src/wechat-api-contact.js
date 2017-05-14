'use strict'

const getUserName = (member_or_username) =>
  typeof member_or_username === 'string' ? member_or_username : member_or_username.UserName


module.exports = class Contact {
  constructor() {
    this.me = null
    this.groups = null
    this.friends = null
    this.publics = null
    this.specals = null
    this.all = null
  }

  isMe(member) {
    return this.me.UserName === getUserName(member)
  }

  isGroup(member) {
    return /^@@/.test(getUserName(member))
  }

  isPublic(_member) {
    const member = this.find(getUserName(_member))
    return member ? (member.VerifyFlag & 8 != 0) : false
  }

  isSpecial(member) {
    return !(/^@/.test(getUserName(member)))
  }

  isFriends(member) {
    return !this.isPublic(member) && !this.isGroup(member) && !this.isSpecial(member)
  }

  init(me, result) {
    this.me = me
    this.groups = {}
    this.group_members = {}
    this.friends = {}
    this.publics = {}
    this.specals = {}
    this.all = {}
    for (let member of result.MemberList) {
      this.insert(member)
    }
  }

  insert(member) {
    const { UserName } = member
    if (this.isGroup(member)) {
      this.groups[UserName] = member
    } else if (this.isPublic(member)) {
      this.publics[UserName] = member
    } else if (this.isSpecial(member)) {
      this.specals[UserName] = member
    } else {
      this.friends[UserName] = member
    }
    this.all[UserName] = member
  }

  find(id) {
    return this.all[id] || null
  }

  getGroupMembers(id) {
    return this.group_members[id] | null
  }

  updateGroupMembers(id, members) {
    this.group_members[id] = members
  }
}