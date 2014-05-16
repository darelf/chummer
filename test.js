var test = require('tape')
var chum = require('./')()

test('metatype priorities', function(t) {
  t.plan(3)
  t.ok(chum.canBe('Troll', 'A'), 'Trolls can be priority A')
  t.notOk(chum.canBe('Troll', 'E'), 'Trolls can not be priority E')
  var shouldbe = ['Human:1']
  t.deepEqual(chum.metas('E'), shouldbe, 'Only Humans should be listed in priority E')
})
test('priorities', function(t) {
  t.plan(3)
  t.equal(chum.priorities['A'], null, 'Should start null')
  t.deepEqual(chum.priorityList['A']['skills'], [46,10], 'A skills should be 46 and 10')
  t.deepEqual(chum.priorityList['B']['skills'], [36,5], 'B skills should be 36 and 5')
})
test('choose metatype', function(t) {
  t.plan(7)
  chum.priorities['B'] = 'attributes'
  chum.chooseMetatype('Human', 'E')
  t.equal(chum.attributes['BODY'], 1, 'Humans should start with BODY of 1')
  t.equal(chum.attributePoints, 20, 'B for attributes should give 20 points')
  t.equal(chum.attributes['EDG'], 2, 'And humans start at 2 Edge')
  // simulate spending 5 points
  chum.attributePoints = 15
  chum.chooseMetatype('Troll', 'A')
  t.equal(chum.attributes['BODY'], 5, 'Trolls should start with a BODY of 5')
  t.equal(chum.attributes['EDG'], 1, 'And they only have 1 Edge')
  // it should have reset attribute points
  t.equal(chum.attributePoints, 20, 'Choosing a different metatype should reset attributes')
  t.equal(chum.spentAttributePoints, 0, 'As well as points spent')
})
test('adjust with attr points', function(t) {
  t.plan(8)
  chum.priorities['B'] = 'attributes'
  chum.chooseMetatype('Human', 'D')
  chum.addAttributePoint('STR')
  t.equal(chum.attributes['STR'], 2, 'Add one point')
  chum.addAttributePoint('STR').subtractAttributePoint('STR')
  t.equal(chum.attributes['STR'], 2, 'Chain them together')
  chum.addAttributePoint('STR').addAttributePoint('STR').addAttributePoint('STR').addAttributePoint('STR')
  t.equal(chum.attributes['STR'], 6, 'Max out')
  t.equal(chum.spentAttributePoints, 5, 'Check number of points spent')
  chum.addAttributePoint('STR')
  t.equal(chum.attributes['STR'], 6, 'Attempt to exceed limit is no-op')
  chum.addAttributePoint('EDG')
  t.equal(chum.attributes['EDG'], 3, 'Spent a point on Edge... hell yeah')
  t.equal(chum.spentSpecialPoints, 1, 'Check special points spent')
  chum.adjustAttributePoint('WIL', 5)
  t.equal(chum.spentAttributePoints, 10, 'Adjust by more than one point at a time')
})
test('test karma', function(t) {
  t.plan(1)
  chum.chooseRunnerLevel('runner')
  t.equal(chum.currentKarma(), 25, 'check default karma level')
  
})
test('skill points', function(t) {
  t.plan(9)
  chum.chooseSkillPriority('A')
  t.equal(chum.skillPoints, 46, 'Skill points')
  t.equal(chum.groupPoints, 10, 'Group points')
  var cc = ["Blades", "Clubs", "Unarmed"]
  t.deepEqual(chum.skillList.group['Close Combat'], cc, 'Check group skill list')
  chum.setSkill('Blades', 5)
  t.equal(chum.getSkill('Blades'), 5, 'Add blades at 5')
  chum.setSkill('Running', 3)
  t.equal(chum.individualSkills['Running'].amt, 3, 'Add running at 3')
  t.equal(chum.currentSkillsSpent(), 8, 'Check points spent equals 8')
  chum.setSkill('Running', 0)
  t.notOk(chum.individualSkills['Running'], 'Delete a skill')
  // Try to spent points on a group skill from the individual skill pool
  chum.setSkill('Athletics', 4)
  t.equal(chum.currentSkillsSpent(), 5, 'Should not affect total')
  chum.setGroup('Athletics', 4)
  t.equal(chum.currentGroupSkillsSpent(), 4, 'Should be 4')
})
