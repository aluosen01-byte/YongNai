import { PRODUCTS, SERIES, Product } from '../../data/products'

interface Chip {
  id: string
  name: string
  count: number
}

Page({
  data: {
    chips: [] as Chip[],
    active: 'all',
    keyword: '',
    list: [] as Product[],
    total: 0,
    seriesDesc: '',
  },

  onLoad() {
    const chips: Chip[] = [{ id: 'all', name: '全部', count: PRODUCTS.length }].concat(
      SERIES.map((item) => ({
        id: item.id,
        name: item.name,
        count: PRODUCTS.filter((product) => product.seriesId === item.id).length,
      }))
    )
    this.setData({ chips })
    this.apply()
  },

  onShow() {
    const pending = wx.getStorageSync('yn_series_filter')
    if (!pending) {
      return
    }
    wx.removeStorageSync('yn_series_filter')
    if (pending !== this.data.active) {
      this.setData({ active: pending })
      this.apply()
    }
  },

  apply() {
    const active = this.data.active
    const keyword = this.data.keyword.trim().toLowerCase()

    let list = PRODUCTS
    if (active !== 'all') {
      list = list.filter((product) => product.seriesId === active)
    }
    if (keyword) {
      list = list.filter((product) =>
        `${product.model} ${product.name} ${product.usage} ${product.keywords}`
          .toLowerCase()
          .includes(keyword)
      )
    }

    const series = SERIES.find((item) => item.id === active)
    this.setData({
      list,
      total: list.length,
      seriesDesc: series ? series.desc : '',
    })
  },

  selectChip(e: any) {
    const id = e.currentTarget.dataset.id as string
    if (id === this.data.active) {
      return
    }
    this.setData({ active: id }, () => this.apply())
  },

  onSearch(e: any) {
    this.setData({ keyword: e.detail.value as string }, () => this.apply())
  },

  clearSearch() {
    this.setData({ keyword: '' }, () => this.apply())
  },

  reset() {
    this.setData({ active: 'all', keyword: '' }, () => this.apply())
  },

  openDetail(e: any) {
    const model = e.currentTarget.dataset.model as string
    wx.navigateTo({ url: `/pages/detail/detail?model=${model}` })
  },

  goSelector() {
    wx.switchTab({ url: '/pages/selector/selector' })
  },

  onShareAppMessage() {
    return { title: '永耐胶水 · 产品中心（九大系列 / 十七个型号）', path: '/pages/products/products' }
  },
})
