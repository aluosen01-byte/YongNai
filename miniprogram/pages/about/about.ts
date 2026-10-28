import {
  CASES,
  CASE_NOTE,
  CERTIFICATIONS,
  CUSTOMIZATION,
  CUSTOMIZATION_NOTE,
  INTRO,
  PATENTS,
  PATENT_NOTE,
  POLICIES,
  POLICY_DISCLAIMER,
  POLICY_NOTE,
  PRODUCTION_NOTE,
  PRODUCTION_STEPS,
  STATS,
  VOC_POINTS,
} from '../../data/company'
import { previewImages } from '../../utils/util'

Page({
  data: {
    intro: INTRO,
    stats: STATS,
    steps: PRODUCTION_STEPS,
    productionNote: PRODUCTION_NOTE,
    certs: CERTIFICATIONS,
    patents: PATENTS,
    patentNote: PATENT_NOTE,
    cases: CASES,
    caseNote: CASE_NOTE,
    policies: POLICIES,
    vocPoints: VOC_POINTS,
    policyNote: POLICY_NOTE,
    policyDisclaimer: POLICY_DISCLAIMER,
    custom: CUSTOMIZATION,
    customNote: CUSTOMIZATION_NOTE,
    factoryImages: [
      '/assets/company/office.jpg',
      '/assets/company/warehouse.jpg',
      '/assets/company/drums.jpg',
    ],
  },

  previewCert(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    const urls = this.data.certs.map((item) => item.image)
    previewImages(urls, urls[index])
  },

  previewCase(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    const urls = this.data.cases.map((item) => item.image)
    previewImages(urls, urls[index])
  },

  previewFactory(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    const urls = this.data.factoryImages
    previewImages(urls, urls[index])
  },

  goContact() {
    wx.switchTab({ url: '/pages/contact/contact' })
  },

  goSample() {
    wx.navigateTo({ url: '/pages/sample/sample' })
  },

  onShareAppMessage() {
    return { title: '关于永耐胶水 · 水性胶粘剂自有产线', path: '/pages/about/about' }
  },
})
