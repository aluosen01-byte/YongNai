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

/** 打开右上角菜单里的「转发给好友」与「分享到朋友圈」 */
export const enableShare = () => {
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  } as WechatMiniprogram.ShowShareMenuOption)
}

/** 是否从朋友圈「单页模式」进入（scene 1154）：该模式下没有 tabBar */
const isSinglePageMode = (): boolean => {
  const api = (wx as unknown as { getEnterOptionsSync?: () => { scene?: number } })
    .getEnterOptionsSync
  if (typeof api !== 'function') {
    return false
  }
  try {
    return api().scene === 1154
  } catch (e) {
    return false
  }
}

/**
 * 跳转到 tabBar 页面。
 * 单页模式下 switchTab 不可用，退化成 navigateTo，否则分享到朋友圈的链接点了没反应。
 */
export const goTab = (url: string) => {
  if (isSinglePageMode()) {
    wx.navigateTo({ url })
    return
  }
  wx.switchTab({ url })
}
