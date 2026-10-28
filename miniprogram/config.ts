/**
 * 小程序配置
 *
 * API_BASE：寄样申请的接收地址。
 * 留空时申请只会保存在本机（便于先上线、后接后台），
 * 填上后端地址后会自动 POST 一份 JSON 过去。
 */
export const API_BASE = ''

export const SAMPLE_PATH = '/api/sample'

/** 是否已配置后台 */
export const HAS_BACKEND = API_BASE.length > 0

/** 转发 / 朋友圈统一使用的 5:4 分享封面 */
export const SHARE_COVER = '/assets/share/share-cover.png'
