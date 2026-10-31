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

/** 转发给好友的分享封面：微信卡片按 5:4 展示 */
export const SHARE_COVER = '/assets/share/share-cover.png'

/** 分享到朋友圈的封面：朋友圈按 1:1 展示，用 5:4 会被裁掉上下 */
export const SHARE_TIMELINE_COVER = '/assets/share/share-timeline.png'
