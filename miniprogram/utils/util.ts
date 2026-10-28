export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

/** 轻提示 */
export const toast = (title: string, icon: 'success' | 'error' | 'none' = 'none') => {
  wx.showToast({ title, icon, duration: 1600 })
}

/** 拨打电话 */
export const callPhone = (phoneNumber: string) => {
  wx.makePhoneCall({
    phoneNumber,
    fail: () => {
      // 用户取消或设备不支持时静默处理，避免打扰
    },
  })
}

/** 复制文本到剪贴板；未配置隐私指引导致调用失败时，弹窗让用户手动记录 */
export const copyText = (data: string, tip = '已复制') => {
  wx.setClipboardData({
    data,
    success: () => {
      wx.showToast({ title: tip, icon: 'success', duration: 1200 })
    },
    fail: () => {
      wx.showModal({
        title: '请手动记录',
        content: data,
        showCancel: false,
        confirmText: '知道了',
      })
    },
  })
}

/** 预览图片（支持多张） */
export const previewImages = (urls: string[], current?: string) => {
  if (!urls.length) {
    return
  }
  wx.previewImage({ urls, current: current || urls[0] })
}

/** 校验中国大陆手机号 */
export const isPhone = (value: string) => /^1[3-9]\d{9}$/.test(value)
