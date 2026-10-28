import { BRAND, CONTACT, QUOTE_NOTE } from '../../data/company'
import { callPhone, copyText, toast } from '../../utils/util'

Page({
  data: {
    brand: BRAND,
    contact: CONTACT,
    quoteNote: QUOTE_NOTE,
  },

  onCall() {
    callPhone(CONTACT.phone)
  },

  copyPhone() {
    copyText(CONTACT.phone, '电话已复制')
  },

  copyEmail() {
    copyText(CONTACT.email, '邮箱已复制')
  },

  copyAddress() {
    copyText(CONTACT.address, '地址已复制')
  },

  previewQr() {
    wx.previewImage({ urls: [CONTACT.qr], current: CONTACT.qr })
  },

  saveQr() {
    wx.showLoading({ title: '保存中', mask: true })
    wx.getImageInfo({
      src: CONTACT.qr,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => {
            wx.hideLoading()
            toast('已保存到相册', 'success')
          },
          fail: (err) => {
            wx.hideLoading()
            if (err.errMsg && err.errMsg.indexOf('auth deny') >= 0) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中允许保存图片到相册。',
                confirmText: '去设置',
                success: (r) => {
                  if (r.confirm) {
                    wx.openSetting({})
                  }
                },
              })
              return
            }
            toast('保存失败，可长按图片保存')
          },
        })
      },
      fail: () => {
        wx.hideLoading()
        toast('图片加载失败')
      },
    })
  },

  goSample() {
    wx.navigateTo({ url: '/pages/sample/sample' })
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  onShareAppMessage() {
    return { title: '永耐胶水 · 联系方式与报价说明', path: '/pages/contact/contact' }
  },
})
