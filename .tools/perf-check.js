/* Measures what each page pushes to the view layer, to target the slow tab switches. */
const fs = require('fs')
const path = require('path')

const ROOT = 'D:/projects/YongNai'
const MP = path.join(ROOT, 'miniprogram')
const RENDER = path.join(ROOT, '.tmp', 'render')

const noop = () => {}
global.wx = new Proxy({}, { get: (_t, k) => (k === 'getStorageSync' ? () => undefined : noop) })
global.getApp = () => ({ globalData: {} })
global.App = noop
let captured = null
global.Page = (cfg) => { captured = cfg }

function loadPage(name) {
  delete require.cache[require.resolve(path.join(RENDER, 'pages', name, name + '.js'))]
  captured = null
  require(path.join(RENDER, 'pages', name, name + '.js'))
  const cfg = captured
  const ctx = Object.create(cfg)
  ctx.data = JSON.parse(JSON.stringify(cfg.data || {}))
  ctx.setData = function (patch, cb) {
    for (const key of Object.keys(patch)) {
      if (!key.includes('.')) { this.data[key] = patch[key]; continue }
      const parts = key.split('.')
      let cur = this.data
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
      cur[parts[parts.length - 1]] = patch[key]
    }
    if (typeof cb === 'function') cb.call(this)
  }
  return ctx
}

const PAGES = [
  ['home', {}],
  ['products', {}],
  ['selector', {}],
  ['contact', {}],
  ['detail', { model: 'SL-113' }],
  ['about', {}],
  ['sample', { model: 'SL-113' }],
]

const assetBytes = (p) => {
  const f = path.join(MP, p.replace(/^\//, ''))
  try { return fs.statSync(f).size } catch (e) { return 0 }
}

const collectStrings = (v, out) => {
  if (typeof v === 'string') { if (v.startsWith('/assets/')) out.add(v) }
  else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectStrings(x, out))
  return out
}

console.log('page        setData KB   assets   asset MB   notes')
console.log('---------------------------------------------------------------')
for (const [name, query] of PAGES) {
  const ctx = loadPage(name)
  if (typeof ctx.onLoad === 'function') ctx.onLoad(query)
  if (typeof ctx.onShow === 'function') ctx.onShow()
  const json = JSON.stringify(ctx.data)
  const kb = json.length / 1024
  const imgs = [...collectStrings(ctx.data, new Set())]
  const bytes = imgs.reduce((s, p) => s + assetBytes(p), 0)

  const notes = []
  if (name === 'products') {
    const list = ctx.data.list || []
    const lean = list.map((p) => ({
      model: p.model, name: p.name, seriesName: p.seriesName, image: p.image,
      usage: p.usage, packing: p.packing, solid: p.solid, wood: p.wood,
    }))
    const leanKb = JSON.stringify(lean).length / 1024
    const drop = (json.length - JSON.stringify(lean).length) / 1024
    notes.push(`list=${list.length}; lean would be ${leanKb.toFixed(1)} KB (save ${drop.toFixed(1)} KB)`)
  }
  if (name === 'home') {
    notes.push(`featured=${(ctx.data.featured || []).length}; certs=${(ctx.data.certs || []).length}`)
  }
  console.log(
    name.padEnd(11) +
    kb.toFixed(1).padStart(9) + '    ' +
    String(imgs.length).padStart(3) + '   ' +
    (bytes / 1024 / 1024).toFixed(2).padStart(7) + '   ' +
    notes.join(' ')
  )
}

console.log('\nlargest assets:')
const all = []
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : all.push([p, fs.statSync(p).size]) } }
walk(path.join(MP, 'assets'))
all.sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([p, s]) => {
  console.log('  ' + (s / 1024).toFixed(0).padStart(5) + ' KB  ' + path.relative(MP, p))
})
