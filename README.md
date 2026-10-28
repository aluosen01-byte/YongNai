# 永耐胶水 · 微信小程序

依据《永耐胶水 · 中英宣传册 20261028.pptx》内容重做的企业小程序。
原项目是微信官方 TypeScript 快速启动模板（Hello World），现已整体替换为面向
家具厂 / 板材厂 / 木门厂客户的选型与询盘工具。

## 页面结构

| 页面 | 路径 | 作用 |
| --- | --- | --- |
| 首页 | `pages/home/home` | 品牌主视觉、产能数据、六大优势、系列入口、常用型号、寄样流程、资质、CTA |
| 产品中心 | `pages/products/products` | 9 个系列筛选 + 关键词搜索 + 17 个型号列表 |
| 产品详情 | `pages/detail/detail?model=SL-113` | 规格参数、产品特点、施工与验收、相关型号、底部询价条 |
| 选胶助手 | `pages/selector/selector` | 三步选型：工况 → 涂胶方式 → 推荐型号与施胶建议 |
| 免费寄样 | `pages/sample/sample?model=SL-113` | 联系信息 + 工况信息的寄样申请表单 |
| 关于永耐 | `pages/about/about` | 简介、产能、生产流程、资质、专利、案例、政策、定制贴牌 |
| 联系我们 | `pages/contact/contact` | 创始人、电话/邮箱/地址、微信二维码、报价说明 |

底部 tabBar：首页 / 产品 / 选胶 / 联系。

## 内容与宣传册的对应关系

- 主视觉口号、公司简介、产能四项数据、六大优势 → 第 1–4 页
- 商标 / CNAS 检测报告 / ISO / 发明专利（七项）→ 第 5–6 页
- 五项生产流程与质检说明 → 第 3 页
- 九个系列、十七个在售型号的型号、用途、包装、固含量、适用木种、节拍 → 第 12–16 页
- 三种涂胶方式的对比（均匀性 / 用胶量 / 效率 / 适用场景）→ 第 17 页
- 定制与贴牌（包装 / 标签 / 配方）→ 第 18 页
- 寄样四步流程与验收口径 → 第 19 页
- 政策导向与 VOCs 减排政策 → 第 20–21 页
- 创始人、电话、邮箱、地址、报价说明 → 第 23 页

集团工程案例（肇庆 / 深圳 / 安溪与广州）来自第 7–10 页，页面中按宣传册口径标注为
「集团工程案例」，并保留「先打样、再上产线」的说明，避免与胶水客户案例混淆。

宣传册第 11 页（贝之然 BEST LAND 无机涂料）与第 22 页（推广矩阵，属内部渠道清单）
与本小程序面向的胶水客户无关，未采用。

## 与宣传册不一致处的处理

1. **黄胶档位**：第 4 页写「45%~50% 与 50%~52% 两档」，但第 14 页产品页给出
   SL-730（40%~45%）、SL-740（45%~50%）、SL-750（50%~55%）三档。以产品页为准，
   全站按三档表述，且正好凑齐「十七个在售型号」。
2. **英文口号拼写**：原册为 `ONCE CONTACT, NEVER SEPERATE`，已更正为
   `SEPARATE`，并统一在首页与联系页使用。
3. **SL-730 产品图**：原册第 14 页只有 SL-740 / SL-750 的桶图。已按 SL-740 的原图
   重绘标签文字（型号 SL-730、固含量 40%~45%），字重、字号与位置与原图一致。

## 数据与素材

- `data/products.ts`：9 个系列、17 个型号、10 个选胶工况、3 种涂胶方式。
- `data/company.ts`：公司信息、联系方式、产能、优势、流程、资质、专利、案例、政策、定制。
- `assets/products/*.jpg`：从 PPT 内嵌图自动裁白边并压缩到 460px。
- `assets/company|certs|cases/*`：厂房、证书、工程案例照片。
- `assets/icon/*`：tabBar 与首页快捷入口图标（脚本绘制）。
- `assets/brand/logo.png`：品牌标志。由 `docs/brand/logo-source.png`（原始白底 PNG）
  经过去白（unmultiply，保留透明通道与彩色贝壳的渐变边缘）、裁掉四周留白后得到，
  宽 560px。首页主视觉、公司简介、联系页页脚共用这一张。

主包合计约 1.3 MB，低于 2 MB 限制。

## 设计预览

`docs/preview/` 下的图片由 `.tools/preview.js` + `.tools/shoot.ps1` 生成：脚本读取
真实的 WXML / WXSS 与页面模块（用桩替换 `Page()` 与 `wx`，再执行 `onLoad`），
把 750rpx 折算成 375px 画布后用无头 Chrome 截图，因此版式与真机基本一致，
但**不是微信开发者工具或真机截图**，导航栏与 tabBar 由客户端接管、不在预览内。

- `docs/preview/home.jpg`
- `docs/preview/products.jpg`
- `docs/preview/selector.jpg`
- `docs/preview/contact.jpg`

## 接入后台

寄样申请默认只保存在本机（`wx.setStorageSync('yn_sample_orders')`），便于先上线。
在 `config.ts` 里把 `API_BASE` 填成后端地址后，提交会自动
`POST {API_BASE}/api/sample`，同时仍保留本地副本。

## 本地开发

用微信开发者工具「导入项目」选择仓库根目录即可，`miniprogramRoot` 已指向
`miniprogram/`，TypeScript 编译插件已在 `project.config.json` 中开启。

### 维护脚本（`.tools/`）

```powershell
# 从 PPT 重新生成图片素材
pwsh .tools/build-assets.ps1
# 从 docs/brand/logo-source.png 重新生成透明底品牌标志
pwsh .tools/build-logo.ps1
# 重新生成 tabBar / 快捷入口图标
pwsh .tools/build-icons.ps1
# 校验 JSON、页面完整性、资源引用、WXML 标签与括号、事件绑定
node .tools/validate.js
# 校验 9 系列 / 17 型号与选型表的一致性
node .tools/check-data.js
# 重新渲染设计预览（需要本机安装 Chrome）
pwsh .tools/shoot.ps1
```
