/**
 * 公司与推广内容 —— 取自《永耐胶水 · 中英宣传册 20261028》
 */

export const BRAND = {
  name: '永耐胶水',
  en: 'YONGNAI ADHESIVE',
  slogan: '一次接触，永不分离',
  sloganEn: 'ONCE CONTACT, NEVER SEPARATE',
  tagline: '水性环保胶粘剂',
  taglineEn: 'Water-based Adhesive',
  company: '东莞市永耐环保科技有限公司',
  companyEn: 'Dongguan Yongnai Environmental Technology Co., Ltd.',
}

export const CONTACT = {
  founder: '罗世伟',
  founderEn: 'Luo ShiWei',
  role: '品牌创始人',
  phone: '13723757790',
  phoneDisplay: '+86 137 2375 7790',
  email: '190370356@qq.com',
  address: '东莞市大岭山镇杨屋越秀大厦',
  addressShort: '东莞市大岭山镇',
  qr: '/assets/company/wechat-qr.png',
}

export interface StatItem {
  value: string
  unit: string
  label: string
  en: string
}

export const STATS: StatItem[] = [
  { value: '4,000', unit: '㎡', label: '自有厂房', en: 'Own plant' },
  { value: '10', unit: '台+', label: '生产设备', en: 'Production units' },
  { value: '10,000', unit: '吨+', label: '年产量', en: 'Tons per year' },
  { value: '30', unit: '吨+', label: '日产量', en: 'Tons per day' },
]

export const INTRO = {
  title: '公司简介',
  en: 'Company Profile',
  paragraphs: [
    '东莞市永耐环保科技有限公司专注水性胶粘剂的生产与销售，自有厂房与生产线，为家具厂、板材厂、木门厂供货。',
    '产品覆盖白乳胶、拼板胶、黄胶、AB 胶、木皮胶、热熔胶、青红胶、压板胶与固化剂九个系列，二十公斤到一千二百公斤桶装。',
    '只做水性体系，非易燃易爆；可按客户基材与验收标准寄样，样块确认后再谈批量。',
  ],
  paragraphsEn: [
    'Dongguan Yongnai focuses on water-based adhesives, with its own plant and production line.',
    'Nine series covering assembly, lamination, pressing and veneering, packed from 20 kg to 1,200 kg.',
    'Water-based only, non-flammable; free samples against your substrate and standard.',
  ],
}

export interface Advantage {
  no: string
  title: string
  desc: string
}

export const ADVANTAGES: Advantage[] = [
  {
    no: '01',
    title: '型号全覆盖',
    desc: '九个系列、十七个在售型号，组装、拼板、压板、贴面一次配齐。',
  },
  {
    no: '02',
    title: '按木种选型',
    desc: '普通木、高端木、松木软木各有对应型号，不用试错。',
  },
  {
    no: '03',
    title: '固含量分档',
    desc: '黄胶 40%~45%、45%~50%、50%~55% 三档，按预算与含胶量选择。',
  },
  {
    no: '04',
    title: '质检可验证',
    desc: '按 65℃ 水煮 3 小时不开裂的验收口径寄样验证。',
  },
  {
    no: '05',
    title: '自有产线',
    desc: '4,000 ㎡ 厂房、年产一万余吨，返单快、批次稳、库存足。',
  },
  {
    no: '06',
    title: '包装灵活',
    desc: '20 / 25 / 50 / 220 / 1200 kg 桶装，可做中英文与贴牌。',
  },
]

export const ADVANTAGE_NOTE =
  '胶水是看不见效果的产品，所以我们把选型标准、验收口径与样品都放在前面：先用你的基材试，再谈价格与批量。'

export interface ProcessStep {
  no: string
  title: string
  en: string
  desc: string
}

