import {
  ACCEPTANCE_NOTE,
  APPLY_METHODS,
  ApplyMethod,
  COATING_NOTE,
  Product,
  SCENARIOS,
  Scenario,
  findProduct,
} from '../../data/products'

Page({
  data: {
    step: 1,
    scenarios: SCENARIOS,
    methods: APPLY_METHODS,
    scenario: null as Scenario | null,
    method: null as ApplyMethod | null,
    primary: null as Product | null,
    alternatives: [] as Product[],
    acceptanceNote: ACCEPTANCE_NOTE,
    coatingNote: COATING_NOTE,
  },

  chooseScenario(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    const scenario = this.data.scenarios[index]
    if (!scenario) {
      return
    }
    this.setData({ scenario, step: 2 })
  },

  chooseMethod(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    const method = this.data.methods[index]
    const scenario = this.data.scenario
    if (!method || !scenario) {
      return
    }

    const picks = scenario.picks
      .map((model) => findProduct(model))
      .filter((item): item is Product => Boolean(item))

    this.setData({
      method,
      primary: picks.length ? picks[0] : null,
      alternatives: picks.slice(1),
      step: 3,
    })
  },

  back() {
    if (this.data.step <= 1) {
      return
    }
    this.setData({ step: this.data.step - 1 })
  },

  restart() {
    this.setData({
      step: 1,
      scenario: null,
      method: null,
      primary: null,
      alternatives: [],
    })
  },

  editStep(e: any) {
    const step = Number(e.currentTarget.dataset.step)
    // 只允许回到已经走完的步骤，避免出现空白结果页
    if (step >= 2 && !this.data.scenario) {
      return
    }
    if (step >= 3 && !this.data.primary) {
      return
    }
    this.setData({ step })
  },

  openProduct(e: any) {
    const model = e.currentTarget.dataset.model as string
    wx.navigateTo({ url: `/pages/detail/detail?model=${model}` })
  },

  goSample() {
    const primary = this.data.primary
    const model = primary ? primary.model : ''
    wx.navigateTo({ url: `/pages/sample/sample?model=${model}` })
  },

  onShareAppMessage() {
    return { title: '永耐选胶助手 · 按基材与工况选型号', path: '/pages/selector/selector' }
  },
})
