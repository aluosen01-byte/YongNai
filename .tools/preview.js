/**
 * Preview renderer.
 * Interprets the real WXML + WXSS (rpx -> vw) and the real page modules
 * (via a stubbed Page()/wx) so the screenshot reflects the actual source.
 */
const fs = require('fs')
const path = require('path')
const http = require('http')

const ROOT = 'D:/projects/YongNai'
const MP = path.join(ROOT, 'miniprogram')
const RENDER = path.join(ROOT, '.tmp', 'render')
const OUT = path.join(ROOT, '.tmp', 'shots')
fs.mkdirSync(OUT, { recursive: true })

// ---------------------------------------------------------------------------
// 1. tiny WXML parser
// ---------------------------------------------------------------------------
function parseWXML(src) {
  const nodes = []
  const stack = [{ children: nodes }]
  const top = () => stack[stack.length - 1]

  let i = 0
  while (i < src.length) {
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i)
      i = end < 0 ? src.length : end + 3
      continue
    }
    if (src[i] === '<') {
      const close = findTagEnd(src, i)
      if (close < 0) { i = src.length; break }
      const raw = src.slice(i + 1, close)
      i = close + 1
      if (raw.startsWith('/')) {
        const name = raw.slice(1).trim()
        while (stack.length > 1 && top().tag !== name) stack.pop()
        if (stack.length > 1) stack.pop()
        continue
      }
      const selfClose = raw.endsWith('/')
      const body = selfClose ? raw.slice(0, -1) : raw
      const m = /^([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*)$/.exec(body)
      if (!m) continue
      const tag = m[1]
      const attrs = parseAttrs(m[2])
      const node = { tag, attrs, children: [] }
      top().children.push(node)
      if (!selfClose && !['image', 'input', 'textarea'].includes(tag)) {
        stack.push(node)
      } else if (!selfClose) {
        stack.push(node)
      }
      continue
    }
    // text run
    let next = src.indexOf('<', i)
    if (next < 0) next = src.length
    const text = src.slice(i, next)
    if (text.trim() || /\{\{/.test(text)) top().children.push({ text })
    i = next
  }
  return nodes
}

function findTagEnd(src, start) {
  let quote = null
  for (let i = start + 1; i < src.length; i++) {
    const c = src[i]
    if (quote) { if (c === quote) quote = null; continue }
    if (c === '"' || c === "'") { quote = c; continue }
    if (c === '>') return i
  }
  return -1
}

function parseAttrs(s) {
  const attrs = {}
  const re = /([a-zA-Z_:@][\w:.-]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  let m
  while ((m = re.exec(s))) {
    const name = m[1]
    const value = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5] !== undefined ? m[5] : ''
    attrs[name] = value
  }
  return attrs
}

// ---------------------------------------------------------------------------
// 2. expression + interpolation
// ---------------------------------------------------------------------------
const exprCache = new Map()
function evalExpr(expr, ctx) {
  let fn = exprCache.get(expr)
  if (!fn) {
    // eslint-disable-next-line no-new-func
    fn = new Function('$ctx', 'with ($ctx) { return (' + expr + ') }')
    exprCache.set(expr, fn)
  }
  try {
    return fn(ctx)
  } catch (e) {
    return ''
  }
}

function interp(str, ctx) {
  if (!str) return ''
  return str.replace(/\{\{([\s\S]*?)\}\}/g, (_all, expr) => {
    const v = evalExpr(expr.trim(), ctx)
    return v === undefined || v === null || v === false ? '' : String(v)
  })
}

function evalAttr(str, ctx) {
  const whole = /^\{\{([\s\S]*)\}\}$/.exec(str.trim())
  if (whole) return evalExpr(whole[1].trim(), ctx)
  return interp(str, ctx)
}

// ---------------------------------------------------------------------------
// 3. render
// ---------------------------------------------------------------------------
const TAG_MAP = {
  view: 'div',
  text: 'span',
  image: 'img',
  'scroll-view': 'div',
  block: null,
  input: 'input',
  textarea: 'textarea',
}

const MODE_FIT = { aspectFit: 'contain', aspectFill: 'cover', scaleToFill: 'fill', widthFix: 'fill' }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderNodes(nodes, ctx) {
  let out = ''
  let chain = null
  for (const node of nodes) {
    if (node.text !== undefined) {
      if (chain !== null) chain = null
      out += esc(interp(node.text, ctx))
      continue
    }
    const a = node.attrs

    // wx:for
    if (a['wx:for'] !== undefined) {
      chain = null
      const list = evalAttr(a['wx:for'], ctx) || []
      const arr = Array.isArray(list) ? list : []
      const itemName = a['wx:for-item'] || 'item'
      const indexName = a['wx:for-index'] || 'index'
      arr.forEach((item, index) => {
        const child = Object.create(ctx)
        child[itemName] = item
        child[indexName] = index
        child.$parent = ctx
        if (a['wx:if'] !== undefined && !truthy(evalAttr(a['wx:if'], child))) return
        out += renderOne(node, child)
      })
      continue
    }

    // if / elif / else chain
    if (a['wx:if'] !== undefined) {
      chain = truthy(evalAttr(a['wx:if'], ctx))
      if (chain) out += renderOne(node, ctx)
      continue
    }
    if (a['wx:elif'] !== undefined) {
      if (chain === false) {
        chain = truthy(evalAttr(a['wx:elif'], ctx))
        if (chain) out += renderOne(node, ctx)
      }
      continue
    }
    if (a['wx:else'] !== undefined) {
      if (chain === false) out += renderOne(node, ctx)
      chain = null
      continue
    }

    chain = null
    out += renderOne(node, ctx)
  }
  return out
}

const truthy = (v) => !(v === false || v === undefined || v === null || v === '' || v === 0)

function renderOne(node, ctx) {
  const a = node.attrs
  const tag = TAG_MAP[node.tag]
  if (tag === null) return renderNodes(node.children, ctx)

  let cls = a.class ? interp(a.class, ctx) : ''
  let style = ''
  let extra = ''

  if (node.tag === 'image') {
    const src = interp(a.src || '', ctx)
    const fit = MODE_FIT[a.mode] || 'fill'
    return `<img class="${esc(cls)}" src="${esc(toUrl(src))}" style="object-fit:${fit}" alt="" />`
  }

  if (node.tag === 'input') {
    const val = interp(a.value || '', ctx)
    const ph = a.placeholder ? interp(a.placeholder, ctx) : ''
    return `<input class="${esc(cls)}" value="${esc(val)}" placeholder="${esc(ph)}" />`
  }

  if (node.tag === 'textarea') {
    const val = interp(a.value || '', ctx)
    const ph = a.placeholder ? interp(a.placeholder, ctx) : ''
    return `<textarea class="${esc(cls)}" placeholder="${esc(ph)}">${esc(val)}</textarea>`
  }

  if (node.tag === 'scroll-view') {
    if (a['scroll-x'] !== undefined) style += 'overflow-x:auto;overflow-y:hidden;'
    if (a['scroll-y'] !== undefined) style += 'overflow-y:auto;'
    extra = ' data-scroll="1"'
  }

  if (a.hover === undefined && a['hover-class']) extra += ''

  const inner = renderNodes(node.children, ctx)
  const styleAttr = style ? ` style="${esc(style)}"` : ''
  return `<${tag} class="${esc(cls)}"${styleAttr}${extra}>${inner}</${tag}>`
}

function toUrl(src) {
  if (!src) return ''
  // assets resolve relative to .tmp/preview/
  if (src.startsWith('/assets')) return '../../miniprogram' + src
  return src
}

// ---------------------------------------------------------------------------
// 4. WXSS -> CSS
// ---------------------------------------------------------------------------
function convertWXSS(css) {
  // 750rpx is the screen width; render at a fixed 375px-wide canvas (1rpx = 0.5px)
  return css
    .replace(/(\d*\.?\d+)rpx/g, (_m, n) => `${parseFloat((parseFloat(n) / 2).toFixed(3))}px`)
    .replace(/env\(safe-area-inset-bottom\)/g, '0px')
    .replace(/(^|\n)\s*page\s*\{/g, '$1body {')
    .replace(/(^|\n)\s*page\b/g, '$1body')
}

function readWXSS(...files) {
  return files.map((f) => convertWXSS(fs.readFileSync(f, 'utf8'))).join('\n')
}

// ---------------------------------------------------------------------------
// 5. stub mini-program runtime, load a page, run onLoad
// ---------------------------------------------------------------------------
const noop = () => {}
global.wx = new Proxy(
  {},
  {
    get: (_t, key) => {
      if (key === 'getStorageSync') return () => undefined
      return noop
    },
  }
)
global.getApp = () => ({ globalData: {} })
global.App = noop

let captured = null
global.Page = (cfg) => { captured = cfg }

function loadPage(modulePath) {
  delete require.cache[require.resolve(modulePath)]
  captured = null
  require(modulePath)
  if (!captured) throw new Error('Page() was not called by ' + modulePath)
  const cfg = captured
  const ctx = Object.create(cfg)
  ctx.data = JSON.parse(JSON.stringify(cfg.data || {}))
  ctx.setData = function (patch, cb) {
    for (const key of Object.keys(patch)) {
      setPath(this.data, key, patch[key])
    }
    if (typeof cb === 'function') cb.call(this)
  }
  return ctx
}

function setPath(obj, key, value) {
  if (!key.includes('.')) { obj[key] = value; return }
  const parts = key.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
  cur[parts[parts.length - 1]] = value
}

// ---------------------------------------------------------------------------
// 6. build pages
// ---------------------------------------------------------------------------
const BASE_CSS = `
*{box-sizing:border-box;}
html{margin:0;padding:0;background:#FF00FF;width:375px;}
body{width:375px;margin:0;padding:0;overflow-x:hidden;}
body{font-family:"Microsoft YaHei","PingFang SC",-apple-system,sans-serif;}
img{display:inline-block;}
input,textarea{font-family:inherit;border:none;outline:none;background:transparent;resize:none;}
input::placeholder,textarea::placeholder{color:#B2BBC0;}
div,span{word-break:break-word;}
`

function buildHTML({ page, query, actions }) {
  const dir = path.join(RENDER, 'pages', page)
  const ctx = loadPage(path.join(dir, page + '.js'))
  if (typeof ctx.onLoad === 'function') ctx.onLoad(query || {})
  if (typeof ctx.onShow === 'function') ctx.onShow()
  if (actions) actions(ctx)

  const wxml = fs.readFileSync(path.join(MP, 'pages', page, page + '.wxml'), 'utf8')
  const ast = parseWXML(wxml)
  const body = renderNodes(ast, ctx.data)

  const css = readWXSS(
    path.join(MP, 'app.wxss'),
    path.join(MP, 'pages', page, page + '.wxss')
  )

  // screenshot-only: let the fixed action bar flow so the tall capture keeps it
  const SHOT_CSS = '.bottom-bar{position:static !important;}'

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>${BASE_CSS}\n${css}\n${SHOT_CSS}</style></head>
<body>${body}</body></html>`
}

// ---------------------------------------------------------------------------
// 7. build HTML for every page (Chrome does the screenshotting)
// ---------------------------------------------------------------------------
const SHOTS = [
  { name: 'home', page: 'home' },
  { name: 'products', page: 'products' },
  { name: 'detail', page: 'detail', query: { model: 'SL-113' } },
  { name: 'selector-1', page: 'selector' },
  {
    name: 'selector-3',
    page: 'selector',
    actions: (ctx) => {
      ctx.chooseScenario({ currentTarget: { dataset: { index: 3 } } })
      ctx.chooseMethod({ currentTarget: { dataset: { index: 1 } } })
    },
  },
  { name: 'sample', page: 'sample', query: { model: 'SL-113' } },
  { name: 'about', page: 'about' },
  { name: 'contact', page: 'contact' },
]

function main() {
  const dir = path.join(ROOT, '.tmp', 'preview')
  fs.mkdirSync(dir, { recursive: true })
  for (const shot of SHOTS) {
    const html = buildHTML(shot)
    fs.writeFileSync(path.join(dir, shot.name + '.html'), html, 'utf8')
    console.log('built ' + shot.name + '.html (' + (html.length / 1024).toFixed(0) + ' KB)')
  }
  fs.writeFileSync(path.join(dir, 'pages.json'), JSON.stringify(SHOTS.map((s) => s.name)), 'utf8')
}

main()
