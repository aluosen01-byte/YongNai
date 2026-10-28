/* Static validation for the mini-program: JSON, page files, assets, WXML structure. */
const fs = require('fs')
const path = require('path')

const ROOT = 'D:/projects/YongNai'
const MP = path.join(ROOT, 'miniprogram')
let errors = 0
let warnings = 0

const fail = (msg) => { console.log('  FAIL ' + msg); errors++ }
const warn = (msg) => { console.log('  WARN ' + msg); warnings++ }

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(MP)
const byExt = (ext) => files.filter((f) => f.endsWith(ext))

// ---------- 1. JSON ----------
console.log('\n[1] JSON files')
for (const f of byExt('.json')) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch (e) {
    fail(path.relative(ROOT, f) + ' — ' + e.message)
  }
}
console.log('  parsed ' + byExt('.json').length + ' files')

// ---------- 2. app.json pages ----------
console.log('\n[2] app.json pages')
const app = JSON.parse(fs.readFileSync(path.join(MP, 'app.json'), 'utf8'))
for (const p of app.pages) {
  for (const ext of ['.ts', '.wxml', '.wxss', '.json']) {
    const target = path.join(MP, p + ext)
    if (!fs.existsSync(target)) fail('missing ' + p + ext)
  }
}
console.log('  ' + app.pages.length + ' pages declared')

// tabBar
for (const item of app.tabBar.list) {
  if (!app.pages.includes(item.pagePath)) fail('tabBar page not in pages: ' + item.pagePath)
  for (const key of ['iconPath', 'selectedIconPath']) {
    if (!fs.existsSync(path.join(MP, item[key]))) fail('tabBar icon missing: ' + item[key])
  }
}
console.log('  ' + app.tabBar.list.length + ' tabBar entries')
if (app.sitemapLocation && !fs.existsSync(path.join(MP, app.sitemapLocation))) {
  fail('sitemap missing: ' + app.sitemapLocation)
}

// ---------- 3. asset references ----------
console.log('\n[3] asset references')
const refRe = /\/assets\/[A-Za-z0-9._\/-]+\.(?:jpg|jpeg|png|svg)/g
const referenced = new Set()
for (const f of files.filter((f) => f.endsWith('.ts') || f.endsWith('.wxml'))) {
  const txt = fs.readFileSync(f, 'utf8')
  let m
  while ((m = refRe.exec(txt))) {
    referenced.add(m[0])
    if (!fs.existsSync(path.join(MP, m[0]))) {
      fail('missing asset ' + m[0] + '  (in ' + path.relative(ROOT, f) + ')')
    }
  }
}
console.log('  ' + referenced.size + ' distinct assets referenced')

// orphan assets
const onDisk = new Set(
  files
    .filter((f) => /\.(jpg|jpeg|png|svg)$/.test(f))
    .map((f) => '/' + path.relative(MP, f).split(path.sep).join('/'))
)
const orphans = [...onDisk].filter((p) => !referenced.has(p))
if (orphans.length) warn('unreferenced assets: ' + orphans.join(', '))
console.log('  ' + onDisk.size + ' assets on disk')

// ---------- 4. WXML structure ----------
console.log('\n[4] WXML structure')
const VOID = new Set(['image', 'input', 'import', 'include', 'wxs', 'icon', 'progress', 'slider', 'switch', 'checkbox', 'radio'])
for (const f of byExt('.wxml')) {
  let txt = fs.readFileSync(f, 'utf8')
  const rel = path.relative(ROOT, f)
  txt = txt.replace(/<!--[\s\S]*?-->/g, '')

  // mustache balance
  const opens = (txt.match(/\{\{/g) || []).length
  const closes = (txt.match(/\}\}/g) || []).length
  if (opens !== closes) fail(rel + ' — unbalanced {{ }} (' + opens + ' vs ' + closes + ')')

  // tag balance
  const stack = []
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g
  let m
  while ((m = tagRe.exec(txt))) {
    const closing = m[1] === '/'
    const name = m[2]
    const selfClose = m[4] === '/'
    if (selfClose || VOID.has(name)) continue
    if (closing) {
      const top = stack.pop()
      if (top !== name) fail(rel + ' — </' + name + '> does not close <' + (top || 'nothing') + '>')
    } else {
      stack.push(name)
    }
  }
  if (stack.length) fail(rel + ' — unclosed: ' + stack.join(', '))
}
console.log('  checked ' + byExt('.wxml').length + ' files')

// ---------- 5. WXSS ----------
console.log('\n[5] WXSS brace balance')
for (const f of byExt('.wxss')) {
  const txt = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const o = (txt.match(/\{/g) || []).length
  const c = (txt.match(/\}/g) || []).length
  if (o !== c) fail(path.relative(ROOT, f) + ' — braces ' + o + ' vs ' + c)
}
console.log('  checked ' + byExt('.wxss').length + ' files')

// ---------- 6. handlers bound in WXML must exist in the page .ts ----------
console.log('\n[6] event handlers')
const HANDLER_ATTR = /(?:bind|catch|capture-bind|capture-catch)[:]?([a-zA-Z]+)="([^"]+)"/g
for (const wxml of byExt('.wxml')) {
  const ts = wxml.replace(/\.wxml$/, '.ts')
  if (!fs.existsSync(ts)) continue
  const tsTxt = fs.readFileSync(ts, 'utf8')
  const wxmlTxt = fs.readFileSync(wxml, 'utf8')
  const seen = new Set()
  let m
  while ((m = HANDLER_ATTR.exec(wxmlTxt))) {
    const fn = m[2]
    if (fn.startsWith('{{') || seen.has(fn)) continue
    seen.add(fn)
    // method defined either as `name(` or `name:` in the page object
    const defined = new RegExp('(^|[\\s,{])' + fn + '\\s*[(:]').test(tsTxt)
    if (!defined) fail(path.relative(ROOT, wxml) + ' — handler "' + fn + '" not defined in page ts')
  }
}
console.log('  done')

// ---------- 7. package size ----------
console.log('\n[7] package size')
let total = 0
for (const f of files) total += fs.statSync(f).size
console.log('  source+assets total: ' + (total / 1024).toFixed(0) + ' KB (limit 2048 KB main package)')
if (total > 2048 * 1024) fail('main package exceeds 2 MB')

console.log('\n=== ' + (errors ? errors + ' error(s)' : 'no errors') + ', ' + warnings + ' warning(s) ===')
process.exit(errors ? 1 : 0)