export const PRODUCTION_STEPS: ProcessStep[] = [
  { no: '01', title: '原料检验', en: 'Incoming inspection', desc: '进厂原料逐批核对，合格后进入投料区。' },
  { no: '02', title: '投料反应', en: 'Mixing & reaction', desc: '按配方投料，反应釜控温控时。' },
  { no: '03', title: '研磨过滤', en: 'Grinding & filtering', desc: '研磨细化后过滤，控制颗粒与杂质。' },
  { no: '04', title: '灌装封口', en: 'Filling & sealing', desc: '按规格灌装封口，对应 20~1200 kg 桶装。' },
  { no: '05', title: '入库检验', en: 'Final inspection', desc: '留样与检验合格后入库，批次可追溯。' },
]

export const PRODUCTION_NOTE =
  '自有产线与质检环节，让返单更快、批次更稳：常规型号常备库存，定制订单按排产交付。'

export interface Certification {
  id: string
  title: string
  en: string
  desc: string
  image: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'trademark',
    title: '公司商标注册证',
    en: 'Trademark Registration',
    desc: '自主商标注册，品牌与包装可追溯。',
    image: '/assets/certs/trademark.jpg',
  },
  {
    id: 'report',
    title: 'CNAS 检测报告',
    en: 'CNAS Test Report',
    desc: '第三方检测报告，可按需提供。',
    image: '/assets/certs/report.jpg',
  },
  {
    id: 'iso',
    title: 'ISO 三体认证',
    en: 'ISO Certification',
    desc: '质量、环境与职业健康安全管理体系。',
    image: '/assets/certs/iso.jpg',
  },
  {
    id: 'patent',
    title: '发明专利证书',
    en: 'Invention Patents',
    desc: '集团已获授权发明专利七项。',
    image: '/assets/certs/patent.jpg',
  },
]

export const PATENTS: string[] = [
  '一种复式无机钙矾石内外墙涂料',
  '一种无机隧道防火涂料',
  '一种户外专用水性环保防火木器漆及其制备方法',
  '一种船舶水线区专用水性防腐蚀涂料及其制备方法',
  '无机贝壳粉末涂料涂层增强稳定促进剂',
  '一种无机真石漆涂层增强稳定添加剂及制备方法',
  '一种速溶环保腻子胶粉',
]

export const PATENT_NOTE =
  '研发能力是共用的：集团在无机材料上的专利积累，同样支撑永耐水性胶粘剂的配方开发。'

export interface CaseItem {
  id: string
  title: string
  en: string
  location: string
  detail: string
  image: string
}

export const CASES: CaseItem[] = [
  {
    id: 'zhaoqing',
    title: '肇庆市端州区波海蓝湾会所',
    en: 'Zhaoqing · Bohai Lanwan Club',
    location: '广东 · 肇庆',
    detail: '会所外墙整体翻新，米白色饰面。',
    image: '/assets/cases/case-zhaoqing.jpg',
  },
  {
    id: 'shenzhen',
    title: '深圳市宝安区溪头工业园外墙',
    en: "Shenzhen · Bao'an Industrial Park",
    location: '广东 · 深圳',
    detail: '工业园外墙项目，旧墙直接施工，不做整面铲除；先做样板墙确认颜色与质感，再批量施工。',
    image: '/assets/cases/case-shenzhen.jpg',
  },
  {
    id: 'anxi',
    title: '安溪官岭外墙 · 广州宾馆内墙',
    en: 'Anxi & Guangzhou',
    location: '福建 · 安溪 / 广东 · 广州',
    detail: '项目覆盖老旧外墙翻新与酒店内墙改造，对基面处理、施工条件与验收口径的要求都不同。',
    image: '/assets/cases/case-anxi.jpg',
  },
]

export const CASE_NOTE =
  '集团在内外墙材料上的工程经验，同样服务于胶水的现场应用：我们熟悉家具厂与工地的施工条件，知道哪些参数必须写进工艺卡。同样的现场经验用在胶水上——先打样、再上产线。'

export interface PolicyItem {
  no: string
  title: string
  desc: string
}

