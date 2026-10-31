import { findProduct, PRODUCTS, Product } from '../../data/products'
import { SHARE_COVER, SHARE_TIMELINE_COVER } from '../../config'
import { callPhone, enableShare, goTab } from '../../utils/util'

const PHONE = '13723757790'

interface SpecRow {
  label: string
  value: string
}

Page({
  data: {
    product: null as Product | null,
    specs: [] as SpecRow[],
    related: [] as Array<{ model: string; name: string; image: string; usage: string }>,
    notFound: false,
  },

  onLoad(query: Record<string, string | undefined>) {
    enableShare()
    const model = query.model || ''
    const product = findProduct(model)

    if (!product) {
      this.setData({ notFound: true })
      return
    }

    const specs: SpecRow[] = [
      { label: '产品型号', value: product.model },
      { label: '所属系列', value: `${product.seriesName}系列` },
      { label: '主要用途', value: product.usage },
      { label: '包装规格', value: product.packing },
    ]
    if (product.solid) {
      specs.push({ label: '固含量', value: product.solid })
    }
    if (product.wood) {
      specs.push({ label: '适用木种', value: product.wood })
    }
    if (product.cure) {
      specs.push({ label: '可进下道工序', value: product.cure })
    }

    // 相关系列型号优先，其次按用途标签推荐
    let related = PRODUCTS.filter(
      (item) => item.seriesId === product.seriesId && item.model !== product.model
    )
    if (!related.length) {
      related = PRODUCTS.filter(
        (item) =>
          item.model !== product.model && item.tags.some((tag) => product.tags.includes(tag))
      )
    }

    wx.setNavigationBarTitle({ title: `${product.model} ${product.name}` })

    this.setData({
      product,
      specs,
      related: related.slice(0, 4).map((item) => ({
        model: item.model,
        name: item.name,
        image: item.image,
        usage: item.usage,
      })),
    })
  },

  previewImage() {
    const product = this.data.product
    if (product) {
      wx.previewImage({ urls: [product.image] })
    }
  },

  openRelated(e: any) {
    const model = e.currentTarget.dataset.model as string
    wx.redirectTo({ url: `/pages/detail/detail?model=${model}` })
  },

  goSample() {
    const product = this.data.product
    const model = product ? product.model : ''
    wx.navigateTo({ url: `/pages/sample/sample?model=${model}` })
  },

  callSales() {
    callPhone(PHONE)
  },

  backToList() {
    goTab('/pages/products/products')
  },

  onShareAppMessage() {
    const product = this.data.product
    return {
      title: product ? `永耐 ${product.model} ${product.name} · ${product.usage}` : '永耐胶水',
      path: `/pages/detail/detail?model=${product ? product.model : ''}`,
      imageUrl: SHARE_COVER,
    }
  },

  onShareTimeline() {
    const product = this.data.product
    return {
      title: product ? `永耐 ${product.model} ${product.name}｜${product.usage}` : '永耐胶水',
      query: `model=${product ? product.model : ''}`,
      imageUrl: SHARE_TIMELINE_COVER,
    }
  },
})
