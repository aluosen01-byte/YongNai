/* Data integrity checks for the product/company content. */
const fs = require('fs')
const path = require('path')

const OUT = 'D:/projects/YongNai/.tmp/data'
const load = (name) => require(path.join(OUT, name + '.js'))

const { SERIES, PRODUCTS, SCENARIOS, APPLY_METHODS, findProduct } = load('products')
const company = load('company')

let errors = 0
const check = (cond, msg) => {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg)
  if (!cond) errors++
}

console.log('\n[series & models]')
check(SERIES.length === 9, `9 series declared (got ${SERIES.length})`)
check(PRODUCTS.length === 17, `17 models declared (got ${PRODUCTS.length})`)

for (const s of SERIES) {
  const n = PRODUCTS.filter((p) => p.seriesId === s.id).length
  check(n > 0, `series "${s.name}" has ${n} model(s)`)
}

const ids = new Set(PRODUCTS.map((p) => p.model))
check(ids.size === PRODUCTS.length, 'model codes are unique')

for (const p of PRODUCTS) {
  check(SERIES.some((s) => s.id === p.seriesId), `${p.model} series exists (${p.seriesId})`)
  check(p.seriesName === (SERIES.find((s) => s.id === p.seriesId) || {}).name, `${p.model} seriesName matches series`)
  check(/^\/assets\/products\/.+\.jpg$/.test(p.image), `${p.model} image path shaped correctly`)
  check(/^SL-\d+|^PH-7$/.test(p.model), `${p.model} model code pattern`)
}

console.log('\n[selector scenarios]')
for (const s of SCENARIOS) {
  for (const m of s.picks) {
    check(Boolean(findProduct(m)), `scenario "${s.id}" pick ${m} resolves to a product`)
  }
  check(s.picks.length > 0, `scenario "${s.id}" has at least one pick`)
}
check(APPLY_METHODS.length === 3, '3 application methods')

// every product reachable from at least one scenario or explicitly general
const reachable = new Set(SCENARIOS.flatMap((s) => s.picks))
const unreachable = PRODUCTS.filter((p) => !reachable.has(p.model)).map((p) => p.model)
check(unreachable.length === 0, `all models reachable from the selector (missing: ${unreachable.join(', ') || 'none'})`)

console.log('\n[company content]')
check(company.CERTIFICATIONS.length === 4, '4 certifications')
check(company.PATENTS.length === 7, '7 patents')
check(company.STATS.length === 4, '4 capacity stats')
check(company.ADVANTAGES.length === 6, '6 advantages')
check(company.PRODUCTION_STEPS.length === 5, '5 production steps')
check(company.SAMPLE_STEPS.length === 4, '4 sampling steps')
check(company.POLICIES.length === 4, '4 policy items')
check(company.VOC_POINTS.length === 4, '4 VOC policy items')
check(company.CASES.length === 3, '3 case studies')
check(company.CUSTOMIZATION.length === 3, '3 customization items')

for (const c of company.CERTIFICATIONS) {
  check(/^\/assets\/certs\//.test(c.image), `cert image path ${c.id}`)
}
for (const c of company.CASES) {
  check(/^\/assets\/cases\//.test(c.image), `case image path ${c.id}`)
}

console.log('\n[contact]')
check(/^1[3-9]\d{9}$/.test(company.CONTACT.phone), `phone is a valid mobile: ${company.CONTACT.phone}`)
check(/@/.test(company.CONTACT.email), `email looks valid: ${company.CONTACT.email}`)

console.log('\n[bilingual copy]')
const brand = company.BRAND
check(brand.sloganEn === 'ONCE CONTACT, NEVER SEPARATE', 'slogan EN spelled correctly (source PPT had "SEPERATE")')

console.log('\n=== ' + (errors ? errors + ' FAILED check(s)' : 'all checks passed') + ' ===')
process.exit(errors ? 1 : 0)
