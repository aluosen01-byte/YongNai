import { API_BASE, HAS_BACKEND, SAMPLE_PATH, SHARE_COVER } from '../../config'
import { findProduct } from '../../data/products'
import { callPhone, enableShare, goTab, isPhone, toast } from '../../utils/util'

const PHONE = '13723757790'
const STORAGE_KEY = 'yn_sample_orders'

const SUBSTRATES = [
  '普通木 / 杂木',
  '硬木 / 高端木',
  '松木 / 软木',
  '人造板 / 板材',
  '木皮',
  '石材 / 大理石',
  '其他',
]

const METHODS = ['手工刷胶', '滚筒 / 刮板', '机械辊涂 / 淋涂', '尚未确定']

const ACCEPTANCES = ['65℃ 水煮 3 小时不开裂', '常温常规粘接', '按企业验收标准', '待确认']

Page({
  data: {
    substrates: SUBSTRATES,
    methods: METHODS,
    acceptances: ACCEPTANCES,
    form: {
      company: '',
      name: '',
      phone: '',
      region: '',
      substrate: '',
      method: '',
      acceptance: '',
      model: '',
      remark: '',
    },
    submitted: false,
    submitting: false,
    recordTime: '',
    hasBackend: HAS_BACKEND,
  },

  onLoad(query: Record<string, string | undefined>) {
    enableShare()
    const model = query.model || ''
    if (model) {
      const product = findProduct(model)
      const label = product ? `${product.model} ${product.name}` : model
      this.setData({ 'form.model': label })
    }
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string
    const value = e.detail.value as string
    this.setData({ [`form.${field}`]: value } as any)
  },

  pickSubstrate(e: any) {
    this.setData({ 'form.substrate': e.currentTarget.dataset.value as string })
  },

  pickMethod(e: any) {
    this.setData({ 'form.method': e.currentTarget.dataset.value as string })
  },

  pickAcceptance(e: any) {
    this.setData({ 'form.acceptance': e.currentTarget.dataset.value as string })
  },

  submit() {
    const form = this.data.form
    if (!form.name.trim()) {
      toast('请填写联系人')
      return
    }
    if (!isPhone(form.phone.trim())) {
      toast('请填写正确的手机号')
      return
    }
    if (this.data.submitting) {
      return
    }

    const payload = {
      company: form.company.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      region: form.region.trim(),
      substrate: form.substrate,
      method: form.method,
      acceptance: form.acceptance,
      model: form.model.trim(),
      remark: form.remark.trim(),
      createdAt: Date.now(),
    }

    this.setData({ submitting: true })

    const done = (time: string) => {
      const history = wx.getStorageSync(STORAGE_KEY)
      const list = Array.isArray(history) ? history : []
      list.unshift(payload)
      wx.setStorageSync(STORAGE_KEY, list.slice(0, 20))
      this.setData({ submitted: true, submitting: false, recordTime: time })
    }

    const stamp = this.formatNow()

    if (HAS_BACKEND) {
      wx.request({
        url: `${API_BASE}${SAMPLE_PATH}`,
        method: 'POST',
        data: payload,
        timeout: 10000,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            done(stamp)
          } else {
            this.setData({ submitting: false })
            toast('提交失败，请直接电话联系')
          }
        },
        fail: () => {
          this.setData({ submitting: false })
          toast('网络异常，请直接电话联系')
        },
      })
      return
    }

    // 未配置后台时，先在本机保存，避免用户填写的信息丢失
    wx.showLoading({ title: '提交中', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      done(stamp)
    }, 450)
  },

  formatNow() {
    const now = new Date()
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`
  },

  callSales() {
    callPhone(PHONE)
  },

  resetForm() {
    this.setData({
      submitted: false,
      form: {
        company: '',
        name: '',
        phone: '',
        region: '',
        substrate: '',
        method: '',
        acceptance: '',
        model: '',
        remark: '',
      },
    })
  },

  goHome() {
    goTab('/pages/home/home')
  },

  onShareAppMessage() {
    return {
      title: '永耐胶水 · 免费寄样与试胶支持',
      path: '/pages/sample/sample',
      imageUrl: SHARE_COVER,
    }
  },

  onShareTimeline() {
    return {
      title: '永耐胶水 · 寄样与试胶不收费，样块确认后再谈批量',
      query: '',
      imageUrl: SHARE_COVER,
    }
  },
})
