import { PRODUCTS, SERIES } from '../../data/products'
import {
  ADVANTAGES,
  ADVANTAGE_NOTE,
  CERTIFICATIONS,
  SAMPLE_STEPS,
  STATS,
} from '../../data/company'
import { SHARE_COVER } from '../../config'
import { callPhone, enableShare, goTab } from '../../utils/util'

const FEATURED = ['SL-113', 'SL-101', 'SL-286', 'SL-128']
const PHONE = '13723757790'

interface QuickEntry {
  text: string
  icon: string
  nav: 'products' | 'selector' | 'sample' | 'about'
}

Page({
  data: {
    heroTags: ['非易燃易爆', '65℃ 水煮 3 小时', '中英文 · 可贴牌'],
    stats: STATS,
    advantages: ADVANTAGES,
    advantageNote: ADVANTAGE_NOTE,
    sampleSteps: SAMPLE_STEPS,
    certs: CERTIFICATIONS,
    phone: PHONE,
    seriesList: [] as Array<{
      id: string
      name: string
      en: string
      count: string
    }>,
    featured: [] as Array<{
      model: string
      name: string
      image: string
      usage: string
      packing: string
    }>,
    quick: [
      { text: '全部产品', icon: '/assets/icon/products.png', nav: 'products' },
      { text: '选胶助手', icon: '/assets/icon/selector.png', nav: 'selector' },
      { text: '免费寄样', icon: '/assets/icon/sample.png', nav: 'sample' },
      { text: '关于永耐', icon: '/assets/icon/about.png', nav: 'about' },
    ] as QuickEntry[],
  },

  onLoad() {
    enableShare()
    const seriesList = SERIES.map((item) => {
      const models = PRODUCTS.filter((product) => product.seriesId === item.id)
      return {
        id: item.id,
        name: item.name,
        en: item.en,
        count: `${models.length} 个型号`,
      }
    })

    const featured = FEATURED.map((model) => PRODUCTS.find((item) => item.model === model))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        model: item.model,
        name: item.name,
        image: item.image,
        usage: item.usage,
        packing: item.packing,
      }))

    this.setData({ seriesList, featured })
  },

  onQuick(e: any) {
    const nav = e.currentTarget.dataset.nav as QuickEntry['nav']
    if (nav === 'products' || nav === 'selector') {
      goTab(`/pages/${nav}/${nav}`)
      return
    }
    wx.navigateTo({ url: `/pages/${nav}/${nav}` })
  },

  goSelector() {
    goTab('/pages/selector/selector')
  },

  goSample() {
    wx.navigateTo({ url: '/pages/sample/sample' })
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  openSeries(e: any) {
    const id = e.currentTarget.dataset.id as string
    wx.setStorageSync('yn_series_filter', id)
    goTab('/pages/products/products')
  },

  openProduct(e: any) {
    const model = e.currentTarget.dataset.model as string
    wx.navigateTo({ url: `/pages/detail/detail?model=${model}` })
  },

  callSales() {
    callPhone(PHONE)
  },

  onShareAppMessage() {
    return {
      title: '永耐胶水 · 一次接触，永不分离',
      path: '/pages/home/home',
      imageUrl: SHARE_COVER,
    }
  },

  onShareTimeline() {
    return {
      title: '永耐胶水 · 水性环保胶粘剂，九大系列 17 个在售型号',
      query: '',
      imageUrl: SHARE_COVER,
    }
  },
})
