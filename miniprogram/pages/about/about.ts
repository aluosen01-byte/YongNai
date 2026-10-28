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
import { SHARE_COVER } from '../../config'
import { enableShare, goTab, previewImages } from '../../utils/util'

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

  onLoad() {
    enableShare()
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
    goTab('/pages/contact/contact')
  },

  goSample() {
    wx.navigateTo({ url: '/pages/sample/sample' })
  },

  onShareAppMessage() {
    return {
      title: '关于永耐胶水 · 水性胶粘剂自有产线',
      path: '/pages/about/about',
      imageUrl: SHARE_COVER,
    }
  },

  onShareTimeline() {
    return {
      title: '永耐胶水 · 4,000 ㎡ 自有厂房，年产一万余吨，七项发明专利',
      query: '',
      imageUrl: SHARE_COVER,
    }
  },
})
