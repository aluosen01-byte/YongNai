/**
 * 产品数据 —— 全部取自《永耐胶水 · 中英宣传册 20261028》
 * 九个系列 / 十七个在售型号。
 */

export interface ProductSeries {
  id: string
  name: string
  en: string
  desc: string
}

export interface Product {
  model: string
  name: string
  seriesId: string
  seriesName: string
  image: string
  usage: string
  usageEn: string
  packing: string
  solid?: string
  wood?: string
  cure?: string
  tags: string[]
  points: string[]
  keywords: string
}

export const SERIES: ProductSeries[] = [
  {
    id: 'emulsion',
    name: '白乳胶',
    en: 'White Emulsion',
    desc: '水性单组分，家具组装与 45° 拼角的主力胶种，开桶即用。',
  },
  {
    id: 'lamination',
    name: '拼板胶',
    en: 'Lamination',
    desc: '按木种细分为四个型号，普通木、硬木、松木各有对应选择。',
  },
  {
    id: 'yellow',
    name: '黄胶',
    en: 'Yellow Glue',
    desc: '以固含量分档，含胶量越高单位重量有效成分越多。',
  },
  {
    id: 'pressing',
    name: '压板胶',
    en: 'Pressing',
    desc: '压板、贴纸工序用胶，兼顾胶层控制与批量稳定。',
  },
  {
    id: 'veneer',
    name: '木皮胶',
    en: 'Veneer',
    desc: '热压高温贴木皮，胶层耐热、贴合平整。',
  },
  {
    id: 'hotmelt',
    name: '热熔胶',
    en: 'Hot-melt',
    desc: '胶粒形态，高温与中温两档，适配不同封边机型。',
  },
  {
    id: 'ab',
    name: 'AB 胶',
    en: 'AB Glue',
    desc: '双组分结构胶，按产线节拍在 2 小时与 4 小时之间选择。',
  },
  {
    id: 'epoxy',
    name: '青红胶',
    en: 'Marble Epoxy',
    desc: '石材粘接专用，双组分按配比混合。',
  },
  {
    id: 'hardener',
    name: '固化剂',
    en: 'Hardener',
    desc: '德国进口架桥剂，按工艺比例加入拼板胶或白乳胶。',
  },
]

