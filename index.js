var fs = require('fs')
var metatypes = JSON.parse(fs.readFileSync('./metatypes.json'))

var pts = JSON.parse(fs.readFileSync('./priorities.json'))

var skills = JSON.parse(fs.readFileSync('./skills.json'))

var specials = ['MAG', 'RES', 'EDG']

var levels = {'street':13, 'runner':25, 'veteran':35}

function Chummer() {
  var self = this
  if (!(self instanceof Chummer)) return new Chummer()
  self.priorityList = pts
  self.skillList = skills
  self.priorities = {'A':null,'B':null,'C':null,'D':null,'E':null}
  self.attributes = {}
  self.attributePoints = 0
  self.spentAttributePoints = 0
  self.specialPoints = 0
  self.spentSpecialPoints = 0
  self.skillPoints = 0
  self.groupPoints = 0
  self.metatype = null
  self.metatypename = ''
  self.karma = []
  self.individualSkills = {}
  self.groupSkills = {}
  self.languages = {}
  self.knowledges = {}
}

module.exports = Chummer

Chummer.prototype.canBe = function(type, priority) {
  return (typeof metatypes[type] !== 'undefined' &&  typeof metatypes[type].priorities[priority] !== 'undefined')
}

Chummer.prototype.metas = function(priority) {
  var self = this
  var retval = []
  for (var i in metatypes) {
    if ( self.canBe(i, priority) ) retval.push(i + ':' + metatypes[i].priorities[priority])
  }
  return retval
}

Chummer.prototype.currentKarma = function() {
  var self = this
  var total = 0
  self.karma.forEach(function(v) {
    total += v.amt
  })
  return total
}

Chummer.prototype.currentSkillsSpent = function() {
  var self = this
  var total = 0
  for(var i in self.individualSkills) {
    total += self.individualSkills[i].amt
  }
  return total
}

Chummer.prototype.currentGroupSkillsSpent = function() {
  var self = this
  var total = 0
  for(var i in self.groupSkills) {
    total += self.groupSkills[i].amt
  }
  return total
}

Chummer.prototype.getSkill = function(sk) {
  var self = this
  var total = 0
  if (typeof self.individualSkills[sk] !== 'undefined') {
    var a = self.individualSkills[sk].amt
    var k = self.individualSkills[sk].karma
    total += (typeof a !== 'undefined' ? a : 0)
    total += (typeof k !== 'undefined' ? k : 0)
  }
  return total
}

Chummer.prototype.chooseMetatype = function(meta, priority) {
  var self = this
  if (!self.canBe(meta, priority)) return
  self.priorities[priority] = 'metatype'
  var m = metatypes[meta]
  self.metatype = m
  self.metatypename = meta
  self.specialPoints = m.priorities[priority]
  // We reset all attributes... remember this when we get to karma and cyber/bioware
  // If they choose a different metatype, we may have to wipe everything out and make them start over
  for (var i in m.stats) {
    self.attributes[i] = ((m.stats[i] instanceof Array) ? m.stats[i][0] : m.stats[i])
  }
  for (var i in self.priorities) {
    if (self.priorities[i] === 'attributes') {
      self.attributePoints = self.priorityList[i]['attributes']
    }
  }
  self.spentAttributePoints = 0
  self.spentSpecialPoints = 0
}

Chummer.prototype.chooseRunnerLevel = function(level) {
  var self = this
  if (typeof levels[level] === 'undefined') return self
  self.karma = [{amt: levels[level], source:'Initial karma'}]
  return self
}

Chummer.prototype.chooseSkillPriority = function(priority) {
  var self = this
  if (typeof self.priorities[priority] === 'undefined') return self
  var s = self.priorityList[priority].skills
  self.skillPoints = s[0]
  self.groupPoints = s[1]
  return self
}


// This function is for "normal" individual skills
// and only for points, not karma
Chummer.prototype.setSkill = function(sk, amt) {
  var self = this
  if (self.skillList.subskill.indexOf(sk) > -1 ||
      typeof self.skillList.group[sk] !== 'undefined') return self
  if (amt < 1) {
    if (typeof self.individualSkills[sk] !== 'undefined' && typeof self.individualSkills[sk].karma !== 'undefined') {
      self.individualSkills[sk].amt = 0
    } else {
      delete self.individualSkills[sk]
    }
    return self
  }
  if (typeof self.individualSkills[sk] !== 'undefined') self.individualSkills[sk].amt = amt
  else self.individualSkills[sk] = {amt: amt}
  return self
}

Chummer.prototype.setGroup = function(group, amt) {
  var self = this
  if (self.skillList.subskill.indexOf(group) > -1 ||
      typeof self.skillList.individual[group] !== 'undefined') return self
  if (amt < 1) {
    if (typeof self.groupSkills[group] !== 'undefined' && typeof self.groupSkills[group].karma !== 'undefined') {
      self.groupSkills[group].amt = 0
    } else {
      delete self.groupSkills[group]
    }
    return self
  }  
  if (typeof self.groupSkills[group] !== 'undefined') self.groupSkills[group].amt = amt
  else self.groupSkills[group] = {amt: amt}
  return self
}

Chummer.prototype.adjustAttributePoint = function(attr, amt) {
  var self = this
  if (typeof self.attributes[attr] === 'undefined') return
  var stat = self.metatype.stats[attr]
  var min = ((stat instanceof Array) ? stat[0] : 0)
  var max = ((stat instanceof Array) ? stat[1] : 6)
  var new_val = self.attributes[attr] + amt
  if (new_val > max || new_val < min) return
  if (specials.indexOf(attr) > -1) {
    self.spentSpecialPoints += amt
  } else {
    self.spentAttributePoints += amt
  }
  self.attributes[attr] = new_val

  return self
}

Chummer.prototype.addAttributePoint = function(attr) {
  var self = this
  return self.adjustAttributePoint(attr, 1)
}

Chummer.prototype.subtractAttributePoint = function(attr) {
  var self = this
  return self.adjustAttributePoint(attr, -1)
}
