const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
global.window = global;
for (const file of ['data/transcripts.js', 'data/plan.js', 'assets/model.js', 'assets/storage.js']) vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
const { history, model, semesters, targets, storage } = Roadmap;
test('all completed records reconcile, including the user-confirmed 115-0 internship, withdrawal and zero-credit records', () => {
  assert.equal(history.flatMap(s => s.courses).length, 45);
  for (const s of history) assert.equal(model.completed([s]).total, s.reportedEarned);
  assert.deepEqual(history.map(s => s.average), [87.3, 83, 86.4, 84.3, null]);
  assert.deepEqual(model.completed(history), { total: 82, buckets: { gened: 23, major: 48, elec: 9, free: 2 }, withdrawn: 2, zeroCredit: 6 });
  assert.equal(model.earned(history.at(-1).courses[0]), 2);
  assert.equal(model.earned({ score: 'W', credits: 3 }), 0);
  assert.equal(model.earned({ score: 59, credits: 3 }), 0);
  assert.equal(model.earned({ score: 60, credits: 3 }), 3);
});
test('projection conserves credits while transferring elective overflow exactly once', () => {
  const state = { checked: {}, cross: { '116-1': 2 } };
  for (const s of semesters) for (const c of s.elec) state.checked[`${s.sem}::${c.n}`] = true;
  const p = model.project(history, semesters, state, targets);
  assert.equal(p.total, 82 + 19 + 54 + 2);
  assert.equal(p.buckets.gened, 27);
  assert.equal(p.buckets.major, 63);
  assert.equal(semesters.flatMap(s => s.req).some(c => c.n === '校外實習'), false);
  assert.equal(p.categoriesEnough, false);
  assert.equal(p.overflow, 42);
  assert.equal(p.buckets.elec, 21);
  assert.equal(p.buckets.free, 46);
  assert.equal(model.completed(history).total, 82);
});
test('existing plans import; invalid and unknown entries cannot inflate credits', () => {
  const id = `${semesters[0].sem}::${semesters[0].elec[0].n}`;
  assert.deepEqual(storage.validate({ version: 1, checked: { [id]: true, unknown: true }, cross: { '116-1': 2, unknown: 20 } }, semesters), { checked: { [id]: true }, cross: { '116-1': 2 } });
  for (const data of [{ checked: null, cross: {} }, { checked: [], cross: {} }, { checked: {}, cross: { '116-1': -1 } }, { checked: {}, cross: { '116-1': 21 } }, { version: 2, checked: {}, cross: {} }]) assert.throws(() => storage.validate(data, semesters));
});