export const POLICIES: PolicyItem[] = [
  {
    no: '01',
    title: '《「十四五」建筑节能与绿色建筑发展规划》',
    desc: '到 2025 年新建建筑全面执行绿色建筑标准，绿色建材应用比例超过 70%。',
  },
  {
    no: '02',
    title: '《绿色建材产业高质量发展实施方案》',
    desc: '推动涂料与胶粘剂向水性、无溶剂方向转型。',
  },
  {
    no: '03',
    title: '《建筑防火通用规范》GB 55037-2022（全文强制）',
    desc: '人员密集场所装饰材料燃烧性能要求提高，油性材料受限。',
  },
  {
    no: '04',
    title: '《民用建筑工程室内环境污染控制标准》GB 50325-2020',
    desc: '室内 VOC 限量持续收紧，水性与无溶剂产品更易达标。',
  },
]

export const VOC_POINTS: PolicyItem[] = [
  {
    no: '01',
    title: '《民用建筑工程室内环境污染控制标准》GB 50325-2020',
    desc: 'VOC 限量再收紧；水性胶粘剂更容易满足室内验收要求。',
  },
  {
    no: '02',
    title: '《挥发性有机物治理攻坚方案》',
    desc: '推广低（无）VOC 原辅材料替代，鼓励水性体系。',
  },
  {
    no: '03',
    title: '《产业结构调整指导目录（2024 年本）》',
    desc: '低 VOC、环境友好型产品列入鼓励类。',
  },
  {
    no: '04',
    title: '地方落地政策（广东等地）',
    desc: '对绿色建材应用与清洁生产给予支持，采购侧优先选择低排放产品。',
  },
]

export const POLICY_NOTE =
  '政策的方向很清楚：从溶剂型转向水性，从高 VOC 转向低排放。对家具厂的实际影响是：水性胶、低气味、可核查的检测报告，正在成为验厂与验收的常规项。'

export const POLICY_DISCLAIMER = '以上为民用与建筑领域的公开政策口径，具体条款以官方发布原文为准。'

export interface SampleStep {
  no: string
  title: string
  desc: string
}

export const SAMPLE_STEPS: SampleStep[] = [
  { no: '01', title: '你告诉我们工况', desc: '基材、涂胶方式与验收标准。' },
  { no: '02', title: '我们寄样给你', desc: '按型号寄样品与技术资料。' },
  { no: '03', title: '你上机试胶', desc: '用你的基材与设备做样块。' },
  { no: '04', title: '合格再谈批量', desc: '确认型号、价格与交期。' },
]

export const SAMPLE_NOTES: string[] = [
  '样品由我们寄出，不需要你先寄基材；如果基材特殊，也可以同步寄一小块给我们试配。',
  '常用验收口径：涂胶后 65℃ 水煮 3 小时，胶层不开裂。',
  '寄样与试胶不收费，运输方式按地区协商。',
]

export interface CustomItem {
  id: string
  title: string
  en: string
  desc: string
}

export const CUSTOMIZATION: CustomItem[] = [
  {
    id: 'packing',
    title: '包装定制',
    en: 'Packaging',
    desc: '20 / 25 / 50 / 220 / 1200 kg 五种桶装规格；AB 胶与青红胶为 2 kg/组。',
  },
  {
    id: 'label',
    title: '标签与贴牌',
    en: 'Private label',
    desc: '中英文包装可做，客户品牌桶与标签可做，适合贸易商与自有品牌。',
  },
  {
    id: 'formula',
    title: '配方调整',
    en: 'Formulation',
    desc: '按客户基材与工艺调整配方；起订量、加价与交期按项目确认后报价。',
  },
]

export const CUSTOMIZATION_NOTE =
  '标准型号按目录价直接下单；定制项确认包装、标签与配方后出具正式报价单。'

export const QUOTE_NOTE = '本册为对外参考报价，以下单当期报价单为准。'
