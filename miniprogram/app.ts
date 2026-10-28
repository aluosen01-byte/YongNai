// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 记录最近一次的寄样申请，便于下次填写时复用
    const history = wx.getStorageSync('yn_sample_history')
    if (history && !Array.isArray(history)) {
      wx.removeStorageSync('yn_sample_history')
    }
  },
})