export const RAW_PRODUCTS: Product[] = [
  {
    model: 'SL-101',
    name: '白乳胶',
    seriesId: 'emulsion',
    seriesName: '白乳胶',
    image: '/assets/products/SL-101.jpg',
    usage: '家具组装、阻力胶',
    usageEn: 'Furniture assembly',
    packing: '20–1200 kg',
    tags: ['组装'],
    points: ['单组分水性体系，开桶即用', '水性、非易燃易爆', '建议 5℃ 以上施工，木材含水率 8%~12%'],
    keywords: '白乳胶 组装 阻力胶 家具 拼角 sl101',
  },
  {
    model: 'SL-360',
    name: '阻力胶 / 45° 组装胶',
    seriesId: 'emulsion',
    seriesName: '白乳胶',
    image: '/assets/products/SL-360.jpg',
    usage: '家具组装、45° 组装胶',
    usageEn: 'Assembly & 45° joints',
    packing: '20–1200 kg',
    tags: ['组装'],
    points: ['针对 45° 拼角与大面组装', '初粘与填充兼顾', '建议 5℃ 以上施工，木材含水率 8%~12%'],
    keywords: '阻力胶 45度 拼角 组装 家具 sl360',
  },
  {
    model: 'SL-286',
    name: '压板胶 / 贴纸胶',
    seriesId: 'pressing',
    seriesName: '压板胶',
    image: '/assets/products/SL-286.jpg',
    usage: '压板、贴纸',
    usageEn: 'Pressing & paper lamination',
    packing: '50 kg',
    tags: ['压板', '贴纸'],
    points: ['压板与贴纸工序通用', '50 kg 桶装，适合中批量产线', '胶层厚度可通过辊涂设备稳定控制'],
    keywords: '压板 贴纸 贴面 密度板 多层板 sl286',
  },
  {
    model: 'SL-111',
    name: '拼板胶',
    seriesId: 'lamination',
    seriesName: '拼板胶',
    image: '/assets/products/SL-111.jpg',
    usage: '软木、杂木拼板',
    usageEn: 'Hardwood & common wood',
    packing: '20–1200 kg',
    wood: '软木、杂木',
    tags: ['拼板'],
    points: ['普通木、杂木的通用选择', '性价比高，适合常规批量', '可用 65℃ 水煮 3 小时不开裂口径验收'],
    keywords: '拼板 杂木 软木 普通木 sl111',
  },
  {
    model: 'SL-112',
    name: '拼板胶',
    seriesId: 'lamination',
    seriesName: '拼板胶',
    image: '/assets/products/SL-112.jpg',
    usage: '硬杂木拼板',
    usageEn: 'Premium wood',
    packing: '20–1200 kg',
    wood: '硬杂木',
    tags: ['拼板'],
    points: ['面向硬杂木的强度档位', '适合对胶层耐候有要求的工况', '如需更高性能可升级 SL-113'],
    keywords: '拼板 硬杂木 硬木 sl112',
  },
  {
    model: 'SL-113',
    name: '拼板胶',
    seriesId: 'lamination',
    seriesName: '拼板胶',
    image: '/assets/products/SL-113.jpg',
    usage: '硬木、油木、高端木（性能优于 SL-112）',
    usageEn: 'Premium wood, higher performance',
    packing: '20–1200 kg',
    wood: '硬木、油木、高端木',
    tags: ['拼板'],
    points: ['性能优于 SL-112', '油木等难粘木种的优先选项', '高端家具、出口订单常用档位'],
    keywords: '拼板 硬木 油木 高端木 sl113',
  },
  {
    model: 'SL-201',
    name: '拼板胶',
    seriesId: 'lamination',
    seriesName: '拼板胶',
    image: '/assets/products/SL-201.jpg',
    usage: '松木、软木拼板',
    usageEn: 'Pine & softwood',
    packing: '20–1200 kg',
    wood: '松木、软木',
    tags: ['拼板'],
    points: ['针对松木、软木的低密度与含脂特性', '减少软质木材的透胶与凹陷', '按 65℃ 水煮 3 小时口径验收'],
    keywords: '拼板 松木 软木 杉木 sl201',
  },
  {
    model: 'SL-730',
    name: '黄胶',
    seriesId: 'yellow',
    seriesName: '黄胶',
    image: '/assets/products/SL-730.jpg',
    usage: '经济档黄胶',
    usageEn: 'Standard grade',
    packing: '20–1200 kg',
    solid: '40%~45%',
    tags: ['通用'],
    points: ['固含量 40%~45%，经济档', '含胶量低于 740 / 750，价格档位更低', '适合对含胶量要求不高的常规用胶'],
    keywords: '黄胶 固含量 经济 sl730',
  },
  {
    model: 'SL-740',
    name: '黄胶',
    seriesId: 'yellow',
    seriesName: '黄胶',
    image: '/assets/products/SL-740.jpg',
    usage: '标准档黄胶',
    usageEn: 'Standard grade',
    packing: '20–1200 kg',
    solid: '45%~50%',
    tags: ['通用'],
    points: ['固含量 45%~50%，标准档', '含胶量与成本的平衡点', '常备库存型号'],
    keywords: '黄胶 固含量 标准 sl740',
  },
  {
    model: 'SL-750',
    name: '黄胶',
    seriesId: 'yellow',
    seriesName: '黄胶',
    image: '/assets/products/SL-750.jpg',
    usage: '高固含档黄胶',
    usageEn: 'High solid grade',
    packing: '20–1200 kg',
    solid: '50%~55%',
    tags: ['通用'],
    points: ['固含量 50%~55%，高固含档', '单位重量有效成分最多', '价格档位最高，按用胶量核算更划算'],
    keywords: '黄胶 高固含 固含量 sl750',
  },
  {
    model: 'SL-901',
    name: 'AB 胶',
    seriesId: 'ab',
    seriesName: 'AB 胶',
    image: '/assets/products/SL-901.jpg',
    usage: '组装胶，4 小时后可进下道工序',
    usageEn: '4 h to next process',
    packing: '2 kg / 组',
    cure: '约 4 小时',
    tags: ['组装'],
    points: ['双组分按配比混合使用', '可操作时间更长，适合大件与慢节拍', '4 小时后可进下道工序'],
    keywords: 'ab胶 双组分 组装 慢干 sl901',
  },
  {
    model: 'SL-902',
    name: 'AB 胶',
    seriesId: 'ab',
    seriesName: 'AB 胶',
    image: '/assets/products/SL-902.jpg',
    usage: '组装胶，2 小时后可进下道工序',
    usageEn: '2 h to next process',
    packing: '2 kg / 组',
    cure: '约 2 小时',
    tags: ['组装'],
    points: ['双组分按配比混合使用', '固化更快，适合赶节拍的产线', '2 小时后可进下道工序'],
    keywords: 'ab胶 双组分 组装 快干 节拍 sl902',
  },
  {
    model: 'SL-518',
    name: '青红胶',
    seriesId: 'epoxy',
    seriesName: '青红胶',
    image: '/assets/products/SL-518.jpg',
    usage: '大理石粘接',
    usageEn: 'Marble bonding',
    packing: '2 kg / 组',
    tags: ['石材'],
    points: ['双组分按配比混合', '大理石、石材拼缝粘接', '青红两剂分装，便于核对配比'],
    keywords: '青红胶 大理石 石材 粘接 sl518',
  },
  {
    model: 'SL-128',
    name: '贴木皮胶',
    seriesId: 'veneer',
    seriesName: '木皮胶',
    image: '/assets/products/SL-128.jpg',
    usage: '热压高温贴木皮胶',
    usageEn: 'Hot-press veneer glue',
    packing: '50 kg / 桶',
    tags: ['贴木皮'],
    points: ['热压高温工艺下贴合', '木皮胶层耐热、不易起鼓', '可配合 PH-7 固化剂提升耐水'],
    keywords: '木皮胶 贴木皮 热压 高温 sl128',
  },
  {
    model: 'SL-4350',
    name: '高温热熔胶粒',
    seriesId: 'hotmelt',
    seriesName: '热熔胶',
    image: '/assets/products/SL-4350.jpg',
    usage: '高温热熔胶粒，封边用',
    usageEn: 'High-temp hot-melt pellets',
    packing: '25 kg / 包',
    tags: ['封边'],
    points: ['高温档胶粒，适配高温封边机', '25 kg 纸袋包装，便于上料', '封边工序用胶，出胶稳定'],
    keywords: '热熔胶 胶粒 高温 封边 sl4350',
  },
  {
    model: 'SL-4360',
    name: '中温热熔胶粒',
    seriesId: 'hotmelt',
    seriesName: '热熔胶',
    image: '/assets/products/SL-4360.jpg',
    usage: '中温热熔胶粒，封边用',
    usageEn: 'Mid-temp hot-melt pellets',
    packing: '25 kg / 包',
    tags: ['封边'],
    points: ['中温档胶粒，适配常规封边机型', '工作温度低于高温档，能耗与气味更低', '25 kg 纸袋包装'],
    keywords: '热熔胶 胶粒 中温 封边 sl4360',
  },
  {
    model: 'PH-7',
    name: '固化剂（架桥剂）',
    seriesId: 'hardener',
    seriesName: '固化剂',
    image: '/assets/products/PH-7.jpg',
    usage: '拼板胶 / 白乳胶调和，提升耐水',
    usageEn: 'Hardener / cross-linker',
    packing: '按包装另议',
    tags: ['辅助'],
    points: ['德国进口架桥剂', '按型号工艺比例添加，不要自行加量', '价格随行就市，报价前请确认当期价格'],
    keywords: '固化剂 架桥剂 ph7 进口 耐水',
  },
]

