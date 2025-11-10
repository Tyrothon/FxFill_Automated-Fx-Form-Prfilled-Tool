export const BANK_ALIASES = [
  { canonical: 'Bank of China', aliases: ['bank of china', 'boc', '中国银行'] },
  { canonical: 'Industrial and Commercial Bank of China', aliases: ['industrial and commercial bank of china', 'icbc', '中国工商银行', 'industrial & commercial bank of china'] },
  { canonical: 'China Construction Bank', aliases: ['china construction bank', 'ccb', '中国建设银行'] },
  { canonical: 'Agricultural Bank of China', aliases: ['agricultural bank of china', 'abc', '中国农业银行'] },
  { canonical: 'Bank of Communications', aliases: ['bank of communications', 'bocom', '交通银行', 'bank of communication'] },
  { canonical: 'China Merchants Bank', aliases: ['china merchants bank', 'cmb', '招商银行'] },
  { canonical: 'Postal Savings Bank of China', aliases: ['postal savings bank of china', 'psbc', '中国邮政储蓄银行', '邮储银行'] },
  { canonical: 'China Everbright Bank', aliases: ['china everbright bank', 'ceb', '中国光大银行', '光大银行'] },
  { canonical: 'China Minsheng Bank', aliases: ['china minsheng bank', 'cmbc', '中国民生银行', '民生银行'] },
  { canonical: 'Shanghai Pudong Development Bank', aliases: ['shanghai pudong development bank', 'spdb', '浦发银行', '上海浦东发展银行'] },
  { canonical: 'Ping An Bank', aliases: ['ping an bank', 'pab', '平安银行'] },
  { canonical: 'Bank of Beijing', aliases: ['bank of beijing', 'bob', '北京银行'] },
  { canonical: 'Bank of Shanghai', aliases: ['bank of shanghai', 'bos', '上海银行'] },
  { canonical: 'Bank of Jiangsu', aliases: ['bank of jiangsu', 'bjos', '江苏银行'] },
  { canonical: 'Bank of Ningbo', aliases: ['bank of ningbo', 'bon', '宁波银行'] },
  { canonical: 'Bank of Nanjing', aliases: ['bank of nanjing', 'bonj', '南京银行'] },
  { canonical: 'Bank of Hangzhou', aliases: ['bank of hangzhou', 'bohz', '杭州银行'] },
  { canonical: 'Bank of Qingdao', aliases: ['bank of qingdao', 'boqd', '青岛银行'] },
  { canonical: 'Bank of Guangzhou', aliases: ['bank of guangzhou', 'bogz', '广州银行'] },
  { canonical: 'Bank of Tianjin', aliases: ['bank of tianjin', 'tianjin bank', 'tjcb', '天津银行'] },
  { canonical: 'Bank of Dalian', aliases: ['bank of dalian', 'dalian bank', '大连银行'] },
  { canonical: 'Bank of Chengdu', aliases: ['bank of chengdu', 'chengdu bank', '成都银行'] },
  { canonical: 'Bank of Chongqing', aliases: ['bank of chongqing', 'chongqing bank', '重庆银行'] },
  { canonical: 'Bank of Xiamen', aliases: ['bank of xiamen', 'xiamen bank', '厦门银行'] },
  { canonical: 'Bank of Kunlun', aliases: ['bank of kunlun', 'kunlun bank', '昆仑银行'] },
  { canonical: 'Bank of Zhuhai', aliases: ['bank of zhuhai', 'zhuhai bank', '珠海银行'] },
  { canonical: 'Bank of Guiyang', aliases: ['bank of guiyang', 'guiyang bank', '贵阳银行'] },
  { canonical: 'Bank of Yantai', aliases: ['bank of yantai', 'yantai bank', '烟台银行'] },
  { canonical: 'Standard Chartered Bank', aliases: ['standard chartered bank', 'standard chartered', '渣打银行'] },
  { canonical: 'HSBC', aliases: ['hsbc', 'hongkong and shanghai banking corporation', '汇丰银行'] },
  { canonical: 'Citibank', aliases: ['citibank', 'citi', '花旗银行'] }
];

function clean(s) { return String(s || '').toLowerCase(); }

function findBase(cleaned) {
  for (const item of BANK_ALIASES) {
    const candidates = [item.canonical, ...item.aliases];
    for (const c of candidates) {
      if (cleaned.includes(c.toLowerCase())) {
        return item.canonical;
      }
    }
  }
  return '';
}

import { canonicalizeBranchLocation, getLocationOptionsFromEnv } from './locationDictionary'
function extractBranch(raw) {
  const cleaned = String(raw || '').replace(/\s{2,}/g, ' ').trim();
  const patterns = [
    /,\s*([A-Za-z\u4e00-\u9fa5\s\-()]+?)\s*(Sub-?Branch|Branch)/i,
    /([A-Za-z\u4e00-\u9fa5\s\-()]+?)\s*(分行|支行|营业部)/,
    /([A-Za-z\u4e00-\u9fa5\s\-()]+?)\s*Head\s*Office/i
  ];
  const opts = getLocationOptionsFromEnv();
  for (const p of patterns) {
    const m = cleaned.match(p);
    if (m) {
      const area = canonicalizeBranchLocation(m[1].trim().replace(/\s{2,}/g, ' '), opts);
      const indicator = m[2] || '';
      let suffix = 'Branch';
      if (/营业部/.test(indicator)) suffix = opts.mode === 'zh' ? '营业部' : 'Business Department';
      else if (/Head\s*Office/i.test(indicator)) suffix = opts.mode === 'zh' ? '总行' : 'Head Office';
      else if (/Sub-?Branch/i.test(indicator) || /分行|支行/.test(indicator)) suffix = opts.mode === 'zh' ? '支行' : 'Branch';
      return `${area} ${suffix}`.replace(/[，,]+/g, ', ').replace(/\s{2,}/g, ' ');
    }
  }
  const m2 = cleaned.match(/Branch\s*of\s*([A-Za-z\u4e00-\u9fa5\s\-()]+)/i);
  if (m2) {
    const area = canonicalizeBranchLocation(m2[1].trim(), opts);
    return `${area} ${opts.mode === 'zh' ? '支行' : 'Branch'}`;
  }
  return '';
}

export function canonicalizeBankName(name) {
  const cleaned = String(name || '').replace(/[\t\n]+/g, ' ').trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  const hit = BANK_ALIASES.find(b => b.aliases.some(a => lower.includes(a)));
  const base = hit ? hit.canonical : cleaned;
  const branch = extractBranch(cleaned);
  return branch ? `${base}, ${branch}` : base;
}

// Optional metadata for banks to support templates and auto-fill.
// Extend this map gradually; consumers should treat all fields as optional.
export const BANK_META = {
  'Standard Chartered Bank': {
    country: 'HK',
    defaultCurrency: 'USD',
    swift: 'SCBLHKHHXXX',
    accountFormatHint: '12-16 digits (varies)',
    routingScheme: 'SWIFT'
  },
  'HSBC': {
    country: 'HK',
    defaultCurrency: 'USD',
    swift: 'HSBCHKHHHKH',
    accountFormatHint: '9-12 digits',
    routingScheme: 'SWIFT'
  },
  'Bank of China': {
    country: 'CN',
    defaultCurrency: 'CNY',
    swift: 'BKCHCNBJ',
    accountFormatHint: 'Domestic CN account',
    routingScheme: 'CN-Domestic'
  }
};