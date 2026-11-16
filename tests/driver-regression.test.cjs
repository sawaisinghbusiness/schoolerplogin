const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const staff = process.env.STAFF_ERP_ROOT || 'C:/Users/ADMIN/Desktop/folder for staff app erp project';
const backend = process.env.SMS_BACKEND_ROOT || '../sms backend';

function cacheModule(t) {
  const file = staff + '/lib/api.ts';
  if (!fs.existsSync(file)) { t.skip('Staff checkout unavailable'); return; }
  const saved = new Map([
    ['sa:cache:/me', JSON.stringify({v: {role: 'teacher', name: 'Previous account'}})],
    ['sa:cache:/bus/route', JSON.stringify({v: {trip: {id: 'old-running-trip'}}})],
    ['sa:cache:/notices', JSON.stringify({v: {notices: [{id: 'saved-notice'}]}})],
  ]);
  const module = {exports: {}};
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021}}).outputText;
  vm.runInNewContext(js, {
    module, exports: module.exports,
    require: name => name === './erpMode' ? {isErpMode: () => false} : name === './demo' ? {DEMO: false} : name === '@/lib/editorDrafts' ? {clearEditorDrafts() {}} : name === '@/lib/resourceStatus' ? {setResourceFailure() {}} : require(name),
    localStorage: {getItem: key => saved.get(key) || null},
  });
  return module.exports;
}

test('driver startup cannot reuse a previous account identity or running trip', t => {
  const api = cacheModule(t); if (!api) return;
  assert.equal(api.readCache('/me'), undefined);
  assert.equal(api.readCache('/bus/route'), undefined);
});

test('driver identity isolation preserves ordinary offline content caches', t => {
  const api = cacheModule(t); if (!api) return;
  assert.equal(api.readCache('/notices').notices[0].id, 'saved-notice');
});

function endTrip(t, databaseError) {
  const file = backend + '/src/services/busService.ts';
  if (!fs.existsSync(file)) { t.skip('Backend checkout unavailable'); return; }
  const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  let method;
  function visit(node) { if (ts.isMethodDeclaration(node) && node.name.getText(tree) === 'end') method = node; ts.forEachChild(node, visit); }
  visit(tree); assert(method, 'actual end method must exist');
  const js = ts.transpileModule('module.exports = ({' + method.getText(tree) + '}).end;', {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021}}).outputText;
  const module = {exports: {}};
  vm.runInNewContext(js, {module, Date,
    routeOf: async () => ({id: 'route-review'}), staffOf: async () => ({id: 'driver-review'}), mustTrip: async () => ({id: 'trip-review'}),
    supabase: {from: table => { assert.equal(table, 'bus_trips'); return {update: row => { assert(row.ended_at); return {eq: async (key, id) => { assert.equal(key, 'id'); assert.equal(id, 'trip-review'); return {error: databaseError}; }}; }}; }},
  });
  return module.exports;
}

test('failed driver trip-end persistence cannot report success', async t => {
  const end = endTrip(t, {message: 'Synthetic update failure'}); if (!end) return;
  await assert.rejects(end('driver-review', ''), /Synthetic update failure/);
});

test('driver trip-end reports success only after a successful update', async t => {
  const end = endTrip(t, null); if (!end) return;
  assert.equal((await end('driver-review', '')).success, true);
});