const SERIES_ORDER: Record<string, number> = SERIES.reduce<Record<string, number>>(
  (acc, item, i) => {
    acc[item.id] = i
    return acc
  },
  {}
)

/** 取系列排序位次；未知系列排到最后 */
const seriesRank = (item: Product): number => {
  const rank = SERIES_ORDER[item.seriesId]
  return rank === undefined ? 99 : rank
}

/** 按系列顺序排列，避免「全部」列表里各系列互相穿插 */
export const PRODUCTS: Product[] = RAW_PRODUCTS.slice().sort(
  (a, b) => seriesRank(a) - seriesRank(b)
)

/** 按型号取产品 */
export function findProduct(model: string): Product | undefined {
  return PRODUCTS.find((item) => item.model === model)
}

// ---------------------------------------------------------------------------
// 选胶助手：工况 -> 型号（对应宣传册「按基材选胶」一页的选型口径）
// ---------------------------------------------------------------------------

export interface Scenario {
  id: string
  title: string
  en: string
  hint: string
  picks: string[]
  reason: string
  note?: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'assembly',
    title: '家具组装 · 45° 拼角',
    en: 'Assembly',
    hint: '出榫、拼角、定线',
    picks: ['SL-360', 'SL-101'],
    reason: '单组分水性，开桶即用。45° 拼角与大面组装优先 SL-360，常规组装配 SL-101。',
    note: '建议 5℃ 以上施工，木材含水率控制在 8%~12%。',
  },
  {
    id: 'assembly-fast',
    title: '赶节拍组装',
    en: 'Fast cure',
    hint: '2 小时进下道工序',
    picks: ['SL-902', 'SL-901'],
    reason: '双组分按配比混合。SL-902 约 2 小时可进下道工序，SL-901 约 4 小时，按产线节拍选。',
    note: '双组分须按配比混合，混合后请在可操作时间内用完。',
  },
  {
    id: 'laminate-common',
    title: '拼板 · 普通木 / 杂木',
    en: 'Common wood',
    hint: '橡胶木、桦木、杂木',
    picks: ['SL-111'],
    reason: '软木与杂木通用型号，性价比高，适合常规批量拼板。',
    note: '可按 65℃ 水煮 3 小时胶层不开裂的验收口径寄样验证。',
  },
  {
    id: 'laminate-premium',
    title: '拼板 · 硬木 / 高端木',
    en: 'Premium wood',
    hint: '橡木、胡桃木、油木',
    picks: ['SL-113', 'SL-112'],
    reason: 'SL-113 性能优于 SL-112，油木等难粘木种优先选 113；一般硬杂木可用 112。',
    note: '高端家具与出口订单常用档位，建议先做样块确认。',
  },
  {
    id: 'laminate-pine',
    title: '拼板 · 松木 / 软木',
    en: 'Pine & softwood',
    hint: '松木、杉木等软质木材',
    picks: ['SL-201'],
    reason: '针对松木软木的低密度与含脂特性选型，减少透胶与凹陷。',
    note: '软质木材注意控制压合压力与涂胶量。',
  },
  {
    id: 'press',
    title: '压板 · 贴纸',
    en: 'Pressing',
    hint: '板材压合、贴纸、贴面',
    picks: ['SL-286'],
    reason: '压板与贴纸工序通用，50 kg 桶装适合中批量产线。',
    note: '胶合强度对涂胶均匀性最敏感，建议用称重法抽检 g/m²。',
  },
  {
    id: 'veneer',
    title: '贴木皮',
    en: 'Veneer',
    hint: '热压高温贴木皮',
    picks: ['SL-128', 'PH-7'],
    reason: '热压高温工艺下贴合，胶层耐热不易起鼓；需要更高耐水时配合 PH-7 固化剂。',
    note: 'PH-7 添加比例按型号工艺执行，不要自行加量。',
  },
  {
    id: 'edge',
    title: '封边',
    en: 'Edge banding',
    hint: '板式家具封边机',
    picks: ['SL-4350', 'SL-4360'],
    reason: '高温胶粒适配高温封边机，中温胶粒适配常规机型，按设备工作温度选。',
    note: '25 kg / 包，注意胶箱温度与上料节奏的匹配。',
  },
  {
    id: 'stone',
    title: '石材 · 大理石粘接',
    en: 'Stone',
    hint: '大理石、石材拼缝',
    picks: ['SL-518'],
    reason: '青红胶双组分，按配比混合后粘接大理石与石材。',
    note: '2 kg / 组，青红两剂分装，便于核对配比。',
  },
  {
    id: 'yellow',
    title: '黄胶 · 按固含量选型',
    en: 'Yellow glue',
    hint: '按预算与含胶量选档',
    picks: ['SL-740', 'SL-750', 'SL-730'],
    reason: '黄胶的型号差异核心是固含量：740 为 45%~50%，750 为 50%~55%，730 为 40%~45%。',
    note: '含胶量越高单位重量有效成分越多，价格档位也越高，按预算与用胶量选档。',
  },
]

export interface ApplyMethod {
  id: string
  name: string
  en: string
  uniformity: string
  consumption: string
  efficiency: string
  scope: string
}

export const APPLY_METHODS: ApplyMethod[] = [
  {
    id: 'manual',
    name: '手工刷胶',
    en: 'Manual brush',
    uniformity: '依赖手感',
    consumption: '偏高约 10%~20%',
    efficiency: '效率低，投入低',
    scope: '小批量、异形件、修补',
  },
  {
    id: 'roller',
    name: '滚筒 / 刮板',
    en: 'Roller / scraper',
    uniformity: '较均匀，可控制胶层',
    consumption: '较低',
    efficiency: '效率中，投入低',
    scope: '平面板材、中等批量',
  },
  {
    id: 'machine',
    name: '机械辊涂 / 淋涂',
    en: 'Machine coating',
    uniformity: '均匀，可稳定复制',
    consumption: '最低',
    efficiency: '效率高，投入高',
    scope: '大批量平板、封边',
  },
]

export const ACCEPTANCE_NOTE = '常用验收口径：涂胶后 65℃ 水煮 3 小时，胶层不开裂。'
export const COATING_NOTE = '胶合强度对涂胶均匀性最敏感，建议用称重法抽检 g/m²。'
